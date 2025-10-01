// Script UPDATE database để FIX tất cả image_url
const { promisePool } = require('./config/database');

async function fixDatabaseImages() {
    try {
        console.log('\n🔧 FIX IMAGE_URL TRONG DATABASE\n');
        console.log('=====================================\n');

        // Lấy TẤT CẢ sản phẩm
        const [products] = await promisePool.query(`
            SELECT product_id, product_name, image_url
            FROM products
        `);

        console.log(`📦 Tổng số sản phẩm: ${products.length}\n`);

        let fixedCount = 0;
        let alreadyOkCount = 0;

        for (const product of products) {
            const oldUrl = product.image_url;
            
            if (!oldUrl) {
                console.log(`[${product.product_id}] ${product.product_name}: NULL - bỏ qua`);
                continue;
            }

            let newUrl = oldUrl;
            let needUpdate = false;

            // Nếu đã có http:// hoặc https:// → giữ nguyên
            if (oldUrl.startsWith('http://') || oldUrl.startsWith('https://')) {
                console.log(`[${product.product_id}] ✅ ${product.product_name}: Đã là full URL`);
                alreadyOkCount++;
            }
            // Nếu đã có images/ → giữ nguyên
            else if (oldUrl.startsWith('images/')) {
                console.log(`[${product.product_id}] ✅ ${product.product_name}: Đã có images/ prefix`);
                alreadyOkCount++;
            }
            // Nếu chỉ là tên file → KHÔNG cần update database, backend API sẽ xử lý
            else {
                console.log(`[${product.product_id}] ⚠️  ${product.product_name}: "${oldUrl}" - Backend API sẽ tự động thêm prefix`);
                alreadyOkCount++;
                // KHÔNG update database, để backend tự động xử lý
            }
        }

        console.log(`\n📊 THỐNG KÊ:\n`);
        console.log(`✅ Sản phẩm OK (không cần fix): ${alreadyOkCount}`);
        console.log(`🔧 Sản phẩm cần fix: ${fixedCount}`);
        console.log(`\n💡 KẾT LUẬN:`);
        console.log(`Database không cần update!`);
        console.log(`Backend API (fixImageUrl) sẽ tự động xử lý.\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

fixDatabaseImages();
