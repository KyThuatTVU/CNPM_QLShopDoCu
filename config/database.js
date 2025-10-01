// =============================================
// KẾT NỐI MYSQL DATABASE - LAG VINTAGE SHOP
// =============================================

require('dotenv').config(); // Load biến môi trường từ .env
const mysql = require('mysql2');

// Cấu hình kết nối database từ .env
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'TVU@842004',
    database: process.env.DB_NAME || 'lag_vintage_shop',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',          // Hỗ trợ tiếng Việt
    timezone: '+07:00'           // Múi giờ Việt Nam
};

// Tạo connection pool (khuyến nghị cho production)
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,    // Chờ kết nối nếu pool đầy
    connectionLimit: 10,         // Số kết nối tối đa
    queueLimit: 0,              // Không giới hạn queue
    enableKeepAlive: true,      // Giữ kết nối
    keepAliveInitialDelay: 0
});

// Promise wrapper để sử dụng async/await
const promisePool = pool.promise();

// Test kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
        
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('   Mất kết nối database.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('   Database có quá nhiều kết nối.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('   Kết nối database bị từ chối. Kiểm tra MySQL đã chạy chưa.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database "lag_vintage_shop" không tồn tại.');
            console.log('   👉 Chạy lệnh: mysql -u root -p < database_design.sql');
        }
    } else {
        console.log('✅ Kết nối database thành công!');
        console.log('   📦 Database: lag_vintage_shop');
        console.log('   🔗 Host: localhost:3306');
        connection.release(); // Giải phóng kết nối
    }
});

// Export pool để sử dụng trong các file khác
module.exports = {
    pool: promisePool,  // Export promisePool as pool (để dùng async/await)
    promisePool,        // Promise pool (dùng async/await)
    dbConfig           // Cấu hình (dùng cho testing)
};
