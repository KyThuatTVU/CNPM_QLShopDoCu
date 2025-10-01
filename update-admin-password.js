// =============================================
// SCRIPT CẬP NHẬT PASSWORD ADMIN
// =============================================

const bcrypt = require('bcrypt');
const { promisePool } = require('./config/database');

async function updateAdminPassword() {
    try {
        console.log('🔧 Bắt đầu cập nhật password admin...\n');
        
        // Email và password mới
        const adminEmail = 'admin@lagvintage.com';
        const newPassword = 'admin123';
        
        // Hash password
        console.log('🔐 Đang hash password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('✅ Password đã hash:', hashedPassword.substring(0, 20) + '...\n');
        
        // Kiểm tra admin có tồn tại không
        console.log('🔍 Kiểm tra admin trong database...');
        const [existingUsers] = await promisePool.query(
            'SELECT user_id, email, full_name, role FROM users WHERE email = ?',
            [adminEmail]
        );
        
        if (existingUsers.length > 0) {
            // Cập nhật password cho admin hiện có
            console.log('📝 Admin đã tồn tại, đang cập nhật password...');
            
            await promisePool.query(`
                UPDATE users 
                SET password = ?,
                    role = 'admin',
                    status = 'active'
                WHERE email = ?
            `, [hashedPassword, adminEmail]);
            
            console.log('✅ Đã cập nhật password thành công!\n');
            
        } else {
            // Tạo admin mới
            console.log('➕ Admin chưa tồn tại, đang tạo mới...');
            
            await promisePool.query(`
                INSERT INTO users (email, password, full_name, phone, role, status)
                VALUES (?, ?, 'Administrator', '0987654321', 'admin', 'active')
            `, [adminEmail, hashedPassword]);
            
            console.log('✅ Đã tạo admin mới thành công!\n');
        }
        
        // Hiển thị thông tin admin
        console.log('📋 THÔNG TIN ADMIN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [adminUsers] = await promisePool.query(
            'SELECT user_id, email, full_name, role, status, created_at FROM users WHERE email = ?',
            [adminEmail]
        );
        
        if (adminUsers.length > 0) {
            const admin = adminUsers[0];
            console.log('Email:      ', admin.email);
            console.log('Password:   ', newPassword);
            console.log('Full Name:  ', admin.full_name);
            console.log('Role:       ', admin.role);
            console.log('Status:     ', admin.status);
            console.log('User ID:    ', admin.user_id);
            console.log('Created:    ', admin.created_at);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Hiển thị tất cả admin users
        console.log('👥 TẤT CẢ ADMIN USERS:');
        const [allAdmins] = await promisePool.query(
            'SELECT user_id, email, full_name, role, status FROM users WHERE role = ?',
            ['admin']
        );
        
        if (allAdmins.length > 0) {
            console.table(allAdmins);
        } else {
            console.log('Không có admin nào trong database');
        }
        
        console.log('\n✅ HOÀN THÀNH!');
        console.log('\n🔑 Bạn có thể đăng nhập với:');
        console.log('   Email:    admin@lagvintage.com');
        console.log('   Password: admin123\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ LỖI:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Chạy script
updateAdminPassword();
