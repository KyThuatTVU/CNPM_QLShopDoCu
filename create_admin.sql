-- =============================================
-- SCRIPT TẠO ADMIN USER
-- =============================================

-- Xóa admin cũ nếu có (tránh duplicate)
DELETE FROM users WHERE email = 'admin@lagvintage.com';

-- Tạo admin mới với password đã hash
-- Password: admin123
-- Hash: $2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
INSERT INTO users (email, password, full_name, phone, role, status)
VALUES (
    'admin@lagvintage.com',
    '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    'Administrator',
    '0987654321',
    'admin',
    'active'
);

-- Kiểm tra admin đã được tạo
SELECT user_id, email, full_name, role, status, created_at
FROM users 
WHERE email = 'admin@lagvintage.com';
