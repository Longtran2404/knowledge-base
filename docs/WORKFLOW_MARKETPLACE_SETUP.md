# n8n Workflow Marketplace - Setup Guide

## 📋 Tổng quan

Hệ thống **n8n Workflow Marketplace** cho phép admin/partners bán workflows n8n với thanh toán QR code và gửi file tự động qua email.

### ✨ Tính năng chính

1. **Workflow Marketplace** (`/workflows`) - Khách hàng xem và mua workflows
2. **Checkout với QR Payment** - Thanh toán qua VNPay QR code
3. **Admin Management** (`/admin/workflows`) - Quản lý workflows, đơn hàng
4. **Email Notifications**:
   - Admin nhận thông báo khi khách upload chứng từ thanh toán
   - Khách nhận email với file workflow + tài liệu sau khi admin duyệt
5. **Protected Video Player** - DRM cho video workflow

---

## 🗄️ Bước 1: Setup Database

### 1.1. Chạy SQL Script

Kết nối vào Supabase SQL Editor và chạy file:

```bash
database/workflow-marketplace.sql
```

Script này sẽ tạo:

- **3 Tables**: `nlc_workflows`, `nlc_workflow_orders`, `nlc_workflow_reviews`
- **RLS Policies**: Bảo mật theo role
- **Indexes**: Tối ưu truy vấn
- **Sample Data**: 3 workflows mẫu

### 1.2. Kiểm tra Database

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'nlc_workflow%';

-- Check sample data
SELECT workflow_name, workflow_status, workflow_price
FROM nlc_workflows;
```

---

## 📁 Bước 2: Setup Supabase Storage Buckets

### 2.1. Tạo 4 Storage Buckets

Vào Supabase Dashboard → **Storage** → Create Bucket:

#### Bucket 1: `workflow-files`
- **Tên**: `workflow-files`
- **Public**: ❌ Private
- **File Size Limit**: 10MB
- **Allowed MIME Types**: `application/json`

```sql
-- Bucket Policy cho workflow-files
CREATE POLICY "Admins/Partners can upload workflow files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workflow-files'
  AND auth.uid() IN (
    SELECT user_id FROM nlc_accounts
    WHERE role IN ('admin', 'partner', 'instructor')
  )
);

CREATE POLICY "Anyone can read workflow files after purchase"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workflow-files');
```

#### Bucket 2: `workflow-docs`
- **Tên**: `workflow-docs`
- **Public**: ❌ Private
- **File Size Limit**: 20MB
- **Allowed MIME Types**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

```sql
-- Bucket Policy cho workflow-docs
CREATE POLICY "Admins/Partners can upload docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workflow-docs'
  AND auth.uid() IN (
    SELECT user_id FROM nlc_accounts
    WHERE role IN ('admin', 'partner', 'instructor')
  )
);

CREATE POLICY "Anyone can read docs after purchase"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workflow-docs');
```

#### Bucket 3: `payment-proofs`
- **Tên**: `payment-proofs`
- **Public**: ✅ Public (để admin xem ảnh chứng từ)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`

```sql
-- Bucket Policy cho payment-proofs
CREATE POLICY "Buyers can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid() IN (
    SELECT user_id FROM nlc_accounts WHERE role = 'admin'
  )
);
```

#### Bucket 4: `workflow-thumbnails`
- **Tên**: `workflow-thumbnails`
- **Public**: ✅ Public
- **File Size Limit**: 2MB
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`

```sql
-- Bucket Policy cho workflow-thumbnails
CREATE POLICY "Admins/Partners can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workflow-thumbnails'
  AND auth.uid() IN (
    SELECT user_id FROM nlc_accounts
    WHERE role IN ('admin', 'partner', 'instructor')
  )
);

CREATE POLICY "Everyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workflow-thumbnails');
```

---

## 📧 Bước 3: Setup EmailJS

### 3.1. Tạo EmailJS Account

1. Truy cập: https://www.emailjs.com/
2. **Sign up** với email admin: `tranminhlong2404@gmail.com`
3. Verify email

### 3.2. Connect Email Service

1. Vào **Email Services** → **Add New Service**
2. Chọn **Gmail**
3. **Connect Account**: Đăng nhập Gmail của bạn
4. Copy **Service ID** (ví dụ: `service_knowledgebase`)

### 3.3. Tạo 2 Email Templates

#### Template 1: Admin Payment Notification

1. Vào **Email Templates** → **Create New Template**
2. **Template Name**: `workflow_admin_notification`
3. **Template Content**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Thông báo thanh toán mới</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
    <h1 style="margin: 0;">🔔 Thông báo thanh toán mới</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Knowledge Base - Workflow Marketplace</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
    <h2 style="color: #333; margin-top: 0;">Thông tin đơn hàng</h2>

    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Mã đơn:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{order_code}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Khách hàng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{buyer_name}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{buyer_email}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>SĐT:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{buyer_phone}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Workflow:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{workflow_name}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Số tiền:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #28a745; font-weight: bold;">{{total_amount}}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Thời gian:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{created_at}}</td>
      </tr>
      <tr>
        <td style="padding: 10px;"><strong>Ghi chú:</strong></td>
        <td style="padding: 10px;">{{notes}}</td>
      </tr>
    </table>

    <div style="margin: 20px 0;">
      <p><strong>Ảnh chứng từ thanh toán:</strong></p>
      <a href="{{payment_proof_url}}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Xem ảnh chứng từ
      </a>
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <a href="{{verify_url}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: bold;">
        Xác nhận thanh toán
      </a>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
    <p>Email này được gửi tự động từ hệ thống Knowledge Base</p>
  </div>
</body>
</html>
```

**Template Variables** (Settings):
- `{{order_code}}`
- `{{buyer_name}}`
- `{{buyer_email}}`
- `{{buyer_phone}}`
- `{{workflow_name}}`
- `{{total_amount}}`
- `{{created_at}}`
- `{{notes}}`
- `{{payment_proof_url}}`
- `{{verify_url}}`

#### Template 2: Buyer Workflow Files

1. **Template Name**: `workflow_buyer_files`
2. **Template Content**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Workflow đã sẵn sàng tải về</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
    <h1 style="margin: 0;">🎉 Thanh toán thành công!</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Knowledge Base - Workflow Marketplace</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
    <p style="font-size: 16px; color: #333;">Xin chào <strong>{{buyer_name}}</strong>,</p>

    <p style="color: #666;">
      Cảm ơn bạn đã mua workflow <strong>{{workflow_name}}</strong>!<br>
      Thanh toán của bạn đã được xác nhận thành công.
    </p>

    <div style="background: white; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #333;"><strong>Mã đơn hàng:</strong> {{order_code}}</p>
      <p style="margin: 5px 0 0 0; color: #333;"><strong>Số tiền:</strong> {{total_amount}}</p>
      <p style="margin: 5px 0 0 0; color: #333;"><strong>Xác nhận lúc:</strong> {{confirmed_at}}</p>
    </div>

    <h2 style="color: #333; margin-top: 30px;">📦 Tải xuống Workflow</h2>
    <p style="color: #666;">{{workflow_description}}</p>

    <div style="margin: 20px 0;">
      <a href="{{workflow_file_url}}" style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px 0;">
        ⬇️ Tải file Workflow JSON
      </a>
    </div>

    <h3 style="color: #333; margin-top: 30px;">📄 Tài liệu hướng dẫn</h3>
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; white-space: pre-line;">
      {{documentation_urls}}
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;">
        <strong>⏱️ Lưu ý:</strong> Link tải xuống có hiệu lực trong <strong>{{download_expiry}}</strong>. Vui lòng tải về và lưu trữ ngay.
      </p>
    </div>

    <h3 style="color: #333; margin-top: 30px;">🚀 Hướng dẫn sử dụng</h3>
    <ol style="color: #666; line-height: 1.8;">
      <li>Tải file JSON về máy tính</li>
      <li>Mở n8n và vào Workflows → Import</li>
      <li>Chọn file JSON vừa tải</li>
      <li>Cấu hình các credentials cần thiết</li>
      <li>Active workflow và test thử</li>
    </ol>

    <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #004085;">
        <strong>💡 Cần hỗ trợ?</strong><br>
        Liên hệ: <a href="mailto:{{support_email}}" style="color: #007bff;">{{support_email}}</a>
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
    <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Knowledge Base! 🙏</p>
  </div>
</body>
</html>
```

**Template Variables**:
- `{{buyer_name}}`
- `{{order_code}}`
- `{{workflow_name}}`
- `{{workflow_description}}`
- `{{total_amount}}`
- `{{confirmed_at}}`
- `{{workflow_file_url}}`
- `{{documentation_urls}}`
- `{{download_expiry}}`
- `{{support_email}}`

### 3.4. Copy API Keys

1. Vào **Account** → **API Keys**
2. Copy:
   - **Service ID**: `service_knowledgebase`
   - **Public Key**: `YOUR_PUBLIC_KEY`
   - **Template IDs**:
     - Admin Notification: `workflow_admin_notification`
     - Buyer Files: `workflow_buyer_files`

---

## 🔐 Bước 4: Environment Variables

Thêm vào file `.env`:

```bash
# EmailJS Configuration (đã có sẵn nếu đã setup auth email)
VITE_EMAILJS_SERVICE_ID=service_knowledgebase
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE

# Workflow Marketplace Email Templates
VITE_EMAILJS_TEMPLATE_ADMIN=workflow_admin_notification
VITE_EMAILJS_TEMPLATE_BUYER=workflow_buyer_files
```

---

## 📦 Bước 5: Upload QR Code Image

1. Copy file QR code payment `20250918_102412239_iOS.jpg`
2. Paste vào folder `public/` của project
3. Đảm bảo đường dẫn: `public/20250918_102412239_iOS.jpg`

**Kiểm tra**:
```bash
ls -la public/20250918_102412239_iOS.jpg
```

---

## 🚀 Bước 6: Test System

### 6.1. Build Frontend

```bash
npm install
npm run build
```

### 6.2. Test Flow

#### Test 1: Browse Workflows
1. Mở browser: `http://localhost:5173/workflows`
2. Kiểm tra hiển thị 3 workflows mẫu
3. Test search, filter, sort

#### Test 2: Checkout Flow
1. Click **"Mua ngay"** trên 1 workflow
2. Điền thông tin buyer
3. Upload ảnh chứng từ thanh toán (fake screenshot)
4. Kiểm tra console log: "✅ Admin notification sent"

#### Test 3: Admin Verification
1. Login với account admin
2. Truy cập: `/admin/workflows?tab=orders`
3. Thấy order status `verifying`
4. Click **"Duyệt"**
5. Kiểm tra console log: "✅ Buyer notification sent with files"

#### Test 4: Check Emails
1. Kiểm tra inbox admin: `tranminhlong2404@gmail.com`
   - Phải có email "Thông báo thanh toán mới"
2. Kiểm tra inbox buyer (email test)
   - Phải có email "Thanh toán thành công" với download links

---

## 📊 Bước 7: Upload Workflows thật

### 7.1. Chuẩn bị Files

1. **Workflow JSON**: Export từ n8n
2. **Thumbnail**: Ảnh đại diện (800x600px)
3. **Docs**: PDF hướng dẫn setup

### 7.2. Upload qua Admin Panel

1. Login admin → `/admin/workflows`
2. Tab **"Tạo mới"**
3. Điền thông tin:
   - Tên workflow
   - Mô tả ngắn, mô tả dài
   - Danh mục (VD: Automation, Marketing)
   - Tags (phân cách bởi dấu phẩy)
   - Độ khó: Beginner/Intermediate/Advanced
4. Upload files:
   - Workflow JSON (required)
   - Thumbnail (optional)
   - Documentation (PDF/Word, có thể nhiều file)
5. Pricing:
   - Miễn phí: Check "Workflow miễn phí"
   - Có phí: Nhập giá (VND)
6. Click **"Tạo Workflow"**
7. Status: `pending` (chờ admin duyệt)

### 7.3. Duyệt Workflow (Admin)

1. Tab **"Workflows của tôi"**
2. Tìm workflow status `pending`
3. Click icon **"✅ Duyệt"**
4. Workflow chuyển status → `published`
5. Hiển thị trên `/workflows`

---

## 🔧 Troubleshooting

### Lỗi: "Email failed to send"

**Nguyên nhân**: EmailJS template chưa setup hoặc API key sai

**Fix**:
1. Kiểm tra `.env` có đủ 4 biến EmailJS
2. Vào EmailJS dashboard kiểm tra template names chính xác
3. Test send email thủ công từ EmailJS dashboard
4. Kiểm tra console log có fallback message không

### Lỗi: "Storage bucket not found"

**Nguyên nhân**: Chưa tạo bucket trong Supabase

**Fix**:
1. Vào Supabase → Storage
2. Tạo 4 buckets theo hướng dẫn Bước 2
3. Check bucket policies đã apply

### Lỗi: "Failed to create signed URL"

**Nguyên nhân**: File không tồn tại hoặc bucket policy chặn

**Fix**:
1. Kiểm tra file đã upload vào bucket chưa
2. Check RLS policy cho bucket
3. Thử tạo signed URL thủ công từ Supabase dashboard

### Orders không hiển thị

**Nguyên nhân**: RLS policy chặn query

**Fix**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'nlc_workflow_orders';

-- Temporarily disable RLS for testing (KHÔNG làm trên production!)
ALTER TABLE nlc_workflow_orders DISABLE ROW LEVEL SECURITY;
```

---

## 📚 API Endpoints Reference

### Workflow APIs

```typescript
// Get published workflows (public)
const { workflows } = await workflowApi.getPublishedWorkflows({
  search: 'automation',
  sortBy: 'popular',
  filters: { category: 'Marketing', isFree: false }
});

// Get my workflows (creator only)
const { workflows } = await workflowApi.getMyWorkflows();

// Create workflow (admin/partner)
const workflow = await workflowApi.createWorkflow({
  workflow_name: 'Auto Social Media Post',
  workflow_slug: 'auto-social-media',
  workflow_price: 299000,
  // ... other fields
});

// Publish workflow (admin only)
await workflowApi.publishWorkflow(workflowId);

// Reject workflow (admin only)
await workflowApi.rejectWorkflow(workflowId, 'Lý do từ chối');
```

### Order APIs

```typescript
// Create order
const order = await orderApi.createOrder({
  workflow_id: 'uuid',
  buyer_name: 'Nguyễn Văn A',
  buyer_email: 'test@example.com',
  buyer_phone: '0901234567',
});

// Upload payment proof
await orderApi.uploadPaymentProof({
  order_id: order.id,
  payment_proof_image: 'https://...',
});

// Verify order (admin only)
await orderApi.verifyOrder({
  orderId: order.id,
  approved: true,
  adminNotes: 'Đã kiểm tra thanh toán',
});
```

---

## 🎯 Next Steps

1. ✅ Setup database, storage, EmailJS
2. ✅ Test complete flow end-to-end
3. 📝 Tạo workflows thật và upload
4. 📣 Announce marketplace ra cộng đồng
5. 📊 Monitor orders và support khách hàng

---

## 📞 Support

**Admin Email**: tranminhlong2404@gmail.com
**Hotline**: 0703189963

---

**🎉 Hoàn tất setup! Hệ thống Workflow Marketplace đã sẵn sàng hoạt động.**
