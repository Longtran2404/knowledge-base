# SePay - Cấu hình thanh toán & IPN

Tài liệu: [Bắt đầu nhanh SePay](https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau).

---

## 1. Bảo mật thông tin tích hợp (TUYỆT MẬT)

- **MERCHANT ID** và **SECRET KEY** không được ghi vào code, không commit lên Git, không log ra console.
- Chỉ cấu hình qua **biến môi trường** trên server:
  - **Local:** file `.env` (đã nằm trong `.gitignore`).
  - **Vercel:** Project → Settings → Environment Variables.
- Trong code chỉ dùng `process.env.SEPAY_MERCHANT_ID` và `process.env.SEPAY_SECRET_KEY` (phía server). Không dùng `REACT_APP_SEPAY_*` để tránh lộ secret khi build frontend.

---

## 2. Cấu hình IPN nhận thông báo (từng trang web / từng môi trường)

SePay gửi thông báo khi có giao dịch thanh toán thành công tới **IPN URL** bạn cấu hình. Mỗi môi trường (local, staging, production) nên dùng một URL tương ứng.

### URL IPN theo môi trường

| Môi trường   | URL IPN (điền vào SePay Dashboard) |
|-------------|-------------------------------------|
| **Local**   | Dùng [ngrok](https://ngrok.com/) hoặc công cụ tunnel: `https://xxx.ngrok.io/api/sepay-ipn` |
| **Staging** | `https://staging.your-domain.com/api/sepay-ipn` |
| **Production** | `https://your-domain.com/api/sepay-ipn` |

### Cách cấu hình trong SePay

1. Đăng nhập [my.sepay.vn](https://my.sepay.vn/).
2. Vào **Cổng thanh toán** → **Thông tin tích hợp** (hoặc mục cấu hình IPN).
3. Ở phần **Cấu hình IPN nhận thông báo**:
   - **Môi trường Test (Sandbox):** nhập URL test, ví dụ `https://your-ngrok-url.ngrok.io/api/sepay-ipn` hoặc URL staging.
   - **Môi trường Thực (Production):** sau khi chuyển sang Production, nhập URL production: `https://your-domain.com/api/sepay-ipn`.
4. Bấm **Lưu lại**. Có thể dùng **Gửi test** để kiểm tra endpoint nhận được POST và trả về 200.

### Endpoint IPN trong project

- **Route:** `POST /api/sepay-ipn`
- **File:** `api/sepay-ipn.js`
- SePay gửi JSON (ví dụ `notification_type: "ORDER_PAID"`, `order`, `transaction`). Server trả về **HTTP 200** để xác nhận đã nhận. Trong `api/sepay-ipn.js` bạn có thể cập nhật trạng thái đơn hàng (ví dụ từ `pending` → `paid`) theo `order.order_invoice_number` hoặc `order.order_id`.

---

## 3. Biến môi trường (server)

| Biến | Mô tả | Ví dụ (không dùng giá trị thật trong repo) |
|------|--------|--------------------------------------------|
| `SEPAY_MERCHANT_ID` | MERCHANT ID từ SePay | `SP-TEST-xxxx` (test) |
| `SEPAY_SECRET_KEY`  | SECRET KEY từ SePay  | `spsk_test_xxxx` (test) |
| `SEPAY_ENV`         | `sandbox` hoặc `production` | `sandbox` |

---

## 4. Tóm tắt

- **Khoá thông tin:** Chỉ dùng env server, không REACT_APP_ cho secret, không commit `.env`.
- **IPN từng trang web:** Cấu hình một IPN URL cho từng domain/môi trường (local qua ngrok, staging, production) trong dashboard SePay và dùng đúng URL tương ứng.
