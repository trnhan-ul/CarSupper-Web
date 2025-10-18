## 📱 Clothing Store WebApp – Phân chia chức năng cho 5 người (Theo Features)

## 🎯 Tổng quan dự án
Ứng dụng web thương mại điện tử gồm:
- Backend: Node.js/Express, MongoDB (Mongoose), JWT (access + refresh), OTP email (Nodemailer), upload ảnh (multer).
- Frontend: React (CRA), axios interceptor tự refresh token, lớp `src/api` gom logic gọi API, UI cho user/admin.

---

## 👤 Person 1: Authentication & Profile Management
**Scope:** Đăng nhập/Đăng ký/OTP, refresh token, hồ sơ cá nhân, phân quyền

### 📁 Files phụ trách
- Backend:
  - `BE/ClothingStoreSDN/src/controllers/authController.js`
  - `BE/ClothingStoreSDN/src/controllers/userController.js`
  - `BE/ClothingStoreSDN/src/routes/authRoutes.js`
  - `BE/ClothingStoreSDN/src/routes/userRoutes.js`
  - `BE/ClothingStoreSDN/src/middleware/authMiddleware.js`
  - `BE/ClothingStoreSDN/src/models/userModel.js`
  - `BE/ClothingStoreSDN/src/models/OtpModel.js`
- Frontend:
  - `FE/FE_Clothing_Store_SDN/src/api/authApi.js`
  - `FE/FE_Clothing_Store_SDN/src/api/userApi.js`
  - `FE/FE_Clothing_Store_SDN/src/utils/createInstance.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/LoginPage.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/RegisterPage.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/ForgotPasswordPage.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/ProfilePage.js`
  - `FE/FE_Clothing_Store_SDN/src/components/ProtectedRoute.js`

### ✅ Chức năng
- Đăng ký OTP, xác thực OTP; đăng nhập/đăng xuất; refresh token (cookie httpOnly)
- Quên mật khẩu qua OTP; đặt lại mật khẩu
- Hồ sơ cá nhân: xem/sửa, upload avatar, đổi mật khẩu
- Phân quyền User/Admin, bảo vệ route

### 🚀 Mở rộng
- Rate-limit OTP; logout all sessions; 2FA

---

## 👤 Person 2: Product Display, Categories & Search
**Scope:** Sản phẩm, danh mục, tìm kiếm/lọc, phân trang, admin CRUD

### 📁 Files phụ trách
- Backend:
  - `BE/ClothingStoreSDN/src/controllers/productController.js`
  - `BE/ClothingStoreSDN/src/controllers/categoryController.js`
  - `BE/ClothingStoreSDN/src/routes/productRoutes.js`
  - `BE/ClothingStoreSDN/src/routes/categoryRoutes.js`
  - `BE/ClothingStoreSDN/src/middleware/uploadMiddleware.js`
  - `BE/ClothingStoreSDN/src/models/productModel.js`
  - `BE/ClothingStoreSDN/src/models/categoryModel.js`
- Frontend:
  - `FE/FE_Clothing_Store_SDN/src/api/productApi.js`
  - `FE/FE_Clothing_Store_SDN/src/api/categoryApi.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/OurStore.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/ProductDetail.js`
  - `FE/FE_Clothing_Store_SDN/src/components/ProductCard.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/admin/ManageProducts.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/admin/ManageCategories.js`

### ✅ Chức năng
- Danh sách sản phẩm: filter (category, gender, price, status, name), phân trang
- Chi tiết sản phẩm; gallery ảnh
- Admin: tạo/sửa sản phẩm (upload nhiều ảnh), sửa danh mục, cập nhật trạng thái

### 🚀 Mở rộng
- Xóa sản phẩm cứng + dọn file ảnh; import/export CSV; category tree; SEO slug

---

## 👤 Person 3: Shopping Cart
**Scope:** Giỏ hàng theo user, thêm/sửa/xóa/clear, đồng bộ tổng tiền

### 📁 Files phụ trách
- Backend:
  - `BE/ClothingStoreSDN/src/controllers/cartController.js`
  - `BE/ClothingStoreSDN/src/routes/cartRoutes.js`
  - `BE/ClothingStoreSDN/src/models/cartModel.js`
- Frontend:
  - `FE/FE_Clothing_Store_SDN/src/api/cartApi.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/CartPage.js`

### ✅ Chức năng
- Thêm sản phẩm vào giỏ; cập nhật số lượng/biến thể
- Xóa item; xóa toàn bộ giỏ
- Tính tổng tiền giỏ hàng

### 🚀 Mở rộng
- Lưu giỏ hàng bền (guest/user); kiểm tra tồn kho trước checkout; voucher/giảm giá; phí ship

---

## 👤 Person 4: Checkout & Orders + Feedback
**Scope:** Tạo đơn, quản lý đơn (user), admin cập nhật trạng thái, feedback

### 📁 Files phụ trách
- Backend:
  - `BE/ClothingStoreSDN/src/controllers/orderController.js`
  - `BE/ClothingStoreSDN/src/routes/orderRoutes.js` (thêm `adminMiddleware` cho `PUT /status`)
  - `BE/ClothingStoreSDN/src/models/orderModel.js`
- Frontend:
  - `FE/FE_Clothing_Store_SDN/src/api/orderApi.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/CheckoutPage.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/user/TrackingOrderPage.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/admin/ManageOrders.js`

### ✅ Chức năng
- Tạo đơn từ giỏ; xem danh sách/chi tiết đơn theo user
- User hủy đơn; thêm feedback
- Admin cập nhật trạng thái đơn; soft-delete

### 🚀 Mở rộng
- Timeline trạng thái; in hóa đơn PDF; mã vận đơn và webhook vận chuyển; thanh toán online

---

## 👤 Person 5: Admin Statistics & Integration (CORS/ENV)
**Scope:** Thống kê admin, tích hợp hệ thống, cấu hình môi trường

### 📁 Files phụ trách
- Backend:
  - `BE/ClothingStoreSDN/src/controllers/statisticsController.js`
  - `BE/ClothingStoreSDN/src/routes/statisticsRoutes.js`
  - `BE/ClothingStoreSDN/src/server.js` (CORS, static)
  - `BE/ClothingStoreSDN/src/routes/index.js`
  - `BE/ClothingStoreSDN/src/config/db/connectDB.js`
- Frontend:
  - `FE/FE_Clothing_Store_SDN/src/api/statisticsApi.js`
  - `FE/FE_Clothing_Store_SDN/src/pages/admin/ManageStatistics.js`
  - `FE/FE_Clothing_Store_SDN/src/utils/constant.js` (hoặc env FE)

### ✅ Chức năng
- Dashboard admin: tổng quan, trạng thái đơn, biểu đồ cơ bản
- Đồng bộ CORS/env/PORT giữa FE/BE; cập nhật README và `.env.example`
- Kiểm thử end-to-end sau tích hợp

### 🚀 Mở rộng
- Doanh thu theo thời gian; sản phẩm bán chạy; i18n; dark mode; lazy-loading ảnh

---

## 🗺️ Mapping nhanh: “File nào thuộc chức năng nào”
- Auth/User:
  - BE: `authController.js`, `userController.js`, `authRoutes.js`, `userRoutes.js`, `authMiddleware.js`, `userModel.js`, `OtpModel.js`
  - FE: `authApi.js`, `userApi.js`, `LoginPage.js`, `RegisterPage.js`, `ForgotPasswordPage.js`, `ProfilePage.js`, `ProtectedRoute.js`, `utils/createInstance.js`
- Product/Category:
  - BE: `productController.js`, `categoryController.js`, `productRoutes.js`, `categoryRoutes.js`, `productModel.js`, `categoryModel.js`, `middleware/uploadMiddleware.js`
  - FE: `productApi.js`, `categoryApi.js`, `OurStore.js`, `ProductDetail.js`, `ManageProducts.js`, `ManageCategories.js`, `components/ProductCard.js`
- Cart:
  - BE: `cartController.js`, `cartRoutes.js`, `cartModel.js`
  - FE: `cartApi.js`, `CartPage.js`
- Orders:
  - BE: `orderController.js`, `orderRoutes.js`, `orderModel.js`
  - FE: `orderApi.js`, `CheckoutPage.js`, `TrackingOrderPage.js`, `ManageOrders.js`
- Statistics/Integration:
  - BE: `statisticsController.js`, `statisticsRoutes.js`, `server.js`, `routes/index.js`, `config/db/connectDB.js`
  - FE: `statisticsApi.js`, `ManageStatistics.js`, `utils/constant.js`

---

## 🔧 Ghi chú tích hợp
- Đặt BE `PORT=8000` để khớp FE `API_BASE_URL` mặc định (hoặc đổi FE constants/env)
- CORS: cho phép `http://localhost:3000` (nên đưa vào env để linh hoạt)
- Bảo mật: thêm `adminMiddleware` cho `PUT /api/orders/status`
- FE axios: giữ interceptor refresh token trong `utils/createInstance.js`
- README + `.env.example`: mô tả đầy đủ biến môi trường FE/BE


