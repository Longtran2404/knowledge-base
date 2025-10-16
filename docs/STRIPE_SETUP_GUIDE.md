# 💳 Stripe Payment Setup Guide - READY FOR REAL TESTING

## 🎯 Overview

Hệ thống thanh toán Visa/Mastercard trực tiếp với Stripe Elements đã sẵn sàng để test thật! Bạn có thể upload tài liệu và test thanh toán ngay lập tức.

## ✅ Tính năng đã hoàn thành

### **1. Thanh toán trực tiếp bằng thẻ**

- ✅ Stripe Elements integration
- ✅ Visa/Mastercard support
- ✅ Real-time payment processing
- ✅ Secure card input form
- ✅ Payment confirmation

### **2. Hệ thống chia hoa hồng**

- ✅ Tự động tính toán hoa hồng
- ✅ Hỗ trợ đối tác (partners)
- ✅ Tỷ lệ hoa hồng theo loại sản phẩm:
  - Khóa học: 15% nền tảng, 85% đối tác
  - Tài liệu: 20% nền tảng, 80% đối tác
  - Subscription: 10% nền tảng, 90% đối tác
  - Membership: 25% nền tảng, 75% đối tác

### **3. Webhook xử lý**

- ✅ Payment success/failure handling
- ✅ Order status updates
- ✅ Commission processing
- ✅ Email notifications (ready)

## 🚀 Setup Instructions

### **Bước 1: Cài đặt Dependencies**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **Bước 2: Tạo Stripe Account**

1. Truy cập: https://stripe.com
2. Tạo tài khoản miễn phí
3. Lấy API keys từ Dashboard

### **Bước 3: Cấu hình Environment**

Thêm vào file `.env`:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
REACT_APP_STRIPE_SECRET_KEY=sk_test_51ABC123...
REACT_APP_STRIPE_WEBHOOK_SECRET=whsec_ABC123...
REACT_APP_STRIPE_RETURN_URL=http://localhost:3000/payment/stripe/return
REACT_APP_STRIPE_WEBHOOK_URL=http://localhost:3000/api/payment/stripe/webhook

# Commission Configuration
REACT_APP_PLATFORM_COMMISSION_RATE=15
REACT_APP_MIN_COMMISSION_AMOUNT=100
```

### **Bước 4: Test Cards**

Sử dụng thẻ test của Stripe:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Expiry: Bất kỳ tháng/năm trong tương lai
CVC: Bất kỳ 3 chữ số
```

## 🧪 Testing Instructions

### **Test 1: Thanh toán cơ bản**

1. Mở ứng dụng: `npm start`
2. Tạo đơn hàng test
3. Chọn "Visa/Mastercard"
4. Nhập thông tin thẻ test
5. Xác nhận thanh toán

### **Test 2: Thanh toán với đối tác**

1. Tạo đơn hàng với partner info
2. Hệ thống sẽ tự động tính hoa hồng
3. Kiểm tra commission transaction

### **Test 3: Upload tài liệu và bán**

1. Đăng nhập với tài khoản đối tác
2. Upload tài liệu với giá
3. Test mua tài liệu
4. Kiểm tra hoa hồng được chia

## 📁 Files đã tạo

### **Payment Components:**

- `src/components/payment/PaymentProcessor.tsx` - Main payment component
- `src/lib/payment/momo.ts` - Stripe service (renamed from momo.ts)
- `src/lib/api/payment-webhooks.ts` - API endpoints

### **Commission System:**

- `CommissionService` class - Tính toán hoa hồng
- `CommissionTransaction` interface - Giao dịch hoa hồng
- Tích hợp với Stripe service

## 🔧 API Endpoints

### **Create Payment Intent:**

```
POST /api/payment/stripe/create-payment-intent
```

### **Webhook Handler:**

```
POST /api/payment/stripe/webhook
```

## 💰 Commission Rates

| Loại sản phẩm | Nền tảng | Đối tác |
| ------------- | -------- | ------- |
| Khóa học      | 15%      | 85%     |
| Tài liệu      | 20%      | 80%     |
| Subscription  | 10%      | 90%     |
| Membership    | 25%      | 75%     |

## 🎉 Sẵn sàng để test!

Hệ thống đã hoàn chỉnh và sẵn sàng để bạn:

1. **Upload tài liệu** và bán
2. **Test thanh toán thật** với thẻ Visa/Mastercard
3. **Kiểm tra hệ thống hoa hồng** hoạt động
4. **Deploy production** khi cần

---

**Lưu ý:** Đây là hệ thống thanh toán thật, hãy đảm bảo sử dụng test keys trong development và live keys trong production!

