# 🔧 FIX LỖI THANH TOÁN COD - KHÔNG CÓ DỮ LIỆU PAYMENT

## ❌ VẤN ĐỀ BAN ĐẦU
- Khi khách hàng đặt hàng với phương thức thanh toán COD (tiền mặt)
- Đơn hàng được tạo NHƯNG không có bản ghi thanh toán (payment record) trong database
- Thiếu bảng `payments` trong database
- Các đơn hàng COD cũ không có payment records

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Tạo bảng `payments`
**File:** `backend/create-payments-table.sql`
```sql
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_payment_status (payment_status)
);
```

### 2. Sửa route tạo đơn hàng
**File:** `backend/routes/orders.js`

**Thêm code tự động tạo payment record cho COD:**
```javascript
// Create payment record for COD
if (payment_method === 'cod') {
  await connection.execute(
    `INSERT INTO payments (order_id, payment_method, amount, payment_status, payment_date)
     VALUES (?, ?, ?, 'pending', NOW())`,
    [order_id, payment_method, final_total]
  );
}
```

### 3. Fix dữ liệu cũ
**File:** `backend/fix-cod-payments.js`
- Tự động tạo payment records cho các đơn COD cũ đã tồn tại
- Đã fix thành công 2 đơn hàng COD cũ

## 📊 KẾT QUẢ

### Trước khi fix:
```
=== COD ORDERS ===
Found 2 COD orders

=== CHECKING PAYMENTS ===
❌ NO PAYMENT RECORDS FOUND for COD orders!
```

### Sau khi fix:
```
=== LATEST ORDERS ===
┌─────────┬──────────┬───────────────────────┬───────────────┬────────────────┬──────────────┬──────────────┐
│ (index) │ order_id │ order_code            │ customer_name │ payment_method │ order_status │ total_amount │
├─────────┼──────────┼───────────────────────┼───────────────┼────────────────┼──────────────┼──────────────┤
│ 0       │ 19       │ 'ORD1759297392554111' │ 'Lê Thị Hoa'  │ 'cod'          │ 'pending'    │ '310000.00'  │
│ 1       │ 18       │ 'ORD1759297012753477' │ 'Lê Thị Hoa'  │ 'cod'          │ 'pending'    │ '660000.00'  │
└─────────┴──────────┴───────────────────────┴───────────────┴────────────────┴──────────────┴──────────────┘

=== CHECKING PAYMENTS ===
┌─────────┬────────────┬──────────┬────────────────┬─────────────┬────────────────┐
│ (index) │ payment_id │ order_id │ payment_method │ amount      │ payment_status │
├─────────┼────────────┼──────────┼────────────────┼─────────────┼────────────────┤
│ 0       │ 2          │ 18       │ 'cod'          │ '660000.00' │ 'pending'      │
│ 1       │ 3          │ 19       │ 'cod'          │ '310000.00' │ 'pending'      │ ✅
└─────────┴────────────┴──────────┴────────────────┴─────────────┴────────────────┘
```

## 🎯 CÁCH SỬ DỤNG

### Kiểm tra payment records:
```bash
cd backend
node check-cod-payments.js
```

### Fix payment records cho đơn cũ (nếu cần):
```bash
cd backend
node fix-cod-payments.js
```

### Test tạo đơn COD mới:
```bash
cd backend
node test-cod-order.js
```

## ✨ ĐẢM BẢO
- ✅ Mọi đơn hàng COD mới sẽ tự động có payment record
- ✅ Các đơn hàng COD cũ đã được fix
- ✅ Database có đầy đủ cấu trúc bảng payments
- ✅ Payment status mặc định là 'pending'
- ✅ Có thể theo dõi trạng thái thanh toán cho tất cả các đơn

## 🔍 CẤU TRÚC DATABASE

### Bảng `orders`:
- order_id (PK)
- order_code
- user_id
- customer_name, customer_email, customer_phone
- shipping_address, shipping_district, shipping_city
- **payment_method** (cod/bank/momo)
- order_status (pending/processing/shipping/delivered/cancelled)
- subtotal, shipping_fee, total_amount
- order_date

### Bảng `payments` (MỚI):
- payment_id (PK)
- **order_id** (FK → orders.order_id)
- payment_method
- amount
- transaction_id
- **payment_status** (pending/completed/failed)
- payment_date
- created_at, updated_at

## 📝 GHI CHÚ
- Với đơn COD: payment_status = 'pending' cho đến khi khách nhận hàng
- Với đơn chuyển khoản/MoMo: payment_status = 'completed' sau khi xác nhận thanh toán
- Có thể update payment_status thông qua API: PUT /api/payments/:id/status
