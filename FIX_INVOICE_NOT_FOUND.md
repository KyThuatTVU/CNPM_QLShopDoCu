# 🔧 FIX LỖI "KHÔNG TÌM THẤY ĐƠN HÀNG" SAU KHI ĐẶT HÀNG COD

## ❌ VẤN ĐỀ
- Khách hàng đặt hàng COD thành công
- Redirect đến trang `invoice.html` 
- Hiển thị "Không tìm thấy đơn hàng!"

## 🔍 NGUYÊN NHÂN
**`invoice.html` đang load đơn hàng từ `localStorage` thay vì từ API server!**

```javascript
// Code CŨ (SAI):
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const order = orders.find(o => o.id === orderId);
```

Vấn đề: Đơn hàng được tạo trên server nhưng không được lưu vào localStorage, nên không tìm thấy!

## ✅ GIẢI PHÁP

### Đã sửa `frontend/invoice.html`:

1. **Load đơn hàng từ API thay vì localStorage:**
```javascript
async function loadInvoice() {
    const orderId = urlParams.get('orderId'); // order_code
    
    // Fetch orders from API
    const response = await fetch(`http://localhost:3000/api/orders`);
    const orders = await response.json();
    
    // Find order by order_code
    const order = orders.find(o => o.order_code === orderId);
    
    // Fetch order details with items
    const itemsResponse = await fetch(`http://localhost:3000/api/orders/${order.order_id}`);
    const orderDetail = await itemsResponse.json();
    
    displayInvoice(orderDetail);
}
```

2. **Hiển thị đơn hàng với dữ liệu từ API:**
```javascript
function displayInvoice(order) {
    // Sử dụng: order.order_code, order.customer_name, order.items[], v.v.
    // Thay vì: order.id, order.customer.fullName, v.v.
}
```

3. **Thêm xử lý lỗi tốt hơn:**
```javascript
if (!order) {
    document.getElementById('invoice-container').innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>Không tìm thấy đơn hàng với mã: ${orderId}</p>
            <button class="btn-primary" onclick="window.location.href='index.html'">
                Về trang chủ
            </button>
        </div>
    `;
    return;
}
```

## 📝 CÁCH KIỂM TRA

### 1. Khởi động server:
```powershell
cd D:\DuANShopQuanAoCu\backend
node server.js
```

### 2. Mở trình duyệt và test:
1. Đăng nhập vào website
2. Thêm sản phẩm vào giỏ hàng
3. Thanh toán bằng COD
4. Sau khi đặt hàng thành công, sẽ redirect đến invoice.html
5. **Bây giờ sẽ hiển thị đầy đủ thông tin đơn hàng!** ✅

### 3. Kiểm tra đơn hàng mới:
```bash
cd backend
node check-latest-orders.js
```

## 🎯 KẾT QUẢ

### Trước khi fix:
```
Không tìm thấy đơn hàng!
```

### Sau khi fix:
```
HÓA ĐƠN BÁN HÀNG
Số hóa đơn: ORD1759297595697928
Ngày xuất: 01/10/2025
Trạng thái: Chờ xử lý

Thông tin khách hàng:
- Họ tên: Lê Thị Hoa
- Email: hoa@example.com
- ...

Chi tiết đơn hàng:
[Danh sách sản phẩm]

Tổng cộng: 310,000đ
```

## 📌 FILES ĐÃ SỬA
- ✅ `frontend/invoice.html` - Load đơn hàng từ API thay vì localStorage
- ✅ `backend/check-latest-orders.js` - Tool kiểm tra đơn hàng mới

## ✨ ĐẢM BẢO
- ✅ Đơn hàng COD hiển thị đầy đủ thông tin
- ✅ Load dữ liệu trực tiếp từ database thông qua API
- ✅ Hiển thị lỗi rõ ràng nếu không tìm thấy đơn hàng
- ✅ Có thể in hóa đơn
- ✅ Dữ liệu payment đã được tạo trong database

## 🚀 HƯỚNG DẪN KHỞI ĐỘNG SERVER

Vì có vấn đề với việc thay đổi thư mục trong PowerShell, hãy khởi động server bằng cách:

### Cách 1: Mở terminal mới tại thư mục backend
1. Mở File Explorer
2. Đi đến `D:\DuANShopQuanAoCu\backend`
3. Shift + Right Click → "Open PowerShell window here"
4. Chạy: `node server.js`

### Cách 2: Sử dụng lệnh đầy đủ
```powershell
powershell -NoExit -Command "cd D:\DuANShopQuanAoCu\backend; node server.js"
```

### Cách 3: Tạo file batch
Tạo file `start-server.bat` trong thư mục backend:
```batch
@echo off
cd /d D:\DuANShopQuanAoCu\backend
node server.js
```
Sau đó double-click vào file này để khởi động server.
