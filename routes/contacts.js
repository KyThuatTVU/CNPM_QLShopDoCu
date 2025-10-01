// =============================================
// CONTACTS ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET: Lấy tất cả tin nhắn liên hệ (Admin)
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        
        let query = 'SELECT * FROM contacts WHERE 1=1';
        const params = [];
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [contacts] = await pool.query(query, params);
        
        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts',
            error: error.message
        });
    }
});

// GET: Lấy chi tiết tin nhắn
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [contacts] = await pool.query(
            'SELECT * FROM contacts WHERE contact_id = ?',
            [id]
        );
        
        if (contacts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            data: contacts[0]
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact',
            error: error.message
        });
    }
});

// POST: Gửi tin nhắn liên hệ
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const [result] = await pool.query(
            'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );
        
        res.status(201).json({
            success: true,
            message: 'Contact message sent successfully',
            data: {
                contact_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

// PUT: Cập nhật trạng thái tin nhắn (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const allowedStatuses = ['new', 'read', 'replied'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const [result] = await pool.query(
            'UPDATE contacts SET status = ? WHERE contact_id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Contact status updated'
        });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
});

// DELETE: Xóa tin nhắn (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            'DELETE FROM contacts WHERE contact_id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact',
            error: error.message
        });
    }
});

module.exports = router;
