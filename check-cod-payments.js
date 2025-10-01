const mysql = require('mysql2/promise');

async function checkCODPayments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TVU@842004',
    database: 'lag_vintage_shop'
  });

  try {
    console.log('=== CHECKING COD ORDERS ===\n');
    
    // Get all COD orders
    const [codOrders] = await conn.query(
      `SELECT order_id, order_code, customer_name, payment_method, 
              order_status, total_amount, order_date 
       FROM orders 
       WHERE payment_method = 'cod'
       ORDER BY order_date DESC`
    );
    
    console.log(`Found ${codOrders.length} COD orders:`);
    console.table(codOrders);
    
    if (codOrders.length > 0) {
      console.log('\n=== CHECKING PAYMENT RECORDS FOR COD ORDERS ===\n');
      
      const orderIds = codOrders.map(o => o.order_id);
      const [payments] = await conn.query(
        `SELECT * FROM payments WHERE order_id IN (?)`,
        [orderIds]
      );
      
      if (payments.length > 0) {
        console.log(`✅ Found ${payments.length} payment records:`);
        console.table(payments);
      } else {
        console.log('❌ NO PAYMENT RECORDS FOUND for COD orders!');
        console.log('This is the problem - we need to create payment records for COD orders.');
      }
      
      // Show which orders are missing payments
      console.log('\n=== ORDERS WITHOUT PAYMENT RECORDS ===\n');
      const ordersWithoutPayment = [];
      for (const order of codOrders) {
        const hasPayment = payments.some(p => p.order_id === order.order_id);
        if (!hasPayment) {
          ordersWithoutPayment.push({
            order_id: order.order_id,
            order_code: order.order_code,
            customer_name: order.customer_name,
            total_amount: order.total_amount
          });
        }
      }
      
      if (ordersWithoutPayment.length > 0) {
        console.log(`❌ ${ordersWithoutPayment.length} orders missing payment records:`);
        console.table(ordersWithoutPayment);
      } else {
        console.log('✅ All COD orders have payment records!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkCODPayments();
