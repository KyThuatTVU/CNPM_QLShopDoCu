// Test creating a COD order to verify payment record is created automatically
const axios = require('axios');

async function testCODOrder() {
  try {
    console.log('=== TESTING COD ORDER CREATION ===\n');
    
    const orderData = {
      user_id: 1,
      customer_name: 'Test User COD',
      customer_email: 'test@example.com',
      customer_phone: '0123456789',
      shipping_address: '123 Test Street',
      shipping_district: 'Quận 1',
      shipping_city: 'hcm',
      payment_method: 'cod',
      notes: 'Test COD order with payment record',
      items: [
        {
          product_id: 1,
          quantity: 1
        }
      ]
    };
    
    console.log('Creating COD order...');
    const response = await axios.post('http://localhost:3000/api/orders', orderData);
    
    if (response.data.success) {
      console.log('\n✅ Order created successfully!');
      console.log('Order ID:', response.data.data.order_id);
      console.log('Order Code:', response.data.data.order_code);
      console.log('Total Amount:', response.data.data.total_amount);
      
      // Now check if payment record was created
      console.log('\n=== CHECKING PAYMENT RECORD ===\n');
      
      const mysql = require('mysql2/promise');
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'TVU@842004',
        database: 'lag_vintage_shop'
      });
      
      const [payments] = await conn.query(
        `SELECT * FROM payments WHERE order_id = ?`,
        [response.data.data.order_id]
      );
      
      if (payments.length > 0) {
        console.log('✅ Payment record found!');
        console.table(payments);
      } else {
        console.log('❌ NO payment record found! There is still a problem!');
      }
      
      await conn.end();
      
    } else {
      console.log('❌ Failed to create order:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCODOrder();
