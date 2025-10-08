# 💳 Hệ thống thanh toán cá nhân - Personal Payment System

## 📋 Tổng quan

Hệ thống thanh toán cá nhân cho phép khách hàng thanh toán qua chuyển khoản ngân hàng và admin xác nhận thủ công. Không cần đăng ký doanh nghiệp hay tích hợp cổng thanh toán.

## 🏗️ Kiến trúc hệ thống

### 1. Components

#### **QRPayment.tsx** - Component thanh toán chính
- Hiển thị mã QR để khách hàng quét và chuyển khoản
- Upload ảnh chụp màn hình xác nhận chuyển khoản
- Tích hợp với Supabase Storage và Database
- Location: `src/components/payment/QRPayment.tsx`

**Props:**
```typescript
interface QRPaymentProps {
  amount: number;                          // Số tiền thanh toán
  productType: 'course' | 'product' | 'membership';  // Loại sản phẩm
  productId: string;                       // ID sản phẩm
  productName: string;                     // Tên sản phẩm
  onSuccess?: (transactionId: string) => void;  // Callback khi thành công
  onCancel?: () => void;                   // Callback khi hủy
}
```

**Sử dụng:**
```tsx
import { QRPayment } from '@/components/payment/QRPayment';

function MyPage() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Thanh toán
      </button>

      {showPayment && (
        <QRPayment
          amount={500000}
          productType="course"
          productId="course-123"
          productName="Khóa học React + TypeScript"
          onSuccess={(txnId) => {
            console.log('Payment success:', txnId);
            setShowPayment(false);
          }}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
```

### 2. Services

#### **personal-payment-service.ts** - Service quản lý giao dịch
Location: `src/lib/payment/personal-payment-service.ts`

**Functions:**

```typescript
// Tạo giao dịch mới
createTransaction(input: CreateTransactionInput): Promise<Transaction | null>

// Upload ảnh chứng từ
uploadPaymentScreenshot(transactionId: string, file: File): Promise<string | null>

// Cập nhật URL ảnh chứng từ
updateTransactionScreenshot(transactionId: string, screenshotUrl: string): Promise<boolean>

// Lấy giao dịch theo ID
getTransaction(transactionId: string): Promise<Transaction | null>

// Lấy giao dịch của user
getUserTransactions(userId: string): Promise<Transaction[]>

// Lấy giao dịch chờ xác nhận (admin)
getPendingTransactions(): Promise<Transaction[]>

// Lấy tất cả giao dịch (admin)
getAllTransactions(status?: string, limit?: number): Promise<Transaction[]>

// Admin xác nhận giao dịch
confirmTransaction(transactionId: string, adminId: string, adminNotes?: string): Promise<boolean>

// Admin từ chối giao dịch
rejectTransaction(transactionId: string, adminId: string, adminNotes: string): Promise<boolean>

// Lấy thống kê giao dịch
getTransactionStats(): Promise<{...} | null>
```

### 3. Pages

#### **PaymentVerificationPage.tsx** - Trang admin xác nhận thanh toán
- Hiển thị danh sách giao dịch chờ xác nhận
- Xem ảnh chứng từ chuyển khoản
- Xác nhận hoặc từ chối giao dịch
- Thống kê tổng quan
- Location: `src/pages/admin/PaymentVerificationPage.tsx`
- Route: `/admin/thanh-toan`

## 🗄️ Database Schema

### Table: `nlc_transactions`

```sql
CREATE TABLE nlc_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES nlc_accounts(id),
  amount DECIMAL(12, 2) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  qr_code_data TEXT,
  payment_screenshot_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  confirmed_by UUID REFERENCES nlc_accounts(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_transactions_user_id` - Tìm giao dịch theo user
- `idx_transactions_status` - Lọc theo trạng thái
- `idx_transactions_created_at` - Sắp xếp theo thời gian
- `idx_transactions_product_type` - Lọc theo loại sản phẩm
- `idx_transactions_confirmed_by` - Tìm giao dịch theo admin xác nhận

### View: `nlc_transaction_stats`

```sql
CREATE VIEW nlc_transaction_stats AS
SELECT
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COALESCE(SUM(amount), 0) as total_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0) as confirmed_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
  COALESCE(AVG(amount), 0) as avg_transaction_amount
FROM nlc_transactions;
```

## 🔐 Row Level Security (RLS)

### User Policies:
1. **View own transactions**: Users có thể xem giao dịch của mình
2. **Create own transactions**: Users có thể tạo giao dịch mới
3. **Update own pending**: Users có thể cập nhật giao dịch đang chờ (upload ảnh)

### Admin Policies:
1. **View all transactions**: Admin có thể xem tất cả giao dịch
2. **Update any transaction**: Admin có thể xác nhận/từ chối bất kỳ giao dịch nào

**Admin Role Check:**
```sql
-- Check if user is admin
EXISTS (
  SELECT 1 FROM nlc_accounts
  WHERE id = auth.uid()
  AND (email LIKE '%@admin.namlongcenter.com' OR role = 'admin')
)
```

## 🚀 Cài đặt

### Bước 1: Chạy migration

```bash
# Run Supabase migration
supabase db push

# Or manually execute the SQL file
psql -U postgres -d namlongcenter < supabase/migrations/create_transactions_table.sql
```

### Bước 2: Cấu hình Supabase Storage

Tạo bucket `user-files` nếu chưa có:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-files');
```

### Bước 3: Cập nhật thông tin ngân hàng

Chỉnh sửa file `src/components/payment/QRPayment.tsx`:

```typescript
const BANK_INFO: BankInfo = {
  bankName: 'Vietcombank',           // Tên ngân hàng
  accountNumber: '1234567890',       // Số tài khoản
  accountName: 'NGUYEN VAN NAM LONG', // Tên tài khoản
  swiftCode: 'BFTVVNVX',            // Mã SWIFT (tùy chọn)
};
```

### Bước 4: Cấu hình admin role

**Option 1: Email domain**
Admin email phải có domain `@admin.namlongcenter.com`

**Option 2: Role field**
Update role trong database:

```sql
UPDATE nlc_accounts
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

## 📱 Quy trình thanh toán

### Phía khách hàng:

1. **Chọn sản phẩm/khóa học** → Click "Thanh toán"
2. **Hiển thị QR Code** → Quét bằng app ngân hàng
3. **Chuyển khoản** → Theo thông tin đã hiển thị
4. **Chụp màn hình** → Ảnh xác nhận chuyển khoản thành công
5. **Upload ảnh** → Gửi ảnh chứng từ
6. **Chờ xác nhận** → Admin sẽ xác nhận trong 2-24h

### Phía admin:

1. **Vào trang xác nhận** → `/admin/thanh-toan`
2. **Xem danh sách** → Các giao dịch chờ xác nhận
3. **Kiểm tra ảnh** → Xem ảnh chứng từ chuyển khoản
4. **Xác nhận/Từ chối** → Với ghi chú (tùy chọn)
5. **Thông báo user** → Hệ thống tự động cập nhật trạng thái

## 🎨 UI/UX Features

### QRPayment Component:
- ✅ Gradient background với blur effect
- ✅ Smooth animations với Framer Motion
- ✅ Copy to clipboard cho thông tin ngân hàng
- ✅ Image preview trước khi upload
- ✅ Loading states và error handling
- ✅ Mobile responsive
- ✅ Multi-step flow (QR → Upload → Pending → Success)

### PaymentVerificationPage:
- ✅ Stats cards hiển thị tổng quan
- ✅ Filter tabs (All, Pending, Confirmed, Rejected)
- ✅ Real-time search
- ✅ Modal xem chi tiết và xác nhận
- ✅ Skeleton loading states
- ✅ Color-coded status badges
- ✅ Admin notes textarea

## 🔧 Tùy chỉnh

### Thay đổi QR Code provider

Hiện tại sử dụng `api.qrserver.com`. Có thể thay bằng:

```typescript
// Vietqr.io
const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankName}-${BANK_INFO.accountNumber}-compact.jpg?amount=${amount}&addInfo=${encodeURIComponent(productName)}`;

// QR Code API
const qrUrl = `https://api.qr-code-generator.com/v1/create?access-token=YOUR_TOKEN&qr_code_text=${encodeURIComponent(transferContent)}`;
```

### Custom notification sau khi thanh toán

```typescript
<QRPayment
  amount={500000}
  productType="course"
  productId="course-123"
  productName="Khóa học React"
  onSuccess={(txnId) => {
    // Send email notification
    sendEmail({
      to: userProfile.email,
      subject: 'Đã nhận yêu cầu thanh toán',
      body: `Mã giao dịch: ${txnId}`,
    });

    // Show toast notification
    toast.success('Đã gửi yêu cầu thanh toán!');

    // Redirect to my transactions
    navigate('/ho-so?tab=transactions');
  }}
/>
```

### Thêm webhook sau khi xác nhận

```typescript
// In personal-payment-service.ts
export async function confirmTransaction(
  transactionId: string,
  adminId: string,
  adminNotes?: string
): Promise<boolean> {
  // ... existing code ...

  if (success) {
    // Call webhook
    await fetch('https://your-webhook-url.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment_confirmed',
        transaction_id: transactionId,
        timestamp: new Date().toISOString(),
      }),
    });

    // Grant access to purchased item
    await grantAccess(transaction.user_id, transaction.product_id);
  }

  return success;
}
```

## 📊 Monitoring và Analytics

### Query thống kê nâng cao

```sql
-- Doanh thu theo tháng
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(amount) FILTER (WHERE status = 'confirmed') as revenue
FROM nlc_transactions
WHERE status = 'confirmed'
GROUP BY month
ORDER BY month DESC;

-- Top sản phẩm
SELECT
  product_name,
  product_type,
  COUNT(*) as sales,
  SUM(amount) as revenue
FROM nlc_transactions
WHERE status = 'confirmed'
GROUP BY product_name, product_type
ORDER BY revenue DESC
LIMIT 10;

-- Conversion rate
SELECT
  COUNT(*) FILTER (WHERE status = 'confirmed')::float / NULLIF(COUNT(*), 0) * 100 as conversion_rate
FROM nlc_transactions;

-- Average confirmation time
SELECT
  AVG(EXTRACT(EPOCH FROM (confirmed_at - created_at)) / 3600) as avg_hours
FROM nlc_transactions
WHERE status = 'confirmed';
```

## 🐛 Troubleshooting

### Lỗi upload ảnh
```
Error: Failed to upload screenshot
```
**Giải pháp:** Kiểm tra Supabase Storage bucket `user-files` đã được tạo và cấu hình policies đúng.

### Lỗi RLS permissions
```
Error: new row violates row-level security policy
```
**Giải pháp:** Kiểm tra user đã đăng nhập và có quyền thực hiện action.

### Admin không thấy giao dịch
```
Empty transaction list for admin
```
**Giải pháp:**
1. Kiểm tra role = 'admin' trong `nlc_accounts`
2. Hoặc email phải có domain `@admin.namlongcenter.com`

### QR Code không hiển thị
```
Failed to load QR code image
```
**Giải pháp:** Kiểm tra API `qrserver.com` hoặc thay bằng provider khác.

## 📝 TODO - Future Enhancements

- [ ] Email notification tự động sau khi xác nhận
- [ ] SMS notification qua Twilio/Firebase
- [ ] Export transaction history to Excel
- [ ] Bulk confirmation cho nhiều giao dịch
- [ ] Refund workflow
- [ ] Recurring payments cho membership
- [ ] Multi-currency support
- [ ] Payment installment plan
- [ ] Integration với ZaloPay/MoMo (optional)
- [ ] Auto-confirmation với bank API (nếu có)

## 🔒 Security Notes

1. **Không lưu thông tin thẻ** - Chỉ lưu screenshot chuyển khoản
2. **RLS enabled** - Database access được bảo vệ bởi RLS policies
3. **Admin-only confirmation** - Chỉ admin mới confirm được payment
4. **Audit trail** - Log đầy đủ: confirmed_by, confirmed_at, admin_notes
5. **File validation** - Kiểm tra file size (5MB) và type (images only)
6. **Rate limiting** - Nên thêm rate limit cho upload API

## 📞 Support

Nếu cần hỗ trợ:
1. Check logs trong Supabase Dashboard
2. Review RLS policies trong SQL Editor
3. Test với Postman/Thunder Client
4. Contact: admin@namlongcenter.com
