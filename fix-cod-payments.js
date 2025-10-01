const mysql = require('mysql2/promise');

async function fixCODPayments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
  });

  try {
    await conn.beginTransaction();
    
    console.log('=== FIXING MISSING PAYMENT RECORDS FOR COD ORDERS ===\n');
    
    // Get all COD orders without payment records
    const [codOrders] = await conn.query(
      `SELECT o.order_id, o.order_code, o.payment_method, o.total_amount, o.order_date
       FROM orders o
       LEFT JOIN payments p ON o.order_id = p.order_id
       WHERE o.payment_method = 'cod' AND p.payment_id IS NULL`
    );
    
    console.log(`Found ${codOrders.length} COD orders without payment records.`);
    
    if (codOrders.length > 0) {
      console.log('\nCreating payment records...\n');
      
      for (const order of codOrders) {
        await conn.execute(
          `INSERT INTO payments (order_id, payment_method, amount, payment_status, payment_date)
           VALUES (?, ?, ?, 'pending', ?)`,
          [order.order_id, order.payment_method, order.total_amount, order.order_date]
        );
        
        console.log(`✅ Created payment record for order ${order.order_code} (${order.total_amount} VND)`);
      }
      
      await conn.commit();
      console.log(`\n✅ Successfully created ${codOrders.length} payment records!`);
      
      // Verify
      console.log('\n=== VERIFICATION ===\n');
      const [payments] = await conn.query(
        `SELECT p.*, o.order_code 
         FROM payments p
         JOIN orders o ON p.order_id = o.order_id
         WHERE o.payment_method = 'cod'`
      );
      console.table(payments);
      
    } else {
      console.log('✅ All COD orders already have payment records!');
    }
    
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error:', error);
  } finally {
    await conn.end();
  }
}

fixCODPayments();
