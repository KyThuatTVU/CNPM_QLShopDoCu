const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all orders (with optional status filter)
router.get('/', async (req, res) => {
  try {
    const { order_status } = req.query;
    
    let query = `
      SELECT o.*, 
        u.full_name, u.email, u.phone,
        GROUP_CONCAT(
          CONCAT(oi.product_name, ' (x', oi.quantity, ')')
          SEPARATOR ', '
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
    `;
    
    const params = [];
    
    if (order_status) {
      query += ' WHERE o.order_status = ?';
      params.push(order_status);
    }
    
    query += ' GROUP BY o.order_id ORDER BY o.order_date DESC';
    
    const [orders] = await pool.execute(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order with items
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.full_name, u.email, u.phone 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       WHERE o.order_id = ?`,
      [req.params.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [items] = await pool.execute(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [req.params.id]
    );
    
    res.json({
      ...orders[0],
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      user_id, 
      items, 
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_district,
      shipping_city,
      payment_method
    } = req.body;
    
    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || 
        !shipping_address || !shipping_district || !shipping_city || 
        !payment_method) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required customer information' });
    }
    
    if (!items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No items in order' });
    }
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT price, stock_quantity FROM products WHERE product_id = ?',
        [item.product_id]
      );
      
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      
      if (products[0].stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for product ${item.product_id}` 
        });
      }
      
      total += products[0].price * item.quantity;
    }
    
    // Generate order code
    const order_code = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Calculate shipping fee (default 30000 as per database)
    const shipping_fee = 30000;
    const final_total = total + shipping_fee;
    
    // Insert order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id, order_code, subtotal, shipping_fee, total_amount, order_status,
        customer_name, customer_email, customer_phone,
        shipping_address, shipping_district, shipping_city,
        payment_method, order_date
      ) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id || null,
        order_code,
        total,
        shipping_fee,
        final_total,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_district,
        shipping_city,
        payment_method
      ]
    );
    
    const order_id = orderResult.insertId;
    
    // Insert order items and update stock
    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT product_name, price, image_url FROM products WHERE product_id = ?',
        [item.product_id]
      );
      
      const product = products[0];
      const item_total = product.price * item.quantity;
      
      await connection.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_image,
          quantity, price, item_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          item.product_id,
          product.product_name,
          product.image_url,
          item.quantity,
          product.price,
          item_total
        ]
      );
      
      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Clear user cart if user_id provided
    if (user_id) {
      await connection.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [user_id]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id,
        order_code,
        subtotal: total,
        shipping_fee: shipping_fee,
        total_amount: final_total
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { order_status } = req.body;
    
    if (!order_status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    await pool.execute(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      [order_status, req.params.id]
    );
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (restore stock)
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get order items
    const [items] = await connection.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    
    // Restore stock
    for (const item of items) {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Delete order items
    await connection.execute(
      'DELETE FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    
    // Delete order
    await connection.execute(
      'DELETE FROM orders WHERE order_id = ?',
      [req.params.id]
    );
    
    await connection.commit();
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;