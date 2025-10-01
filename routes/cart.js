// =============================================
// CART ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET: Lấy giỏ hàng của user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [cartItems] = await pool.query(
            `SELECT c.cart_id, c.user_id, c.product_id, c.quantity,
                    p.product_name, p.price, p.image_url, p.stock_quantity,
                    cat.category_name
             FROM cart c
             JOIN products p ON c.product_id = p.product_id
             LEFT JOIN categories cat ON p.category_id = cat.category_id
             WHERE c.user_id = ?`,
            [userId]
        );
        
        // Tính toán summary
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        const total = subtotal + shippingFee;
        
        res.json({
            success: true,
            count: cartItems.length,
            data: {
                items: cartItems,
                summary: {
                    subtotal,
                    shippingFee,
                    total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
});

// POST: Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id, quantity = 1 } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Kiểm tra sản phẩm tồn tại
        const [products] = await pool.query(
            'SELECT product_id, stock_quantity FROM products WHERE product_id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Kiểm tra tồn kho
        if (products[0].stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        const [existingItems] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existingItems.length > 0) {
            // Cập nhật số lượng
            const newQuantity = existingItems[0].quantity + parseInt(quantity);
            
            if (products[0].stock_quantity < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for requested quantity'
                });
            }

            await pool.query(
                'UPDATE cart SET quantity = ? WHERE cart_id = ?',
                [newQuantity, existingItems[0].cart_id]
            );

            res.json({
                success: true,
                message: 'Cart updated successfully',
                data: {
                    cart_id: existingItems[0].cart_id,
                    quantity: newQuantity
                }
            });
        } else {
            // Thêm mới
            const [result] = await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );

            res.status(201).json({
                success: true,
                message: 'Product added to cart',
                data: {
                    cart_id: result.insertId
                }
            });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
});

// PUT: Cập nhật số lượng trong giỏ hàng
router.put('/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        // Lấy thông tin cart item
        const [cartItems] = await pool.query(
            'SELECT c.*, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.cart_id = ?',
            [cartId]
        );

        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Kiểm tra tồn kho
        if (cartItems[0].stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        await pool.query(
            'UPDATE cart SET quantity = ? WHERE cart_id = ?',
            [quantity, cartId]
        );

        res.json({
            success: true,
            message: 'Cart updated successfully'
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart',
            error: error.message
        });
    }
});

// DELETE: Xóa sản phẩm khỏi giỏ hàng
router.delete('/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;

        const [result] = await pool.query(
            'DELETE FROM cart WHERE cart_id = ?',
            [cartId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
});

// DELETE: Xóa toàn bộ giỏ hàng của user
router.delete('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
});

module.exports = router;
