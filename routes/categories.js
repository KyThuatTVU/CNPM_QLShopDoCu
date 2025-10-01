// =============================================
// CATEGORIES ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET: Lấy tất cả danh mục
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories ORDER BY category_name ASC'
        );

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết danh mục
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE category_id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: categories[0]
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
});

// GET: Lấy sản phẩm theo danh mục
router.get('/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, page = 1 } = req.query;

        const offset = (page - 1) * limit;

        const [products] = await pool.query(
            `SELECT p.*, c.category_name 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.category_id = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// POST: Tạo danh mục mới (Admin)
router.post('/', async (req, res) => {
    try {
        const { category_name, description } = req.body;

        const [result] = await pool.query(
            'INSERT INTO categories (category_name, description) VALUES (?, ?)',
            [category_name, description]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
});

// PUT: Cập nhật danh mục (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;

        const [result] = await pool.query(
            'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
            [category_name, description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
});

// DELETE: Xóa danh mục (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM categories WHERE category_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
});

module.exports = router;
