# 🚀 LAG VINTAGE SHOP - BACKEND API

Backend API cho website LAG Vintage Shop bằng Node.js + Express + MySQL.

---

## 📋 YÊU CẦU HỆ THỐNG

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **MySQL**: >= 8.0
- **MySQL2**: ^3.6.0

---

## 🔧 CÀI ĐẶT

### 1. Clone project và di chuyển vào thư mục backend
```bash
cd backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

Hoặc cài từng package:
```bash
npm install express mysql2 cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon
```

### 3. Cấu hình database
Mở file `.env` và điều chỉnh thông tin kết nối MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lag_vintage_shop
DB_PORT=3306
```

### 4. Import database
Chạy file SQL để tạo database và dữ liệu mẫu:
```bash
# Windows (PowerShell)
Get-Content ..\database_design.sql | mysql -u root -p

# Windows (CMD)
mysql -u root -p < ..\database_design.sql

# Linux/Mac
mysql -u root -p < ../database_design.sql
```

Hoặc dùng MySQL Workbench:
- File > Run SQL Script
- Chọn file `database_design.sql`

### 5. Test kết nối
```bash
npm test
```

Nếu thành công, bạn sẽ thấy:
```
✅ Kết nối thành công!
✅ Database hiện tại: lag_vintage_shop
✅ Số bảng trong database: 8
✅ Số users: 3
✅ Số products: 26
...
```

---

## ▶️ CHẠY SERVER

### Development (với nodemon - tự động reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 📡 API ENDPOINTS

### 🏠 Base URL
```
http://localhost:3000/api
```

### 📦 Products (Sản phẩm)
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `GET /api/products/category/:code` - Lọc theo danh mục
- `GET /api/products/search?q=keyword` - Tìm kiếm
- `POST /api/products` - Thêm sản phẩm (admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin)

### 📂 Categories (Danh mục)
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục
- `GET /api/categories/:id/products` - Sản phẩm theo danh mục

### 🛒 Cart (Giỏ hàng)
- `GET /api/cart/:userId` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ
- `PUT /api/cart/:cartId` - Cập nhật số lượng
- `DELETE /api/cart/:cartId` - Xóa khỏi giỏ

### 📦 Orders (Đơn hàng)
- `GET /api/orders` - Lấy tất cả đơn (admin)
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `GET /api/orders/user/:userId` - Đơn hàng của user
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (admin)

### 👤 Users (Người dùng)
- `POST /api/users/register` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Lấy thông tin user (auth)
- `PUT /api/users/profile` - Cập nhật thông tin (auth)

### 📧 Contacts (Liên hệ)
- `GET /api/contacts` - Lấy tất cả tin nhắn (admin)
- `GET /api/contacts/:id` - Chi tiết tin nhắn
- `POST /api/contacts` - Gửi tin nhắn
- `PUT /api/contacts/:id` - Đánh dấu đã đọc (admin)

---

## 📁 CẤU TRÚC THƯ MỤC

```
backend/
├── config/
│   └── database.js          # Cấu hình kết nối MySQL
├── routes/
│   ├── products.js          # API sản phẩm
│   ├── categories.js        # API danh mục
│   ├── orders.js            # API đơn hàng
│   ├── users.js             # API users
│   ├── contacts.js          # API liên hệ
│   └── cart.js              # API giỏ hàng
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── admin.js             # Admin authorization
├── utils/
│   ├── helpers.js           # Hàm hỗ trợ
│   └── validators.js        # Validation
├── images/                  # Thư mục ảnh sản phẩm
├── .env                     # Biến môi trường
├── package.json            # Dependencies
├── server.js               # Entry point
├── test-connection.js      # Test database
└── README.md              # Tài liệu này
```

---

## 🧪 TEST API

### Dùng cURL

```bash
# Lấy tất cả sản phẩm
curl http://localhost:3000/api/products

# Lấy danh mục
curl http://localhost:3000/api/categories

# Lấy sản phẩm theo danh mục
curl http://localhost:3000/api/products/category/phone

# Tìm kiếm sản phẩm
curl "http://localhost:3000/api/products/search?q=iphone"
```

### Dùng Postman
1. Import collection từ file `postman_collection.json`
2. Hoặc tạo request thủ công theo endpoints bên trên

---

## 🔐 AUTHENTICATION

API sử dụng JWT (JSON Web Token) để xác thực.

### Đăng nhập
```bash
POST /api/users/login
{
  "email": "user@lagvintage.com",
  "password": "user123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 2,
    "email": "user@lagvintage.com",
    "role": "customer"
  }
}
```

### Sử dụng token
Thêm header vào các request cần auth:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ⚙️ BIẾN MÔI TRƯỜNG (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lag_vintage_shop
DB_PORT=3306

# JWT
JWT_SECRET=lag_vintage_shop_secret_key_2025
JWT_EXPIRE=7d
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: Cannot connect to MySQL
```bash
# Kiểm tra MySQL đã chạy chưa
net start MySQL80

# Hoặc
mysql -u root -p
```

### Lỗi: Database 'lag_vintage_shop' không tồn tại
```bash
# Import database
mysql -u root -p < ../database_design.sql
```

### Lỗi: Port 3000 đã được sử dụng
Đổi PORT trong file `.env`:
```env
PORT=3001
```

### Lỗi: Cannot find module
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT.io](https://jwt.io/)

---

## 👨‍💻 PHÁT TRIỂN

### Thêm API endpoint mới

1. Tạo file route mới trong `routes/`:
```javascript
// routes/reviews.js
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

router.get('/', async (req, res) => {
    // Code here
});

module.exports = router;
```

2. Import vào `server.js`:
```javascript
const reviewsRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewsRoutes);
```

---

## 📝 CHANGELOG

### Version 1.0.0 (30/09/2025)
- ✅ Kết nối MySQL với connection pool
- ✅ CRUD API cho products, categories, orders, users, contacts
- ✅ JWT authentication
- ✅ Admin authorization
- ✅ CORS support
- ✅ Error handling
- ✅ Logging

---

## 📞 LIÊN HỆ

- **Website**: http://lagvintage.com
- **Email**: admin@lagvintage.com

---

**Made with ❤️ by LAG Vintage Shop Team**
