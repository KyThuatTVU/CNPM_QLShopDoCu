const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
  });

  try {
    const query = `
      SELECT o.*, 
        u.full_name, u.email, u.phone,
        GROUP_CONCAT(
          CONCAT(oi.product_name, ' (x', oi.quantity, ')')
          SEPARATOR ', '
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id ORDER BY o.order_date DESC
      LIMIT 3
    `;
    
    const [rows] = await conn.query(query);
    console.log('✅ Query successful! Found', rows.length, 'orders\n');
    
    rows.forEach((order, i) => {
      console.log(`Order ${i + 1}:`);
      console.log('  ID:', order.order_id);
      console.log('  Code:', order.order_code);
      console.log('  Customer:', order.customer_name);
      console.log('  User:', order.full_name || 'Guest');
      console.log('  Status:', order.order_status);
      console.log('  Total:', order.total_amount);
      console.log('  Items:', order.items);
      console.log('');
    });
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
  
  await conn.end();
})();
