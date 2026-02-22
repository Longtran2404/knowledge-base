# Gmail OAuth2 – Gửi email từ Gmail (galamot1@gmail.com)

Tài liệu cấu hình gửi email xác thực và thông báo từ Gmail qua Nodemailer OAuth2. **Không dùng service account** để gửi từ @gmail.com (chỉ dùng được với Google Workspace). Ở đây dùng **OAuth2 (client_id + client_secret + refresh_token)**.

## Bảo mật

- **Không commit** file `.env` hoặc bất kỳ secret nào (client secret, refresh token, private key) lên repo.
- Nếu client secret hoặc private key đã lộ, hãy **đổi lại** (Google Cloud Console → APIs & Credentials → OAuth 2.0 Client → Reset secret).
- Tất cả giá trị nhạy cảm chỉ đặt trong **biến môi trường** (`.env`), và `.env` đã nằm trong `.gitignore`.

## Biến môi trường cần thiết

Trong `.env` (copy từ `.env.example` và điền giá trị):

```env
GMAIL_USER=galamot1@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

- **GMAIL_USER**: Địa chỉ Gmail dùng để gửi (ví dụ galamot1@gmail.com).
- **GMAIL_CLIENT_ID**, **GMAIL_CLIENT_SECRET**: Lấy từ Google Cloud Console (OAuth 2.0 Client).
- **GMAIL_REFRESH_TOKEN**: Lấy **một lần** qua bước OAuth2 bên dưới.

## Lấy refresh_token (một lần)

Gmail gửi từ tài khoản @gmail.com cần **refresh_token**. Client_id và client_secret bạn đã có; cần thêm bước “đăng nhập và đồng ý” để nhận refresh_token.

### Cách 1: Google OAuth2 Playground

1. Mở [Google OAuth2 Playground](https://developers.google.com/oauthplayground).
2. Bên phải **Step 1**: chọn scope **Gmail API v1** → tick `https://mail.google.com/` (hoặc `https://www.googleapis.com/auth/gmail.send`).
3. Bấm **Authorize APIs**, đăng nhập bằng tài khoản **Gmail cần gửi** (ví dụ galamot1@gmail.com) và đồng ý.
4. **Step 2**: Bấm **Exchange authorization code for tokens**.
5. Trong response, copy giá trị **refresh_token** và dán vào `.env`:

   ```env
   GMAIL_REFRESH_TOKEN=1//0g...
   ```

**Lưu ý**: Nếu dùng OAuth2 Playground lần đầu, cần cấu hình **OAuth consent screen** và thêm **Test users** (hoặc publish app) trong Google Cloud Console; Client ID của Playground có thể khác với project của bạn. Để dùng đúng client_id/client_secret của project:

- Trong Playground, bấm bánh răng (Settings), tick **Use your own OAuth credentials** và nhập **OAuth Client ID** và **OAuth Client secret** của project.
- Sau đó làm lại Step 1 và Step 2.

### Cách 2: Script Node (tùy chọn)

Có thể viết script Node nhỏ: mở URL consent (dùng client_id của bạn), user đăng nhập Gmail, đổi authorization code lấy **refresh_token** rồi in ra để copy vào `.env`. Script cần redirect URI (ví dụ `http://localhost`) đã được thêm vào OAuth client trong Console.

## Cấu hình Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → chọn project (ví dụ neon-chimera-470803-e6).
2. **APIs & Services** → **OAuth consent screen**: cấu hình Consent screen (User type: External nếu cho mọi user, hoặc Internal nếu chỉ trong tổ chức); thêm Test users nếu đang ở chế độ Testing.
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**: chọn Application type **Web application** (hoặc **Desktop** nếu dùng script local). Thêm **Authorized redirect URIs** nếu dùng script (ví dụ `http://localhost:3000` hoặc URI của OAuth2 Playground).
4. Bật **Gmail API**: **APIs & Services** → **Library** → tìm **Gmail API** → Enable.

Sau khi có **Client ID** và **Client Secret**, dùng một trong hai cách trên để lấy **refresh_token** và ghi vào `.env`.

## Luồng trong app

- **Gửi email xác thực**: API `POST /api/request-verification-email` (body: `{ email, userName? }`) tạo JWT, link `/xac-minh-email?token=...`, gọi `gmail-sender` gửi từ Gmail.
- **Xác thực token**: User bấm link → trang `/xac-minh-email` gọi `GET /api/verify-email?token=...` → backend xác thực JWT và trả `{ success, email }`.
- **Gửi có sẵn link** (từ server khác): `POST /api/send-verification-email` (header `X-Notification-Secret`) với body `{ email, verifyLink, userName }` chỉ gửi nội dung, không tạo token.

## Service account

Service account (file JSON với private key) **không dùng để gửi email từ @gmail.com** (chỉ dùng được với Google Workspace và domain-wide delegation). Nếu sau này dùng service account cho API khác (Sheets, Drive), lưu file JSON **ngoài repo** và dùng biến môi trường `GOOGLE_APPLICATION_CREDENTIALS` trỏ tới đường dẫn file; không đưa private key vào code.

## Tóm tắt

1. Điền `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` vào `.env`.
2. Lấy **refresh_token** một lần (OAuth2 Playground hoặc script) và thêm `GMAIL_REFRESH_TOKEN` vào `.env`.
3. Không commit `.env`; nên xoay client secret nếu đã từng lộ.
