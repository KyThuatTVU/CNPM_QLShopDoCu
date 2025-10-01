// Test Admin API calls
const axios = require('axios');

async function testAdminAPIs() {
    const BASE_URL = 'http://localhost:3000/api';
    
    console.log('🔍 TESTING ADMIN APIs\n');
    console.log('=====================================\n');
    
    try {
        // Test Orders API
        console.log('1️⃣ Testing GET /api/orders');
        const ordersResponse = await axios.get(`${BASE_URL}/orders`);
        console.log('✅ Status:', ordersResponse.status);
        console.log('📦 Data type:', Array.isArray(ordersResponse.data) ? 'Array' : typeof ordersResponse.data);
        console.log('📊 Total orders:', ordersResponse.data.length);
        if (ordersResponse.data.length > 0) {
            console.log('📋 First order structure:', Object.keys(ordersResponse.data[0]));
        }
        console.log('');
        
        // Test Products API
        console.log('2️⃣ Testing GET /api/products');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        console.log('✅ Status:', productsResponse.status);
        console.log('📦 Data type:', Array.isArray(productsResponse.data) ? 'Array' : typeof productsResponse.data);
        console.log('📊 Total products:', productsResponse.data.length);
        if (productsResponse.data.length > 0) {
            console.log('📋 First product structure:', Object.keys(productsResponse.data[0]));
        }
        console.log('');
        
        // Test Users API
        console.log('3️⃣ Testing GET /api/users');
        const usersResponse = await axios.get(`${BASE_URL}/users`);
        console.log('✅ Status:', usersResponse.status);
        console.log('📦 Data type:', Array.isArray(usersResponse.data) ? 'Array' : typeof usersResponse.data);
        console.log('📊 Total users:', usersResponse.data.length);
        if (usersResponse.data.length > 0) {
            console.log('📋 First user structure:', Object.keys(usersResponse.data[0]));
        }
        console.log('');
        
        // Test Contacts API
        console.log('4️⃣ Testing GET /api/contacts');
        const contactsResponse = await axios.get(`${BASE_URL}/contacts`);
        console.log('✅ Status:', contactsResponse.status);
        console.log('📦 Data type:', Array.isArray(contactsResponse.data) ? 'Array' : typeof contactsResponse.data);
        console.log('📊 Total contacts:', contactsResponse.data.length);
        if (contactsResponse.data.length > 0) {
            console.log('📋 First contact structure:', Object.keys(contactsResponse.data[0]));
        }
        console.log('');
        
        console.log('=====================================');
        console.log('✅ ALL TESTS PASSED!');
        console.log('=====================================\n');
        
        // Summary
        console.log('📊 SUMMARY:');
        console.log(`   Orders: ${ordersResponse.data.length}`);
        console.log(`   Products: ${productsResponse.data.length}`);
        console.log(`   Users: ${usersResponse.data.length}`);
        console.log(`   Contacts: ${contactsResponse.data.length}`);
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run test if server is running
testAdminAPIs().catch(err => {
    console.error('❌ Test failed:', err.message);
    console.log('\n⚠️  Make sure server is running: node server.js');
});
