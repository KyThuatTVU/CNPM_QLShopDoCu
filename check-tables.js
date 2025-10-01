// Script kiểm tra cấu trúc bảng trong database
const { pool } = require('./config/database');

async function checkTables() {
    try {
        console.log('🔍 Kiểm tra cấu trúc database...\n');
        
        // Lấy danh sách bảng
        const [tables] = await pool.query('SHOW TABLES');
        console.log('📋 Các bảng trong database:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
        console.log('');
        
        // Kiểm tra cấu trúc từng bảng quan trọng
        const checkTableStructure = async (tableName) => {
            try {
                const [columns] = await pool.query(`DESCRIBE ${tableName}`);
                console.log(`\n📊 Cấu trúc bảng: ${tableName}`);
                console.log('─'.repeat(70));
                columns.forEach(col => {
                    console.log(`   ${col.Field.padEnd(25)} | ${col.Type.padEnd(20)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
            } catch (error) {
                console.log(`   ❌ Bảng ${tableName} không tồn tại`);
            }
        };
        
        // Kiểm tra các bảng chính
        const mainTables = ['products', 'categories', 'orders', 'users', 'cart', 'contacts'];
        for (const table of mainTables) {
            await checkTableStructure(table);
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await pool.end();
    }
}

checkTables();
