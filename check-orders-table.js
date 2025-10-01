const { promisePool } = require('./config/database');

(async () => {
    try {
        console.log('=== CHECKING ORDERS TABLE ===\n');
        
        const [orders] = await promisePool.execute('DESCRIBE orders');
        console.table(orders);
        
        console.log('\n=== CHECKING ORDER_ITEMS TABLE ===\n');
        const [orderItems] = await promisePool.execute('DESCRIBE order_items');
        console.table(orderItems);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
