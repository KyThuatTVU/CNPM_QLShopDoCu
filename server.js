// =============================================
// SERVER NODEJS - LAG VINTAGE SHOP
// =============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./config/database');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARE
// =============================================

// CORS - Cho phép frontend truy cập API
app.use(cors({
    origin: '*', // Cho phép tất cả domain (development)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Static files (images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// =============================================
// API ROUTES
// =============================================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'LAG Vintage Shop API',
        version: '1.0',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders',
            users: '/api/users',
            contacts: '/api/contacts'
        }
    });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            message: 'Database connection successful',
            result: rows[0].result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// =============================================
// IMPORT API ROUTES
// =============================================

const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const usersRoutes = require('./routes/users');
const contactsRoutes = require('./routes/contacts');
const cartRoutes = require('./routes/cart');

app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/cart', cartRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// 404 Not Found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('🚀 LAG VINTAGE SHOP SERVER');
    console.log('========================================');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`📂 Static files: ${path.join(__dirname, 'images')}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log('========================================');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
