# Hệ thống Xác thực Email - Knowledge Base

## Tổng quan

Hệ thống xác thực email tự xây dựng thay thế Supabase Auth, bao gồm:

- Đăng ký tài khoản với xác thực email
- Đăng nhập với email và mật khẩu
- Tự động đăng nhập sau khi xác thực email
- Đặt lại mật khẩu qua email
- Gửi email chuyên nghiệp với tên "Knowledge Base"

## Cài đặt

### 1. Cài đặt Dependencies

```bash
npm install nodemailer bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# App Configuration
REACT_APP_APP_URL=http://localhost:3000
```

### 3. Cấu hình Email

#### Gmail Setup:

1. Bật 2-Factor Authentication
2. Tạo App Password: Google Account > Security > 2-Step Verification > App passwords
3. Sử dụng App Password thay vì mật khẩu thường

#### Các nhà cung cấp email khác:

- **SendGrid**: Sử dụng API key
- **AWS SES**: Sử dụng Access Key và Secret Key
- **Mailgun**: Sử dụng API key

### 4. Cập nhật Database

Chạy file SQL để tạo các bảng cần thiết:

```sql
-- Chạy file database/email-auth-schema.sql
```

## Cấu trúc Hệ thống

### 1. Email Authentication (`src/lib/email-auth.ts`)

- `registerUser()`: Đăng ký tài khoản mới
- `verifyEmail()`: Xác thực email
- `loginUser()`: Đăng nhập
- `logoutUser()`: Đăng xuất
- `requestPasswordReset()`: Yêu cầu đặt lại mật khẩu
- `resetPassword()`: Đặt lại mật khẩu

### 2. Email Service (`src/lib/email-service.ts`)

- `sendEmail()`: Gửi email chung
- `sendVerificationEmail()`: Gửi email xác thực
- `sendPasswordResetEmail()`: Gửi email đặt lại mật khẩu
- `sendWelcomeEmail()`: Gửi email chào mừng

### 3. Auth Context (`src/contexts/EmailAuthContext.tsx`)

- Quản lý trạng thái đăng nhập
- Tự động đăng nhập sau xác thực
- Quản lý session và token

### 4. Pages

- `/auth`: Trang đăng nhập/đăng ký
- `/verify-email`: Xác thực email
- `/reset-password`: Đặt lại mật khẩu
- `/resend-verification`: Gửi lại email xác thực

## Flow Hoạt động

### 1. Đăng ký Tài khoản

1. User điền form đăng ký
2. Hệ thống tạo tài khoản (chưa xác thực)
3. Gửi email xác thực
4. User click link trong email
5. Tự động đăng nhập sau khi xác thực

### 2. Đăng nhập

1. User nhập email/password
2. Kiểm tra email đã xác thực
3. Xác thực mật khẩu
4. Tạo session và đăng nhập

### 3. Đặt lại Mật khẩu

1. User nhập email
2. Gửi email đặt lại mật khẩu
3. User click link và nhập mật khẩu mới
4. Cập nhật mật khẩu thành công

## Email Templates

Hệ thống sử dụng 3 loại email template:

### 1. Email Xác thực

- Thiết kế chuyên nghiệp với logo Knowledge Base
- Link xác thực có thời hạn 24 giờ
- Hướng dẫn rõ ràng cho người dùng

### 2. Email Đặt lại Mật khẩu

- Link đặt lại có thời hạn 1 giờ
- Mẹo bảo mật mật khẩu
- Cảnh báo bảo mật

### 3. Email Chào mừng

- Giới thiệu các tính năng
- Hướng dẫn sử dụng
- Thông tin liên hệ

## Bảo mật

### 1. Mật khẩu

- Hash bằng bcrypt với salt rounds = 12
- Yêu cầu tối thiểu 8 ký tự
- Không lưu mật khẩu gốc

### 2. Token

- JWT cho session management
- Refresh token cho gia hạn session
- Token xác thực email có thời hạn

### 3. Session

- Session token có thời hạn 7 ngày
- Refresh token có thời hạn 30 ngày
- Tự động làm mới session

## Monitoring và Logs

### 1. Email Logs

- Lưu trữ tất cả email đã gửi
- Theo dõi trạng thái gửi
- Retry cho email thất bại

### 2. Session Logs

- Theo dõi đăng nhập/đăng xuất
- IP address và User Agent
- Thời gian hoạt động

## Troubleshooting

### 1. Email không gửi được

- Kiểm tra cấu hình SMTP
- Xác minh App Password (Gmail)
- Kiểm tra firewall/antivirus

### 2. Token không hợp lệ

- Kiểm tra JWT_SECRET
- Xác minh thời gian hết hạn
- Kiểm tra database connection

### 3. Session bị mất

- Kiểm tra localStorage
- Xác minh session token
- Kiểm tra network connection

## Development

### 1. Chạy Development Server

```bash
npm start
```

### 2. Build Production

```bash
npm run build
```

### 3. Test Email Configuration

```typescript
import { testEmailConfiguration } from "./src/lib/email-service";

testEmailConfiguration().then((valid) => {
  console.log("Email config valid:", valid);
});
```

## Production Deployment

### 1. Environment Variables

- Sử dụng biến môi trường thật
- Không commit file .env
- Sử dụng secret management

### 2. Database

- Chạy migration scripts
- Backup database thường xuyên
- Monitor performance

### 3. Email Service

- Sử dụng email service chuyên nghiệp
- Cấu hình SPF/DKIM records
- Monitor delivery rates

## Support

Nếu gặp vấn đề, liên hệ:

- Email: info@knowledgebase.com
- Hotline: 0123 456 789

---

**Lưu ý**: Hệ thống này thay thế hoàn toàn Supabase Auth. Đảm bảo cập nhật tất cả components sử dụng AuthContext cũ.
