## Final Project SDN302 – Clothing Store (FE + BE)

Kho lưu trữ này gồm Frontend (React) và Backend (Node.js/Express) cho ứng dụng cửa hàng quần áo. Tài liệu này hướng dẫn thiết lập môi trường, cách chạy local, và danh sách file/thư mục cần copy để chuyển sang repo mới.

### 1) Công nghệ sử dụng
- Backend: Node.js, Express, MongoDB (Mongoose), JWT (access + refresh qua cookie httpOnly), Nodemailer (Gmail OTP), Multer (upload ảnh).
- Frontend: React (CRA), Axios có interceptor (tự refresh token), React Router.

### 2) Cấu trúc dự án (chính)
- `BE/ClothingStoreSDN/`
  - `src/server.js`: Khởi tạo Express, CORS, static uploads, mount routes, kết nối DB.
  - `src/routes/`: Các router API (`auth`, `users`, `products`, `categories`, `carts`, `orders`, `statistics`).
  - `src/controllers/`: Xử lý request cho từng domain.
  - `src/models/`: Mongoose models (User, Product, Category, Cart, Order, OTP).
  - `src/middleware/`: Auth (JWT/RBAC) và upload middleware.
  - `src/uploads/`: Ảnh upload (avatars/products) phục vụ tĩnh.
- `FE/FE_Clothing_Store_SDN/`
  - `src/utils/createInstance.js`: Tạo axios instance, tự làm mới access token.
  - `src/utils/constant.js`: Hằng số URL API và URL ảnh (môi trường dev).
  - `src/api/`: Lớp client gọi API (auth, user, product, category, cart, order, statistics).
  - `src/pages/`: Trang User/Admin và các luồng sử dụng.

### 3) Yêu cầu trước khi chạy
- Node.js 18+ và npm.
- MongoDB đang chạy + connection string hợp lệ.
- Tài khoản Gmail + app password cho gửi OTP ở môi trường dev (hoặc tắt OTP nếu không cần).

### 4) Biến môi trường

Backend (`BE/ClothingStoreSDN/.env`):
```
PORT=8000                    # Khuyến nghị 8000 để khớp FE mặc định
DATABASE_URL=mongodb+srv://<user>:<pass>@<host>/<db>?retryWrites=true&w=majority

ACCESS_TOKEN_SECRET=thay_bang_chuoi_bao_mat
REFRESH_TOKEN_SECRET=thay_bang_chuoi_bao_mat

EMAIL_USER=dia_chi_gmail_cua_ban
EMAIL_PASS=app_password_gmail

# CORS origin (tuỳ chọn đưa ra env)
# CORS_ORIGIN=http://localhost:3000
```

Frontend (trong dự án hiện tại — `FE/FE_Clothing_Store_SDN/src/utils/constant.js`):
```
export const URL_IMG = "http://localhost:8000/uploads/";
export const API_BASE_URL = "http://localhost:8000/api";
```
Gợi ý: Ở repo mới có thể chuyển sang biến môi trường CRA: `REACT_APP_API_BASE_URL`, `REACT_APP_URL_IMG`.

### 5) Chạy local (development)
Mở hai terminal riêng.

Backend
```
cd BE/ClothingStoreSDN
npm install
# tạo file .env như trên
npm start
```

Frontend
```
cd FE/FE_Clothing_Store_SDN
npm install
npm start
```

Ghi chú
- CORS ở backend đang cho phép `http://localhost:3000` mặc định. Điều chỉnh nếu FE chạy ở cổng/host khác.
- FE đang gọi backend tại `http://localhost:8000`. Nếu backend chạy cổng khác, cập nhật `src/utils/constant.js` (hoặc dùng env FE).

### 6) Bảo mật và phân quyền (RBAC)
- Đảm bảo route cần bảo vệ đều dùng `verifyToken` và `adminMiddleware` phù hợp.
- Quan trọng: `PUT /api/orders/status` nên giới hạn admin (thêm `adminMiddleware`).
- Production: đặt `secure: true` cho refresh cookie và cấu hình `sameSite`/`domain` phù hợp.

### 7) Cần copy gì sang repo mới

Bắt buộc — Backend
- Copy toàn bộ thư mục `BE/ClothingStoreSDN/`
  - Giữ: `src/` (toàn bộ: `controllers`, `routes`, `models`, `middleware`, `config`, `uploads`)
  - Giữ: `package.json`, `package-lock.json`
  - Tạo mới: `.env` (KHÔNG commit), có thể thêm `.env.example`
  - Tuỳ chọn: xoá nội dung `src/uploads/` nếu muốn sạch dữ liệu ảnh mẫu

Bắt buộc — Frontend
- Copy toàn bộ thư mục `FE/FE_Clothing_Store_SDN/`
  - Giữ: `src/` (đặc biệt `utils/createInstance.js`, `utils/constant.js`, `api/`, `pages/`, `components/`)
  - Giữ: `public/`, `package.json`, `package-lock.json`
  - Cập nhật: `src/utils/constant.js` hoặc chuyển sang biến môi trường `REACT_APP_*` (đặt `.env` ở root FE, không commit)

Tuỳ chọn / Không bắt buộc
- `db/` (các JSON chỉ tham khảo; backend chạy MongoDB, không dùng các file này lúc runtime)
- `SDN/` (ảnh demo, không cần cho runtime)

### 8) Checklist migrate nhanh
1. Tạo repo trống mới.
2. Copy `BE/ClothingStoreSDN/` và `FE/FE_Clothing_Store_SDN/` vào root repo mới.
3. Thêm `.gitignore` ở root (Node, React, env files, uploads nếu muốn).
4. Tạo `BE/ClothingStoreSDN/.env` với secret và URL MongoDB của bạn.
5. Kiểm tra `API_BASE_URL` và `URL_IMG` ở FE khớp với `PORT` backend.
6. Chạy `npm install` cho cả FE và BE, sau đó start cả hai.
7. Kiểm thử các luồng: auth (login/register/OTP), danh sách sản phẩm, giỏ hàng, checkout, admin.

### 9) Scripts
- Backend: `npm start` chạy `nodemon src/server.js` (tự reload khi dev).
- Frontend: `npm start` chạy dev server của CRA.

### 10) Cải tiến khuyến nghị (sau khi migrate)
- Đưa CORS origin và FE base URL ra biến môi trường.
- Tăng cứng refresh cookie cho production.
- Bổ sung xoá ảnh khi xoá sản phẩm (nếu thêm endpoint delete).
- Thêm `.env.example` cho BE và FE để tài liệu hoá biến môi trường cần thiết.

### 11) Tài khoản demo admin/user (nếu có)
- Bổ sung sau khi bạn tạo dữ liệu ở môi trường mới.

---
Nếu bạn muốn, mình có thể tạo sẵn `.env.example` và `.gitignore` ở root phù hợp cho Node + React.


