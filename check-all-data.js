const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
  });

  console.log('========================================');
  console.log('📊 KIỂM TRA DỮ LIỆU DATABASE');
  console.log('========================================\n');

  // 1. USERS
  console.log('👥 === USERS ===');
  const [users] = await conn.query('SELECT user_id, email, full_name, phone, role, status FROM users');
  console.log(`Total: ${users.length} users`);
  console.table(users);

  // 2. CATEGORIES
  console.log('\n📂 === CATEGORIES ===');
  const [categories] = await conn.query('SELECT category_id, category_name, description FROM categories');
  console.log(`Total: ${categories.length} categories`);
  console.table(categories);

  // 3. PRODUCTS (sample)
  console.log('\n🛍️  === PRODUCTS (First 10) ===');
  const [products] = await conn.query(`
    SELECT p.product_id, p.product_name, c.category_name, p.price, p.stock_quantity, p.condition_status 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    LIMIT 10
  `);
  console.log(`Total products in DB: ${(await conn.query('SELECT COUNT(*) as count FROM products'))[0][0].count}`);
  console.table(products);

  // 4. ORDERS
  console.log('\n📦 === ORDERS ===');
  const [orders] = await conn.query(`
    SELECT o.order_id, o.order_code, o.customer_name, u.full_name as user_name, 
           o.order_status, o.subtotal, o.shipping_fee, o.total_amount, o.order_date
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    ORDER BY o.order_date DESC
  `);
  console.log(`Total: ${orders.length} orders`);
  console.table(orders);

  // 5. ORDER ITEMS (từ orders mới nhất)
  if (orders.length > 0) {
    console.log('\n📋 === ORDER ITEMS (Latest Order) ===');
    const [items] = await conn.query(`
      SELECT oi.*, o.order_code 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      WHERE oi.order_id = ?
    `, [orders[0].order_id]);
    console.table(items);
  }

  // 6. CART
  console.log('\n🛒 === CART ===');
  const [cart] = await conn.query(`
    SELECT c.cart_id, u.full_name as user_name, p.product_name, c.quantity, 
           p.price, (c.quantity * p.price) as subtotal
    FROM cart c
    LEFT JOIN users u ON c.user_id = u.user_id
    LEFT JOIN products p ON c.product_id = p.product_id
  `);
  console.log(`Total: ${cart.length} items in cart`);
  console.table(cart);

  // 7. CONTACTS
  console.log('\n📧 === CONTACTS ===');
  const [contacts] = await conn.query('SELECT * FROM contacts ORDER BY created_at DESC');
  console.log(`Total: ${contacts.length} contacts`);
  console.table(contacts);

  // 8. PAYMENTS (nếu có)
  console.log('\n💳 === PAYMENTS ===');
  const [payments] = await conn.query(`
    SELECT p.*, o.order_code 
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.order_id
    ORDER BY p.created_at DESC
  `);
  console.log(`Total: ${payments.length} payments`);
  if (payments.length > 0) {
    console.table(payments);
  } else {
    console.log('No payment records');
  }

  // SUMMARY
  console.log('\n========================================');
  console.log('📊 SUMMARY');
  console.log('========================================');
  console.log(`✅ Users: ${users.length}`);
  console.log(`✅ Categories: ${categories.length}`);
  console.log(`✅ Products: ${(await conn.query('SELECT COUNT(*) as count FROM products'))[0][0].count}`);
  console.log(`✅ Orders: ${orders.length}`);
  console.log(`✅ Cart Items: ${cart.length}`);
  console.log(`✅ Contacts: ${contacts.length}`);
  console.log(`✅ Payments: ${payments.length}`);
  console.log('========================================\n');

  await conn.end();
})();
