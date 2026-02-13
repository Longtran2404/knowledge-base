# 🎉 n8n Workflow Marketplace - Complete Setup Guide

## ✨ Tổng quan hệ thống

Hệ thống **n8n Workflow Marketplace** hoàn chỉnh với:

### 🎯 Tính năng chính
1. ✅ **AI Image Generation** - Tạo ảnh đẹp cho workflows bằng Gemini AI
2. ✅ **QR Code Payment** - Thanh toán qua VNPay QR (0703189963)
3. ✅ **Email Automation** - Gửi email tự động cho admin và buyer
4. ✅ **Revenue Tracking** - Thống kê doanh thu, hoa hồng chi tiết
5. ✅ **Partner Commission** - Hệ thống hoa hồng 20% cho partners
6. ✅ **Admin Dashboard** - Quản lý workflows, orders, analytics

---

## 📦 Bước 1: Setup Database

### 1.1. Chạy Main Schema

```bash
# Vào Supabase SQL Editor
# Copy và run file:
database/workflow-marketplace.sql
```

**File này tạo**:
- ✅ 3 tables: `nlc_workflows`, `nlc_workflow_orders`, `nlc_workflow_reviews`
- ✅ RLS Policies (đã fix, không cần nlc_accounts)
- ✅ Triggers: auto-update timestamps
- ✅ Sample data: 3 workflows mẫu

### 1.2. Update Beautiful Images

```bash
# Run file này để update ảnh đẹp cho workflows
database/workflow-images-update.sql
```

**Kết quả**:
- ✅ 3 workflows với ảnh Unsplash chất lượng cao
- ✅ Preview images (3 ảnh/workflow)
- ✅ SEO metadata đầy đủ

---

## 📁 Bước 2: Setup Supabase Storage

Tạo 4 buckets trong **Supabase Dashboard → Storage**:

### Bucket 1: `workflow-files`
```sql
-- Settings
Name: workflow-files
Public: NO (Private)
File Size Limit: 10MB
Allowed MIME: application/json

-- RLS Policy
CREATE POLICY "Authenticated users can upload workflow files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workflow-files');

CREATE POLICY "Anyone can read workflow files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workflow-files');
```

### Bucket 2: `workflow-docs`
```sql
-- Settings
Name: workflow-docs
Public: NO (Private)
File Size Limit: 20MB
Allowed MIME: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- RLS Policy
CREATE POLICY "Authenticated users can upload docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workflow-docs');

CREATE POLICY "Anyone can read docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workflow-docs');
```

### Bucket 3: `payment-proofs`
```sql
-- Settings
Name: payment-proofs
Public: YES (Public)
File Size Limit: 5MB
Allowed MIME: image/jpeg, image/png, image/webp

-- RLS Policy
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can read payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');
```

### Bucket 4: `workflow-thumbnails`
```sql
-- Settings
Name: workflow-thumbnails
Public: YES (Public)
File Size Limit: 2MB
Allowed MIME: image/jpeg, image/png, image/webp

-- RLS Policy
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workflow-thumbnails');

CREATE POLICY "Everyone can read thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workflow-thumbnails');
```

---

## 📧 Bước 3: Setup EmailJS

### 3.1. Create Account
1. Vào https://www.emailjs.com/
2. Sign up với email: `tranminhlong2404@gmail.com`
3. Verify email

### 3.2. Connect Gmail Service
1. Email Services → Add New Service
2. Chọn **Gmail**
3. Connect account: `tranminhlong2404@gmail.com`
4. Copy **Service ID**: `service_knowledgebase`

### 3.3. Create Email Templates

#### Template 1: Admin Payment Notification
```
Name: workflow_admin_notification
Subject: 🔔 Thông báo thanh toán mới - {{order_code}}
```

**Template HTML**: Copy từ [WORKFLOW_MARKETPLACE_SETUP.md](WORKFLOW_MARKETPLACE_SETUP.md) section 3.3

**Variables**:
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
```
Name: workflow_buyer_files
Subject: 🎉 Workflow {{workflow_name}} đã sẵn sàng tải về!
```

**Template HTML**: Copy từ [WORKFLOW_MARKETPLACE_SETUP.md](WORKFLOW_MARKETPLACE_SETUP.md) section 3.3

**Variables**:
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

### 3.4. Get API Keys

Vào **Account → API Keys**, copy:
- Public Key: `YOUR_PUBLIC_KEY`
- Service ID: `service_knowledgebase`

---

## 🔐 Bước 4: Environment Variables

Thêm vào `.env`:

```bash
# Gemini AI (Image Generation)
VITE_GEMINI_API_KEY=YOUR_NEW_GEMINI_KEY_HERE

# EmailJS (Already configured for auth)
VITE_EMAILJS_SERVICE_ID=service_knowledgebase
VITE_EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_TEMPLATE_ADMIN=workflow_admin_notification
VITE_EMAILJS_TEMPLATE_BUYER=workflow_buyer_files
```

**⚠️ BẢO MẬT**:
- Revoke API key cũ: `AIzaSyCHhmz6TEWhz2F56cHpo7jQ9-7doTuGHg8`
- Tạo key mới tại: https://aistudio.google.com/app/apikey
- **KHÔNG BAO GIỜ** commit `.env` lên Git

---

## 📸 Bước 5: Upload QR Code Image

```bash
# Copy file QR code
cp 20250918_102412239_iOS.jpg public/

# Verify
ls -la public/20250918_102412239_iOS.jpg
```

---

## 🚀 Bước 6: Build & Test

### 6.1. Install & Build

```bash
npm install
npm run build
npm run dev
```

### 6.2. Test Complete Flow

#### Test 1: Browse Marketplace
```
URL: http://localhost:5173/workflows
✅ Thấy 3 workflows với ảnh đẹp
✅ Search, filter, sort hoạt động
```

#### Test 2: AI Image Generator
```
URL: http://localhost:5173/admin/workflows
Tab: Tạo mới
1. Điền tên workflow
2. Click "Tạo ảnh bằng AI" ✨
3. Chọn suggested prompt hoặc tự viết
4. Click "Tạo ảnh"
5. Preview ảnh → "Sử dụng ảnh này"
✅ Ảnh đã set làm thumbnail
```

#### Test 3: Checkout & Payment
```
1. Click "Mua ngay" trên 1 workflow
2. Điền thông tin buyer
3. Thấy QR code + phone: 0703189963
4. Upload ảnh chứng từ (fake screenshot)
5. Check console: "✅ Admin notification sent"
6. Check email admin: Có email mới
```

#### Test 4: Admin Verify Order
```
URL: http://localhost:5173/admin/workflows?tab=orders
1. Thấy order status "verifying"
2. Click "Duyệt" ✅
3. Check console: "✅ Buyer notification sent with files"
4. Check email buyer: Có email với download links
```

#### Test 5: Analytics Dashboard
```
URL: http://localhost:5173/admin/workflows?tab=analytics
✅ Revenue Stats cards (4 cards)
✅ Quick Stats Grid
✅ Commission Breakdown (for partners)
✅ Top Workflows với rank badges
✅ Progress bars animated
```

---

## 📊 Cấu trúc Files

### Database
```
database/
├── workflow-marketplace.sql       # Main schema (CHẠY ĐẦU TIÊN)
└── workflow-images-update.sql     # Update ảnh đẹp
```

### Frontend Components
```
src/
├── components/
│   └── workflow/
│       ├── AIImageGenerator.tsx         # AI tạo ảnh
│       ├── WorkflowCard.tsx            # Card component
│       ├── RevenueStats.tsx            # Revenue cards
│       └── CommissionBreakdown.tsx     # Hoa hồng breakdown
│
├── pages/
│   ├── WorkflowMarketplacePage.tsx     # Trang marketplace
│   ├── WorkflowCheckoutPage.tsx        # Trang thanh toán
│   └── WorkflowManagementPage.tsx      # Admin dashboard
│       ├── Tab 1: My Workflows         # Quản lý workflows
│       ├── Tab 2: Upload               # Tạo mới + AI image
│       ├── Tab 3: Orders (admin)       # Duyệt thanh toán
│       └── Tab 4: Analytics            # Thống kê doanh thu
│
├── lib/
│   ├── api/
│   │   └── workflow-api.ts             # API calls
│   ├── gemini-image-service.ts         # AI image gen
│   └── email-service.ts                # Email automation
│
└── types/
    └── workflow.ts                      # TypeScript types
```

---

## 💰 Revenue & Commission System

### Admin Revenue
```typescript
Total Revenue = Sum of all confirmed orders
Total Sales = Count of confirmed orders
Average Order Value = Total Revenue / Total Sales
```

### Partner Commission (20%)
```typescript
Commission Per Sale = Order Amount × 20%
Total Commission = Sum of all commissions
```

### Example Calculation
```
Workflow: E-commerce Automation
Price: 299,000đ
Sales: 10 đơn

Admin Revenue: 299,000 × 10 = 2,990,000đ
Partner Commission: 2,990,000 × 20% = 598,000đ
Partner Keeps: 598,000đ
Admin Keeps: 2,392,000đ
```

---

## 🎨 UI/UX Features

### 1. Beautiful Thumbnails
- ✅ Unsplash high-quality images
- ✅ AI-generated với Gemini prompts
- ✅ Fallback gradient placeholders
- ✅ Preview images (3/workflow)

### 2. Modern Analytics
- ✅ Revenue cards với gradients
- ✅ Animated progress bars
- ✅ Rank badges (🥇🥈🥉)
- ✅ Real-time stats update

### 3. Order Management
- ✅ Quick stats cards
- ✅ Status badges (colorful)
- ✅ Payment proof preview
- ✅ One-click verify/reject

### 4. AI Image Generator
- ✅ Beautiful modal design
- ✅ 4 suggested prompts/category
- ✅ 5 style options
- ✅ Live preview
- ✅ Upload to Supabase

---

## 🔧 API Endpoints

### Workflow APIs
```typescript
// Public
GET  /workflows - List published workflows (with filters)
GET  /workflows/:slug - Get workflow details

// Authenticated
POST /workflows - Create new workflow
PUT  /workflows/:id - Update workflow
DELETE /workflows/:id - Delete workflow

// Admin
PUT /workflows/:id/publish - Publish workflow
PUT /workflows/:id/reject - Reject workflow
```

### Order APIs
```typescript
// Public
POST /orders - Create order

// Authenticated
GET /orders/my - Get my orders
PUT /orders/:id/payment-proof - Upload payment proof

// Admin
GET /orders/all - Get all orders
PUT /orders/:id/verify - Verify/reject order
```

### Stats APIs
```typescript
// Admin
GET /stats/admin - Get admin stats (all workflows)

// Partner
GET /stats/partner - Get partner stats (own workflows)
```

---

## 🎯 Next Steps - Production

### 1. Security
- [ ] Enable RLS row-level security
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Sanitize user inputs

### 2. Performance
- [ ] Add Redis caching
- [ ] Optimize images (WebP)
- [ ] Implement CDN
- [ ] Database indexes

### 3. Features
- [ ] Workflow reviews system
- [ ] Affiliate program
- [ ] Webhook notifications
- [ ] Auto-refund system

### 4. Marketing
- [ ] SEO optimization
- [ ] Social sharing
- [ ] Email marketing
- [ ] Analytics tracking

---

## 📞 Support

**Admin Email**: tranminhlong2404@gmail.com
**Hotline**: 0703189963
**Payment QR**: `/public/20250918_102412239_iOS.jpg`

---

## 🎉 Hoàn tất!

Hệ thống **n8n Workflow Marketplace** đã sẵn sàng với:

✅ AI Image Generation (Gemini)
✅ QR Payment Integration
✅ Email Automation (EmailJS)
✅ Revenue Tracking System
✅ Partner Commission (20%)
✅ Beautiful Admin Dashboard
✅ Complete Analytics

**🚀 Deploy lên production và bắt đầu bán workflows!**
