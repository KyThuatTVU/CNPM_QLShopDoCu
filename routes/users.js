// =============================================
// USERS ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'lag-vintage-shop-secret-key-2024';

// GET: Lấy danh sách tất cả users
router.get('/', async (req, res) => {
    try {
        const { role, status } = req.query;
        
        let query = 'SELECT user_id, email, full_name, phone, role, status, created_at, last_login FROM users WHERE 1=1';
        const params = [];
        
        // Lọc theo role
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        
        // Lọc theo status
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [users] = await pool.query(query, params);
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// POST: Đăng ký user mới
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        
        // Kiểm tra user đã tồn tại
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tạo user mới
        const [result] = await pool.query(
            'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone]
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user_id: result.insertId,
                email,
                full_name
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
});

// POST: Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Tìm user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const user = users[0];
        
        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Tạo JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Cập nhật last_login
        await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// GET: Lấy thông tin user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [users] = await pool.query(
            'SELECT user_id, email, full_name, phone, role, status, created_at FROM users WHERE user_id = ?',
            [id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// PUT: Cập nhật thông tin user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, email } = req.body;
        
        const [result] = await pool.query(
            'UPDATE users SET full_name = ?, phone = ?, email = ? WHERE user_id = ?',
            [full_name, phone, email, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// PUT: Đổi mật khẩu
router.put('/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { old_password, new_password } = req.body;
        
        // Lấy password hiện tại
        const [users] = await pool.query('SELECT password FROM users WHERE user_id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Kiểm tra old password
        const isPasswordValid = await bcrypt.compare(old_password, users[0].password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Update password
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, id]);
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
});

module.exports = router;
