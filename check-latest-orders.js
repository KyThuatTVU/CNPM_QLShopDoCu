const mysql = require('mysql2/promise');

async function checkLatestOrders() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
  });

  try {
    console.log('=== LATEST COD ORDERS ===\n');
    
    const [orders] = await conn.query(
      `SELECT order_id, order_code, customer_name, payment_method, 
              order_status, total_amount, order_date 
       FROM orders 
       WHERE payment_method = 'cod'
       ORDER BY order_date DESC 
       LIMIT 5`
    );
    
    console.table(orders);
    
    if (orders.length > 0) {
      console.log('\n=== CHECKING PAYMENTS FOR THESE ORDERS ===\n');
      const orderIds = orders.map(o => o.order_id);
      const [payments] = await conn.query(
        'SELECT payment_id, order_id, payment_method, amount, payment_status FROM payments WHERE order_id IN (?)',
        [orderIds]
      );
      console.table(payments);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkLatestOrders();
