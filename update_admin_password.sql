-- =============================================
-- SCRIPT CẬP NHẬT PASSWORD ADMIN
-- =============================================

-- Cập nhật password cho admin
-- Email: admin@lagvintage.com
-- Password mới: admin123
-- Hash bcrypt: $2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa

UPDATE users 
SET password = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    role = 'admin',
    status = 'active'
WHERE email = 'admin@lagvintage.com';

-- Kiểm tra kết quả
SELECT user_id, email, full_name, role, status, created_at, last_login
FROM users 
WHERE email = 'admin@lagvintage.com';

-- Nếu không có admin, tạo mới
INSERT INTO users (email, password, full_name, phone, role, status)
SELECT 
    'admin@lagvintage.com',
    '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Administrator',
    '0987654321',
    'admin',
    'active'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@lagvintage.com'
);

-- Hiển thị tất cả admin users
SELECT user_id, email, full_name, role, status 
FROM users 
WHERE role = 'admin';
