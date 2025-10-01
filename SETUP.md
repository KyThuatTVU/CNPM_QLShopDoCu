# ⚡ HƯỚNG DẪN CÀI ĐẶT NHANH - LAG SHOP BACKEND

## 🚀 BƯỚC 1: Cài đặt Node.js packages

```powershell
# Di chuyển vào thư mục backend
cd d:\DuANShopQuanAoCu\backend

# Cài đặt dependencies
npm install express mysql2 cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon
```

---

## 🗄️ BƯỚC 2: Import Database

```powershell
# Option 1: Dùng PowerShell
Get-Content ..\database_design.sql | mysql -u root -p

# Option 2: Dùng MySQL Workbench
# File > Run SQL Script > Chọn database_design.sql
```

Hoặc dùng command line:
```powershell
mysql -u root -p
```
Sau đó:
```sql
source D:/DuANShopQuanAoCu/database_design.sql;
```

---

## ⚙️ BƯỚC 3: Cấu hình .env

File `.env` đã được tạo sẵn với cấu hình mặc định:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lag_vintage_shop
DB_PORT=3306
```

**Nếu MySQL của bạn có password, hãy sửa dòng `DB_PASSWORD`!**

---

## 🧪 BƯỚC 4: Test kết nối

```powershell
npm test
```

Kết quả mong đợi:
```
✅ Kết nối database thành công!
✅ Database hiện tại: lag_vintage_shop
✅ Số bảng trong database: 8
✅ Số users: 3
✅ Số categories: 8
✅ Số products: 26
```

---

## ▶️ BƯỚC 5: Chạy server

```powershell
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## ✅ KIỂM TRA API

Mở trình duyệt và test các endpoint sau:

### 1. Test server
```
http://localhost:3000
```

### 2. Test database connection
```
http://localhost:3000/api/test-db
```

### 3. Lấy danh mục
```
http://localhost:3000/api/categories
```

### 4. Lấy sản phẩm
```
http://localhost:3000/api/products
```

### 5. Lọc sản phẩm điện thoại
```
http://localhost:3000/api/products?category=phone
```

---

## 📱 TEST API BẰNG POSTMAN/CURL

### Lấy tất cả sản phẩm
```bash
curl http://localhost:3000/api/products
```

### Lấy sản phẩm theo danh mục
```bash
curl http://localhost:3000/api/products?category=laptop
```

### Tìm kiếm sản phẩm
```bash
curl "http://localhost:3000/api/products?search=iphone"
```

### Đăng ký user
```bash
curl -X POST http://localhost:3000/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"123456\",\"full_name\":\"Test User\",\"phone\":\"0123456789\"}"
```

### Đăng nhập
```bash
curl -X POST http://localhost:3000/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@lagvintage.com\",\"password\":\"user123\"}"
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Cannot find module 'express'
```powershell
npm install
```

### Lỗi 2: Cannot connect to MySQL
```powershell
# Kiểm tra MySQL đã chạy chưa
net start MySQL80

# Hoặc
Get-Service -Name "MySQL*"
```

### Lỗi 3: Database not found
```powershell
# Import lại database
Get-Content ..\database_design.sql | mysql -u root -p
```

### Lỗi 4: Port 3000 already in use
Đổi PORT trong file `.env`:
```env
PORT=3001
```

### Lỗi 5: Access denied for user 'root'
Sửa mật khẩu trong `.env`:
```env
DB_PASSWORD=your_mysql_password
```

---

## 📂 CẤU TRÚC PROJECT

```
backend/
├── config/
│   └── database.js          ✅ Kết nối MySQL
├── routes/
│   ├── products.js          ✅ API sản phẩm
│   ├── categories.js        ✅ API danh mục
│   ├── orders.js            ✅ API đơn hàng
│   ├── users.js             ✅ API users
│   ├── contacts.js          ✅ API liên hệ
│   └── cart.js              ✅ API giỏ hàng
├── images/                  📁 Thư mục ảnh
├── .env                     ⚙️ Cấu hình
├── package.json            📦 Dependencies
├── server.js               🚀 Entry point
├── test-connection.js      🧪 Test DB
└── README.md               📖 Tài liệu
```

---

## 🎯 CHECKLIST

- [ ] Cài đặt Node.js packages (`npm install`)
- [ ] Import database (`database_design.sql`)
- [ ] Cấu hình `.env` (password MySQL nếu có)
- [ ] Test kết nối database (`npm test`)
- [ ] Chạy server (`npm run dev`)
- [ ] Test API trong browser (http://localhost:3000/api/products)
- [ ] Test đăng nhập/đăng ký

---

## 📞 HỖ TRỢ

Nếu gặp lỗi, kiểm tra console log của server và terminal output.

Các lỗi thường gặp:
- ❌ MySQL chưa chạy → `net start MySQL80`
- ❌ Database chưa import → Import file `database_design.sql`
- ❌ Password MySQL sai → Sửa file `.env`
- ❌ Port 3000 đã dùng → Đổi PORT trong `.env`

---

**Chúc bạn thành công! 🎉**
