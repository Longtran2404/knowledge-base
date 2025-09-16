# Hướng dẫn cấu hình EmailJS cho hệ thống email verification

## Bước 1: Tạo tài khoản EmailJS

1. Truy cập [https://www.emailjs.com/](https://www.emailjs.com/)
2. Đăng ký tài khoản miễn phí
3. Xác thực email

## Bước 2: Tạo Email Service

1. Vào **Email Services** → **Add New Service**
2. Chọn **Gmail** (hoặc email provider khác)
3. Kết nối với Gmail account của bạn
4. Lưu **Service ID** (ví dụ: `service_abc123`)

## Bước 3: Tạo Email Templates

### Template 1: Email Verification

1. Vào **Email Templates** → **Create New Template**
2. Template ID: `template_verification`
3. Subject: `Xác thực tài khoản Nam Long Center`
4. Nội dung template:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div
    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;"
  >
    <h1 style="color: white; margin: 0; font-size: 24px;">Nam Long Center</h1>
  </div>

  <div style="padding: 30px; background: #f8f9fa;">
    <h2 style="color: #333; margin-bottom: 20px;">Xác thực tài khoản</h2>

    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
      Xin chào {{to_name}},
    </p>

    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
      Cảm ơn bạn đã đăng ký tài khoản tại Nam Long Center. Để hoàn tất quá trình
      đăng ký, vui lòng xác thực email của bạn bằng cách nhấn vào nút bên dưới:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a
        href="{{verification_url}}"
        style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                border-radius: 5px; font-weight: bold; display: inline-block;"
      >
        Xác thực tài khoản
      </a>
    </div>

    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
      Hoặc copy và paste link này vào trình duyệt:
    </p>

    <p
      style="color: #667eea; word-break: break-all; background: #f0f0f0; padding: 10px; 
              border-radius: 5px; font-family: monospace;"
    >
      {{verification_url}}
    </p>

    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
      Link này sẽ hết hạn sau 24 giờ.
    </p>

    <p style="color: #666; line-height: 1.6;">
      Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
    </p>
  </div>

  <div
    style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;"
  >
    <p style="margin: 0;">© 2024 Nam Long Center. All rights reserved.</p>
    <p style="margin: 5px 0 0 0;">
      Cần hỗ trợ? Liên hệ:
      <a href="mailto:{{support_email}}" style="color: #667eea;"
        >{{support_email}}</a
      >
    </p>
  </div>
</div>
```

### Template 2: Password Reset

1. Template ID: `template_password_reset`
2. Subject: `Đặt lại mật khẩu Nam Long Center`
3. Nội dung tương tự như verification nhưng thay đổi nội dung

### Template 3: Welcome Email

1. Template ID: `template_welcome`
2. Subject: `Chào mừng đến với Nam Long Center`
3. Nội dung chào mừng

## Bước 4: Lấy Public Key

1. Vào **Account** → **General**
2. Copy **Public Key** (ví dụ: `user_abc123`)

## Bước 5: Cập nhật cấu hình

Mở file `src/lib/email-config.ts` và cập nhật:

```typescript
export const EMAIL_CONFIG = {
  serviceId: "service_abc123", // Thay bằng Service ID thật
  templateId: "template_verification", // Thay bằng Template ID thật
  publicKey: "user_abc123", // Thay bằng Public Key thật
  // ... các cấu hình khác
};
```

## Bước 6: Test email

1. Chạy ứng dụng: `npm start`
2. Đăng ký tài khoản mới
3. Kiểm tra email thật đã được gửi chưa

## Lưu ý quan trọng

- **Miễn phí**: EmailJS cho phép gửi 200 email/tháng miễn phí
- **Bảo mật**: Không bao giờ commit Public Key vào Git
- **Environment Variables**: Nên sử dụng `.env` file để lưu trữ keys
- **Rate Limiting**: Có giới hạn số email gửi trong 1 giờ

## Troubleshooting

### Lỗi "Invalid template ID"

- Kiểm tra Template ID có đúng không
- Đảm bảo template đã được publish

### Lỗi "Invalid service ID"

- Kiểm tra Service ID có đúng không
- Đảm bảo service đã được kích hoạt

### Lỗi "Invalid public key"

- Kiểm tra Public Key có đúng không
- Đảm bảo key chưa bị revoke

### Email không được gửi

- Kiểm tra console để xem lỗi chi tiết
- Kiểm tra quota còn lại
- Kiểm tra email có bị spam không

