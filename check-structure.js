// Kiểm tra chi tiết cấu trúc database
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
};

async function checkDatabaseStructure() {
    let connection;
    
    try {
        console.log('🔍 Đang kiểm tra cấu trúc database...\n');
        
        connection = await mysql.createConnection(dbConfig);
        
        // 1. Kiểm tra bảng products
        console.log('📋 BẢNG PRODUCTS:');
        const [productsColumns] = await connection.query('DESCRIBE products');
        productsColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 2. Kiểm tra bảng cart
        console.log('\n📋 BẢNG CART:');
        const [cartColumns] = await connection.query('DESCRIBE cart');
        cartColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 3. Kiểm tra bảng orders
        console.log('\n📋 BẢNG ORDERS:');
        const [ordersColumns] = await connection.query('DESCRIBE orders');
        ordersColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 4. Kiểm tra bảng order_items
        console.log('\n📋 BẢNG ORDER_ITEMS:');
        const [orderItemsColumns] = await connection.query('DESCRIBE order_items');
        orderItemsColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 5. Kiểm tra bảng users
        console.log('\n📋 BẢNG USERS:');
        const [usersColumns] = await connection.query('DESCRIBE users');
        usersColumns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 6. Kiểm tra dữ liệu mẫu
        console.log('\n📊 DỮ LIỆU MẪU:');
        
        const [products] = await connection.query('SELECT product_id, product_name, price, image_url FROM products LIMIT 3');
        console.log('\n   Sản phẩm:');
        products.forEach(p => {
            console.log(`   - ID ${p.product_id}: ${p.product_name} (${p.price}đ)`);
            console.log(`     Image: ${p.image_url}`);
        });
        
        const [cart] = await connection.query('SELECT * FROM cart LIMIT 3');
        console.log(`\n   Giỏ hàng: ${cart.length} items`);
        cart.forEach(c => {
            console.log(`   - Cart ID ${c.cart_id}: User ${c.user_id}, Product ${c.product_id}, Qty ${c.quantity}`);
        });
        
        const [orders] = await connection.query('SELECT order_id, order_code, customer_name, total_amount, order_status FROM orders LIMIT 3');
        console.log(`\n   Đơn hàng: ${orders.length} orders`);
        orders.forEach(o => {
            console.log(`   - ${o.order_code}: ${o.customer_name} - ${o.total_amount}đ [${o.order_status}]`);
        });
        
        // 7. Kiểm tra foreign keys
        console.log('\n🔗 KIỂM TRA QUAN HỆ:');
        const [cartWithProducts] = await connection.query(`
            SELECT c.cart_id, c.user_id, c.product_id, p.product_name, p.image_url 
            FROM cart c 
            LEFT JOIN products p ON c.product_id = p.product_id 
            LIMIT 3
        `);
        console.log(`   Cart + Products JOIN: ${cartWithProducts.length} rows`);
        cartWithProducts.forEach(row => {
            if (row.product_name) {
                console.log(`   ✅ Cart ${row.cart_id} → Product "${row.product_name}"`);
            } else {
                console.log(`   ❌ Cart ${row.cart_id} → Product NOT FOUND (ID: ${row.product_id})`);
            }
        });
        
        console.log('\n✅ KIỂM TRA CẤU TRÚC DATABASE HOÀN TẤT!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabaseStructure();
