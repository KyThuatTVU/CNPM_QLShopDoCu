// =============================================
// TEST KẾT NỐI DATABASE
// =============================================

const { promisePool } = require('./config/database');

async function testConnection() {
    console.log('🔍 Đang kiểm tra kết nối database...\n');

    try {
        // Test 1: Kết nối cơ bản
        console.log('Test 1: Kết nối cơ bản');
        const [rows1] = await promisePool.query('SELECT 1 + 1 AS result');
        console.log('✅ Kết nối thành công! Result:', rows1[0].result);
        console.log('');

        // Test 2: Kiểm tra database
        console.log('Test 2: Kiểm tra database');
        const [rows2] = await promisePool.query('SELECT DATABASE() AS db_name');
        console.log('✅ Database hiện tại:', rows2[0].db_name);
        console.log('');

        // Test 3: Đếm số bảng
        console.log('Test 3: Kiểm tra các bảng');
        const [tables] = await promisePool.query('SHOW TABLES');
        console.log(`✅ Số bảng trong database: ${tables.length}`);
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
        });
        console.log('');

        // Test 4: Đếm dữ liệu
        console.log('Test 4: Kiểm tra dữ liệu');
        const [users] = await promisePool.query('SELECT COUNT(*) as count FROM users');
        const [categories] = await promisePool.query('SELECT COUNT(*) as count FROM categories');
        const [products] = await promisePool.query('SELECT COUNT(*) as count FROM products');
        const [orders] = await promisePool.query('SELECT COUNT(*) as count FROM orders');

        console.log(`✅ Số users: ${users[0].count}`);
        console.log(`✅ Số categories: ${categories[0].count}`);
        console.log(`✅ Số products: ${products[0].count}`);
        console.log(`✅ Số orders: ${orders[0].count}`);
        console.log('');

        // Test 5: Lấy 3 sản phẩm mẫu
        console.log('Test 5: Lấy 3 sản phẩm mẫu');
        const [sampleProducts] = await promisePool.query(`
            SELECT p.product_id, p.product_name, p.price, c.category_name 
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            LIMIT 3
        `);
        
        sampleProducts.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.product_name} - ${product.price.toLocaleString('vi-VN')}đ (${product.category_name})`);
        });
        console.log('');

        console.log('========================================');
        console.log('✅ TẤT CẢ CÁC TEST ĐỀU THÀNH CÔNG!');
        console.log('========================================');

    } catch (error) {
        console.error('❌ LỖI:', error.message);
        console.error('');
        console.error('Gợi ý khắc phục:');
        console.error('1. Kiểm tra MySQL đã chạy chưa: net start MySQL');
        console.error('2. Kiểm tra thông tin đăng nhập trong config/database.js');
        console.error('3. Import database: mysql -u root -p < database_design.sql');
        console.error('4. Kiểm tra tên database: lag_vintage_shop');
    } finally {
        process.exit(0);
    }
}

testConnection();
