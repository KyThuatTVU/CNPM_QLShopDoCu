// =============================================
// PRODUCTS ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET: Lấy tất cả sản phẩm (với filter, search, pagination)
router.get('/', async (req, res) => {
    try {
        const { 
            category_id, 
            search, 
            min_price, 
            max_price, 
            sort = 'created_at', 
            order = 'DESC',
            limit = 50,
            page = 1 
        } = req.query;

        let query = `
            SELECT p.*, c.category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE 1=1
        `;
        const params = [];

        // Filter theo category
        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        // Search theo tên hoặc mô tả
        if (search) {
            query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter theo giá
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
        }

        // Sắp xếp
        const allowedSorts = ['product_name', 'price', 'created_at', 'stock_quantity'];
        const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY p.${sortField} ${sortOrder}`;

        // Phân trang
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [products] = await pool.query(query, params);

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query(
            `SELECT p.*, c.category_name 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.product_id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: products[0]
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// POST: Tạo sản phẩm mới (Admin)
router.post('/', async (req, res) => {
    try {
        const {
            product_name,
            description,
            price,
            stock_quantity,
            category_id,
            image_url
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO products (product_name, description, price, stock_quantity, category_id, image_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [product_name, description, price, stock_quantity, category_id, image_url]
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// PUT: Cập nhật sản phẩm (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            description,
            price,
            stock_quantity,
            category_id,
            image_url
        } = req.body;

        const [result] = await pool.query(
            `UPDATE products 
             SET product_name = ?, description = ?, price = ?, 
                 stock_quantity = ?, category_id = ?, image_url = ?
             WHERE product_id = ?`,
            [product_name, description, price, stock_quantity, category_id, image_url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// DELETE: Xóa sản phẩm (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM products WHERE product_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

module.exports = router;
