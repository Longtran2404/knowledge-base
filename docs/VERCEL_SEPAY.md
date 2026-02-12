# Deploy lên Vercel + Cấu hình SePay (bảo mật)

**Merchant ID và Secret Key chỉ cấu hình trên Vercel Dashboard, không ghi vào code → hacker không lấy được.**

---

## 1. Deploy lên Vercel

- **Cách 1 (Khuyến nghị – Git):** Vào [vercel.com](https://vercel.com) → **Add New** → **Project** → Import repo **Longtran2404/knowledge-base** → **Deploy**. Sau đó thêm env (bước 2) rồi **Redeploy**.
- **Cách 2 (CLI):** Trong thư mục project chạy `vercel login` (đăng nhập lần đầu), rồi `vercel --prod`.

---

## 2. Cài Merchant ID & Secret (chỉ trên Dashboard)

1. Vercel → chọn project **knowledge-base** → **Settings** → **Environment Variables**.
2. Thêm từng biến (chọn môi trường Production, có thể thêm Preview):

| Name | Value | Ghi chú |
|------|--------|--------|
| `SEPAY_MERCHANT_ID` | (lấy từ [my.sepay.vn](https://my.sepay.vn/) → Cổng thanh toán) | **Bảo mật** |
| `SEPAY_SECRET_KEY` | (Secret Key từ SePay) | **Bảo mật** |
| `SEPAY_ENV` | `sandbox` hoặc `production` | Sandbox để test |

3. **Save** → vào **Deployments** → bấm **Redeploy** (latest) để áp dụng biến môi trường.

---

## 3. Bảo mật – Tại sao hacker không lấy được?

- Giá trị **không** nằm trong source code, **không** commit lên Git.
- Chỉ tồn tại trên **server Vercel** (Environment Variables). API `api/sepay-checkout.js` chạy server-side, đọc `process.env.SEPAY_MERCHANT_ID` và `process.env.SEPAY_SECRET_KEY`; **không** gửi ra browser, **không** dùng `REACT_APP_*`.
- Frontend chỉ gọi `POST /api/sepay-checkout`; server trả về `checkoutURL` + `formFields`, không trả về merchant id hay secret.

---

## 4. IPN sau khi deploy

Trong SePay Dashboard → Cấu hình IPN, nhập:

```text
https://<tên-project>.vercel.app/api/sepay-ipn
```

Ví dụ: `https://knowledge-base-xxx.vercel.app/api/sepay-ipn`

---

Chi tiết hơn: [SEPAY_SETUP.md](./SEPAY_SETUP.md).
