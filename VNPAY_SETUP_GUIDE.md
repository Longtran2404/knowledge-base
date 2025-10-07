# 🏦 Hướng dẫn tích hợp VNPay cho Nam Long Center

## 📋 Tổng quan

VNPay là cổng thanh toán hàng đầu Việt Nam, hỗ trợ thanh toán qua:
- Thẻ ATM nội địa
- Thẻ Visa/MasterCard
- Ví điện tử
- QR Code
- Internet Banking

## 🔧 Bước 1: Đăng ký tài khoản VNPay

### 1.1 Truy cập VNPay Merchant Portal
- Sandbox: https://sandbox.vnpayment.vn
- Production: https://vnpay.vn

### 1.2 Tạo tài khoản Merchant
1. Điền form đăng ký với thông tin doanh nghiệp
2. Upload giấy tờ pháp lý:
   - Giấy phép kinh doanh
   - Chứng minh nhân dân/CCCD của người đại diện
   - Giấy ủy quyền (nếu có)

### 1.3 Chờ phê duyệt
- Thời gian phê duyệt: 3-5 ngày làm việc
- VNPay sẽ liên hệ qua email/điện thoại để hỗ trợ

## 🔑 Bước 2: Lấy thông tin kết nối

Sau khi được phê duyệt, bạn sẽ nhận được:

```
Terminal ID (vnp_TmnCode): VNP_XXXXXXXX
Hash Secret (vnp_HashSecret): XXXXXXXXXXXXXXXXXXXX
API URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
Return URL: https://yourdomain.com/payment/return
```

## ⚙️ Bước 3: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục root của project:

```bash
# VNPay Configuration
REACT_APP_VNPAY_TMN_CODE=VNP_XXXXXXXX
REACT_APP_VNPAY_HASH_SECRET=XXXXXXXXXXXXXXXXXXXX
REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
REACT_APP_VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
REACT_APP_VNPAY_RETURN_URL=http://localhost:3000/payment/return

# For Production
# REACT_APP_VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
# REACT_APP_VNPAY_API_URL=https://vnpayment.vn/merchant_webapi/api/transaction
```

## 🎯 Bước 4: Sử dụng VNPay Service

### 4.1 Import service
```typescript
import { createVNPayService, VNPayService } from '../lib/vnpay/vnpay-service';
```

### 4.2 Tạo link thanh toán
```typescript
const vnpayService = createVNPayService();

const paymentRequest = {
  amount: 299000, // VNĐ
  orderInfo: 'Thanh toan goi hoi vien premium',
  orderType: 'billpayment',
  txnRef: VNPayService.generateTxnRef(),
  ipAddr: await VNPayService.getClientIP(),
  locale: 'vn',
  bankCode: 'VNPAYQR' // Optional
};

const result = vnpayService.createPaymentUrl(paymentRequest);
if (result.paymentUrl) {
  window.location.href = result.paymentUrl;
}
```

### 4.3 Xử lý kết quả thanh toán
```typescript
// Tại trang return URL
const urlParams = new URLSearchParams(window.location.search);
const vnp_Params: Record<string, string> = {};

for (const [key, value] of urlParams.entries()) {
  if (key.startsWith('vnp_')) {
    vnp_Params[key] = value;
  }
}

const isValid = vnpayService.verifyReturnUrl(vnp_Params);
const responseCode = vnp_Params.vnp_ResponseCode;

if (isValid && responseCode === '00') {
  // Thanh toán thành công
  console.log('Payment success!');
} else {
  // Thanh toán thất bại
  console.log('Payment failed!');
}
```

## 🔄 Bước 5: Tạo Return URL Handler

Tạo component xử lý kết quả thanh toán:

```typescript
// src/pages/PaymentReturn.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createVNPayService } from '../lib/vnpay/vnpay-service';

const PaymentReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const vnpayService = createVNPayService();

    // Get all VNPay parameters
    const vnp_Params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('vnp_')) {
        vnp_Params[key] = value;
      }
    }

    // Verify payment
    const isValid = vnpayService.verifyReturnUrl(vnp_Params);
    const responseCode = vnp_Params.vnp_ResponseCode;

    if (isValid && responseCode === '00') {
      setPaymentStatus('success');
      // Update user subscription status
      // Redirect to dashboard
    } else {
      setPaymentStatus('failed');
    }
  }, [searchParams]);

  return (
    <div className="payment-return">
      {paymentStatus === 'loading' && <div>Đang xử lý kết quả thanh toán...</div>}
      {paymentStatus === 'success' && <div>Thanh toán thành công!</div>}
      {paymentStatus === 'failed' && <div>Thanh toán thất bại!</div>}
    </div>
  );
};
```

## 🏪 Bước 6: Cấu hình các ngân hàng

VNPay hỗ trợ nhiều ngân hàng. Sử dụng bank codes:

```typescript
import { VNPayBankCodes } from '../lib/vnpay/vnpay-service';

// Thanh toán qua Vietcombank
const paymentRequest = {
  // ... other fields
  bankCode: VNPayBankCodes.VIETCOMBANK
};

// Thanh toán qua VNPay QR
const paymentRequest = {
  // ... other fields
  bankCode: VNPayBankCodes.VNPAYQR
};
```

## 📱 Bước 7: Test thanh toán

### Thông tin test (Sandbox):
```
Thẻ test: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu: 123456
OTP: 123456
```

### Kịch bản test:
1. Tạo đơn hàng test với số tiền nhỏ (10,000 VNĐ)
2. Chọn phương thức thanh toán VNPay
3. Sử dụng thông tin thẻ test
4. Verify kết quả trả về

## 🚀 Bước 8: Deploy Production

### 8.1 Cập nhật môi trường
```bash
# Production Environment Variables
REACT_APP_VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
REACT_APP_VNPAY_API_URL=https://vnpayment.vn/merchant_webapi/api/transaction
REACT_APP_VNPAY_RETURN_URL=https://namlongcenter.com/payment/return
```

### 8.2 Whitelist Domain
- Đăng nhập VNPay Merchant Portal
- Thêm domain production vào whitelist
- Cấu hình Return URL và IPN URL

### 8.3 Security checklist
- ✅ Hash Secret được lưu an toàn
- ✅ Verify tất cả response từ VNPay
- ✅ Log tất cả giao dịch
- ✅ Implement timeout cho giao dịch
- ✅ Handle các mã lỗi VNPay

## 📞 Hỗ trợ

### VNPay Support:
- Hotline: 1900 55 55 77
- Email: support@vnpay.vn
- Documentation: https://sandbox.vnpayment.vn/apis/

### Mã lỗi thường gặp:
- `00`: Thành công
- `07`: Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).
- `09`: Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.
- `10`: Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần
- `11`: Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.
- `12`: Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.
- `24`: Giao dịch không thành công do: Khách hàng hủy giao dịch

## 💡 Tips và Best Practices

### Performance:
- Cache bank list để tránh gọi API nhiều lần
- Implement retry mechanism cho API calls
- Use connection pooling

### Security:
- Always verify signature
- Log all transactions
- Implement rate limiting
- Use HTTPS cho tất cả endpoints

### User Experience:
- Show loading states
- Provide clear error messages
- Implement auto-redirect after payment
- Support multiple languages (VN/EN)

---

**🎉 Chúc bạn tích hợp VNPay thành công!**