const { promisePool } = require('./config/database');

(async () => {
    try {
        console.log('=== CHECKING DATABASE STRUCTURE ===\n');
        
        // Check products table
        console.log('--- PRODUCTS TABLE ---');
        const [products] = await promisePool.execute('DESCRIBE products');
        console.table(products);
        
        // Check categories table
        console.log('\n--- CATEGORIES TABLE ---');
        const [categories] = await promisePool.execute('DESCRIBE categories');
        console.table(categories);
        
        // Check cart table
        console.log('\n--- CART TABLE ---');
        const [cart] = await promisePool.execute('DESCRIBE cart');
        console.table(cart);
        
        // Sample products
        console.log('\n--- SAMPLE PRODUCTS (first 3) ---');
        const [sampleProducts] = await promisePool.execute('SELECT * FROM products LIMIT 3');
        console.table(sampleProducts);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
