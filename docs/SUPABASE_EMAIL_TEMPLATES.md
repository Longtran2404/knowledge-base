# Hướng dẫn chỉnh template email Supabase

## Email xác thực đăng ký (Confirm signup)

1. Vào **Supabase Dashboard** → **Authentication** → **Email Templates** → **Confirm signup**.
2. Chỉnh nội dung và HTML:
   - Thêm tên ứng dụng (Knowledge Base), logo (nếu có).
   - Hướng dẫn rõ ràng: bấm link để xác thực tài khoản.
   - Footer chuyên nghiệp (liên hệ, địa chỉ).
3. Biến có sẵn:
   - `{{ .ConfirmationURL }}` – link xác nhận
   - `{{ .Token }}`, `{{ .TokenHash }}`
   - `{{ .SiteURL }}`

Các template khác (Recover password, Magic Link) chỉnh tương tự trong cùng mục Email Templates.

## Thông báo thanh toán

- Email thông báo **thanh toán thành công** hoặc **lỗi** được gửi tới email tài khoản đã đăng ký thanh toán.
- Dữ liệu thanh toán lưu trong `nlc_accounts`, `nlc_user_subscriptions`, `nlc_subscription_payments` theo `user_id` từ đơn pending (`nlc_sepay_pending_orders`).
- Template gửi qua EmailJS: `payment_success`, `payment_failure` (xem [notification-email-server.ts](../src/lib/notification-email-server.ts)).
