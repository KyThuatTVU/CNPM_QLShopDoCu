// Script truy cập và kiểm tra cấu trúc database MySQL
const mysql = require('mysql2/promise');

async function checkAndFixDatabase() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'TVU@842004',
            database: 'lag_vintage_shop'
        });

        console.log('✅ Kết nối database thành công!\n');

        // 1. Kiểm tra các bảng hiện có
        console.log('📋 KIỂM TRA CÁC BẢNG HIỆN CÓ:');
        console.log('='.repeat(70));
        const [tables] = await connection.query('SHOW TABLES');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ✓ ${tableName}`);
        });
        console.log('');

        // 2. Kiểm tra cấu trúc bảng products
        console.log('📊 CẤU TRÚC BẢNG: products');
        console.log('='.repeat(70));
        const [productsColumns] = await connection.query('DESCRIBE products');
        productsColumns.forEach(col => {
            console.log(`   ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Key.padEnd(3)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log('');

        // 3. Kiểm tra cấu trúc bảng categories
        console.log('📊 CẤU TRÚC BẢNG: categories');
        console.log('='.repeat(70));
        const [categoriesColumns] = await connection.query('DESCRIBE categories');
        categoriesColumns.forEach(col => {
            console.log(`   ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Key.padEnd(3)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log('');

        // 4. Kiểm tra cấu trúc bảng users
        console.log('📊 CẤU TRÚC BẢNG: users');
        console.log('='.repeat(70));
        const [usersColumns] = await connection.query('DESCRIBE users');
        usersColumns.forEach(col => {
            console.log(`   ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Key.padEnd(3)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log('');

        // 5. Kiểm tra cấu trúc bảng orders
        console.log('📊 CẤU TRÚC BẢNG: orders');
        console.log('='.repeat(70));
        const [ordersColumns] = await connection.query('DESCRIBE orders');
        ordersColumns.forEach(col => {
            console.log(`   ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Key.padEnd(3)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log('');

        // 6. Kiểm tra dữ liệu mẫu
        console.log('📦 KIỂM TRA DỮ LIỆU:');
        console.log('='.repeat(70));
        
        const [categoriesCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
        console.log(`   Categories: ${categoriesCount[0].count} bản ghi`);
        
        const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log(`   Products: ${productsCount[0].count} bản ghi`);
        
        const [usersCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`   Users: ${usersCount[0].count} bản ghi`);
        
        const [ordersCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
        console.log(`   Orders: ${ordersCount[0].count} bản ghi`);
        
        console.log('');

        // 7. Hiển thị sample data từ categories
        console.log('📄 SAMPLE DATA - Categories:');
        console.log('='.repeat(70));
        const [categories] = await connection.query('SELECT * FROM categories LIMIT 5');
        if (categories.length > 0) {
            categories.forEach(cat => {
                console.log(`   ID: ${cat.category_id} | Code: ${cat.category_code} | Name: ${cat.category_name}`);
            });
        } else {
            console.log('   ⚠️  Không có dữ liệu');
        }
        console.log('');

        // 8. Hiển thị sample data từ products
        console.log('📄 SAMPLE DATA - Products:');
        console.log('='.repeat(70));
        const [products] = await connection.query('SELECT * FROM products LIMIT 3');
        if (products.length > 0) {
            products.forEach(prod => {
                console.log(`   ID: ${prod.product_id} | Name: ${prod.product_name} | Price: ${prod.price}đ`);
            });
        } else {
            console.log('   ⚠️  Không có dữ liệu');
        }
        console.log('');

        console.log('✅ Kiểm tra hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n⚠️  Bảng không tồn tại. Cần chạy file SQL để tạo cấu trúc database.');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAndFixDatabase();
