const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST: Process payment
router.post('/process', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      order_id,
      payment_method,
      amount,
      transaction_id
    } = req.body;
    
    // Create payment record
    const [paymentResult] = await connection.execute(
      `INSERT INTO payments (order_id, payment_method, amount, transaction_id, payment_status)
       VALUES (?, ?, ?, ?, 'completed')`,
      [order_id, payment_method, amount, transaction_id || null]
    );
    
    // Update order status
    await connection.execute(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      ['Processing', order_id]
    );
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: paymentResult.insertId,
        order_id,
        amount
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// GET: Get payment QR code information
router.get('/qr/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order info by order_code
    const [orders] = await pool.execute(
      `SELECT order_id, order_code, customer_name, customer_email, customer_phone,
              total_amount, payment_method, order_status
       FROM orders WHERE order_code = ?`,
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }
    
    const order = orders[0];
    
    // Generate QR code data
    const qrData = {
      order_code: order.order_code,
      amount: order.total_amount,
      customer_name: order.customer_name,
      payment_method: order.payment_method
    };
    
    const transferContent = `${order.order_code} ${order.customer_name}`;
    
    res.json({
      success: true,
      data: {
        order_code: order.order_code,
        order_id: order.order_id,
        amount: order.total_amount,
        payment_method: order.payment_method,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`,
        transfer_content: transferContent,
        bank_info: {
          bank_name: 'Vietcombank',
          account_no: '1234567890',
          account_name: 'LAG VINTAGE SHOP',
          content: transferContent
        },
        instructions: [
          'Mở ứng dụng Mobile Banking của bạn',
          'Chọn chức năng quét mã QR hoặc chuyển khoản',
          'Quét mã QR hoặc nhập thông tin chuyển khoản bên trên',
          'Kiểm tra kỹ thông tin và số tiền',
          'Xác nhận thanh toán',
          'Chờ hệ thống xác nhận (tự động trong vài phút)'
        ]
      }
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo mã QR thanh toán',
      error: error.message
    });
  }
});

// GET: Verify payment status
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order info by order_code
    const [orders] = await pool.execute(
      `SELECT order_id, order_code, order_status, payment_method, total_amount
       FROM orders WHERE order_code = ?`,
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }
    
    const order = orders[0];
    
    // Check if paid
    const isPaid = ['Processing', 'Shipping', 'Delivered'].includes(order.order_status);
    
    res.json({
      success: true,
      data: {
        order_code: order.order_code,
        order_id: order.order_id,
        status: order.order_status,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
        is_paid: isPaid,
        message: isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra trạng thái thanh toán',
      error: error.message
    });
  }
});

// GET: Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payments[0]
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
});

// GET: Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE payment_id = ?',
      [id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payments[0]
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
});

// PUT: Update payment status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
      [payment_status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

module.exports = router;