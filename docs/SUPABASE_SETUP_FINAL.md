# 🚀 SUPABASE SETUP - Hướng Dẫn Cuối Cùng

**Date:** 02/10/2025  
**Status:** ⚠️ Cần Deploy Database

---

## ✅ Credentials Đã Cập Nhật

Supabase credentials của bạn đã được cập nhật trong code:

```typescript
// src/lib/supabase-config.ts (lines 14-16)
const FALLBACK_URL = "https://byidgbgvnrfhujprzzge.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

---

## 🔴 VẤN ĐỀ HIỆN TẠI

### Lỗi Gặp Phải:

```
GoTrueClient: Failed to load resource: net::ERR_NAME_NOT_RESOLVED
byidgbgvnrfhujprzzge.supabase.co/auth/v1/token
```

### Nguyên Nhân:

1. ⚠️ **Supabase project chưa có database tables**
2. ⚠️ **Database schema chưa được deploy**
3. ⚠️ **Auth service trying to connect but tables don't exist**

### Lỗi đăng ký: "Database error saving new user"

Khi đăng ký, nếu xuất hiện **"Database error saving new user"** thì lỗi thường do **trigger hoặc schema** trên Supabase, không phải do code frontend:

- **Cần có bảng `public.nlc_accounts`** và **trigger trên `auth.users`** tạo bản ghi khi user mới đăng ký (hàm `create_account_for_new_user`, trigger `on_auth_user_created`).
- Kiểm tra: Supabase Dashboard → SQL Editor → xem bảng `nlc_accounts` có tồn tại; Table Editor → kiểm tra cột `user_id` (UUID), `email`, `full_name`, v.v.
- Migration đầy đủ: dùng file `supabase/migrations/FULL_SCHEMA_001_subscription_002.sql` (hoặc bộ migration tương đương) để tạo bảng + trigger + RLS đúng. Nếu trước đó chỉ chạy `database/setup.sql`, cần chạy thêm migration dùng **UUID** cho `user_id` và trigger `create_account_for_new_user`.
- Sau khi sửa schema/trigger, thử đăng ký lại; nếu vẫn lỗi, xem console trình duyệt (log `[Auth form error]`) và Supabase → Logs (Auth + Postgres) để có `code` / `details` lỗi.

---

## 📋 GIẢI PHÁP - DEPLOY DATABASE NGAY!

### Bước 1: Mở Supabase Dashboard

```bash
# URL: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge
```

### Bước 2: Deploy Database Schema

1. Click vào **SQL Editor** (menu bên trái)
2. Click **New Query**
3. Copy TOÀN BỘ nội dung từ file: `database/setup.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)

### Bước 3: Verify Tables Được Tạo

Chạy query này để kiểm tra:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'nlc_%';
```

**Kết quả mong đợi:** (11 tables)

```
✅ nlc_accounts
✅ nlc_courses
✅ nlc_enrollments
✅ nlc_managers
✅ nlc_user_approvals
✅ nlc_notifications
✅ nlc_activity_log
✅ nlc_user_files
✅ nlc_password_resets
✅ nlc_payment_transactions
✅ nlc_subscriptions
```

### Bước 4: Chạy script trigger đăng ký (bảng nlc_accounts đã có)

Để đăng ký tạo bản ghi trong `nlc_accounts` (tránh lỗi "Database error saving new user"):

1. Mở file **`supabase/sql-editor-setup-auth-trigger.sql`** trong repo.
2. Copy **toàn bộ** nội dung file.
3. Trong Supabase Dashboard → **SQL Editor** → **New Query** → Paste.
4. Click **Run** (hoặc Ctrl+Enter).

Script này: thêm cột thiếu vào `nlc_accounts` nếu cần, tạo policy INSERT, và tạo function + trigger `on_auth_user_created` trên `auth.users`. Trigger **chỉ tạo bản ghi `nlc_accounts` khi email đã xác thực** (`email_confirmed_at IS NOT NULL`); profile (phone, birth_date, gender, address, city, ward, id_card) lấy từ `raw_user_meta_data`. Chạy nhiều lần không lỗi (idempotent).

### Bước 4a: Bật xác thực email (Confirm email) và Redirect URLs

Để luồng "xác thực xong mới tạo tài khoản" hoạt động:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
   - Bật **Confirm email** (Enable email confirmations).
2. **Authentication** → **URL Configuration**
   - **Redirect URLs**: thêm URL trang đăng nhập sau khi user bấm link xác thực:
     - `http://localhost:3000/dang-nhap` (dev)
     - `https://your-domain.com/dang-nhap` (production, thay your-domain bằng domain thật)

**Luồng đăng ký + xác thực:** User điền form đăng ký (email, mật khẩu, họ tên, SĐT, ngày sinh, giới tính, địa chỉ) → Supabase tạo bản ghi `auth.users` (chưa xác thực) → User nhận email, bấm link xác thực → Supabase set `email_confirmed_at` → Trigger tạo/cập nhật bản ghi `nlc_accounts` với đầy đủ profile từ metadata → User được chuyển về `/dang-nhap` với thông báo "Email đã xác thực. Tài khoản sẵn sàng." và có thể đăng nhập.

### Bước 4b: Tạo tất cả các bảng còn lại (nlc_user_files, nlc_workflows, nlc_auth_errors, …)

Nếu bạn cần đủ bảng cho app (upload file, workflow, ghi lỗi đăng nhập, thanh toán, …):

1. Mở file **`supabase/migrations/FULL_SCHEMA_001_subscription_002.sql`** trong repo.
2. Copy **toàn bộ** nội dung file.
3. Trong Supabase Dashboard → **SQL Editor** → **New Query** → Paste.
4. Click **Run** (hoặc Ctrl+Enter).

File này tạo: `nlc_accounts`, `nlc_user_files`, `nlc_workflows`, `nlc_workflow_orders`, `nlc_user_subscriptions`, `nlc_subscription_plans`, `nlc_subscription_payments`, trigger đăng ký, RLS, và các bảng mở rộng. Nếu đã có bảng `nlc_accounts` từ trước, vẫn chạy được (CREATE TABLE IF NOT EXISTS). Sau khi chạy xong, có thể chạy tiếp **`supabase/migrations/002_extend_accounts_and_reports.sql`** để thêm `nlc_auth_errors`, `nlc_reports`, `nlc_sepay_pending_orders`, cột `id_card`, `city`, `ward` trên `nlc_accounts`.

### Bước 5: Enable Row Level Security (RLS)

```sql
-- Enable RLS for all NLC tables
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for nlc_accounts (example)
CREATE POLICY "Users can view own account"
ON nlc_accounts FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own account"
ON nlc_accounts FOR UPDATE
USING (auth.uid()::text = user_id);

-- Admin can view all
CREATE POLICY "Admins can view all accounts"
ON nlc_accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM nlc_accounts
    WHERE user_id = auth.uid()::text
    AND account_role = 'admin'
  )
);
```

### Bước 6: Setup Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('user-avatars', 'user-avatars', true),
  ('course-images', 'course-images', true),
  ('user-files', 'user-files', false),
  ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = owner);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');
```

---

## 🔧 QUICK FIX - Chạy Script Tự Động

Tôi đã tạo script để setup database tự động:

```bash
# Chạy script setup
node scripts/setup-database.js
```

**Script sẽ:**

- ✅ Connect đến Supabase
- ✅ Tạo tất cả 11 NLC tables
- ✅ Setup triggers và indexes
- ✅ Insert sample data (admin account, 3 courses)
- ✅ Verify tables created successfully

---

## 🎯 SAU KHI DEPLOY DATABASE

### 1. Restart Server

```bash
# Stop server (nếu đang chạy)
Ctrl + C

# Clear cache
npm run clean  # hoặc: rm -rf node_modules/.cache

# Restart
npm start
```

### 2. Test Auth Flow

```
1. Mở http://localhost:3000/dang-nhap
2. Đăng ký tài khoản mới (email, mật khẩu, họ tên, SĐT, ngày sinh, giới tính, địa chỉ…)
3. Kiểm tra email và bấm link xác thực (nếu đã bật Confirm email)
4. Sau khi xác thực: bản ghi nlc_accounts được tạo bởi trigger; user có thể đăng nhập
5. Kiểm tra Supabase Dashboard → Table Editor → nlc_accounts → verify user và profile (phone, birth_date, gender, address, city, ward, id_card)
```

### 3. Test Upload Page

```
1. Đăng nhập
2. Mở http://localhost:3000/tai-len
3. Không còn loading vô hạn ✅
4. Có thể upload file ✅
```

### 4. Set Admin (Chỉ dành cho dev)

**Lưu ý:** Hướng dẫn này chỉ dùng trong môi trường phát triển, không hiển thị trên UI.

```bash
# Sau khi đăng ký tài khoản mới, chạy lệnh để set làm admin:
node scripts/set-as-admin.js your-email@example.com
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: ERR_NAME_NOT_RESOLVED

**Nguyên nhân:** DNS không resolve được domain

**Giải pháp:**

```bash
# Clear DNS cache
ipconfig /flushdns

# Test connection
ping byidgbgvnrfhujprzzge.supabase.co

# Nếu vẫn lỗi, check:
# 1. Internet connection
# 2. Firewall/antivirus
# 3. Supabase project status
```

### Issue 2: "Initializing auth state" Mãi Mãi

**Nguyên nhân:** Database tables chưa tồn tại

**Giải pháp:**

```bash
# Deploy database schema ngay!
# Run database/setup.sql in Supabase Dashboard
```

### Issue 3: "User not authenticated, redirecting"

**Nguyên nhân:** Auth timeout hoặc database query fail

**Giải pháp:**

```typescript
// Auth có timeout 5s, sau đó fallback
// Check browser console logs:
// - "Auth initialization failed" → Database issue
// - "Found existing session" → Should work
// - "No existing session found" → Need to login
```

---

## 📊 CREDENTIALS SUMMARY

```
Project URL:     https://byidgbgvnrfhujprzzge.supabase.co
Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw
Service Role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE

Database Host:   aws-0-us-west-1.pooler.supabase.com
Database Port:   6543
Database Name:   postgres
Database User:   postgres.byidgbgvnrfhujprzzge

Storage Endpoint: https://byidgbgvnrfhujprzzge.supabase.co/storage/v1/s3
Storage Access:   79861bcefd30f4efa57639672ae72aad
Storage Secret:   476b8132b2c582fce4063469307b750fdf057dcd31da510e46912ccd9afd733f
```

---

## 🚀 ACTION REQUIRED

### ⚡ BẮT BUỘC - Deploy Database Ngay!

**Option 1: Supabase Dashboard (Recommended)**

```
1. Go to: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge/editor
2. SQL Editor → New Query
3. Copy/paste from: database/setup.sql
4. Run
5. Verify tables created
```

**Option 2: Command Line**

```bash
# Sử dụng psql
set PGPASSWORD=your_password
psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.byidgbgvnrfhujprzzge -d postgres -f database/setup.sql
```

**Option 3: Node Script**

```bash
# Automated setup
node scripts/setup-database.js
```

---

## ✅ SAU KHI SETUP

### Kết Quả Mong Đợi:

```bash
npm start
# → Server starts without errors
# → Auth initializes successfully
# → Upload page loads instantly
# → Can create account, login, upload files
```

### Verify Success:

1. **Check Console Logs:**

   ```
   ✅ [INFO] Initializing auth state...
   ✅ [INFO] No existing session found (hoặc Found existing session)
   ✅ No ERR_NAME_NOT_RESOLVED errors
   ```

2. **Check Supabase Dashboard:**

   ```
   ✅ 11 NLC tables visible
   ✅ Sample data có trong tables
   ✅ RLS policies active
   ```

3. **Test App:**
   ```
   ✅ http://localhost:3000 - Homepage loads
   ✅ /dang-nhap - Can register/login
   ✅ /tai-len - Upload page no loading stuck
   ✅ /khoa-hoc - Courses show
   ```

---

## 📝 NEXT STEPS

1. **Deploy database schema** ← 🔴 DO THIS NOW!
2. Restart server: `npm start`
3. Test auth: Register new account
4. Test upload: Go to /tai-len
5. Verify: No more stuck loading!

---

**Tóm tắt:**

- ✅ Credentials đã đúng trong code
- ✅ Server config sẵn sàng
- ⚠️ **CẦN: Deploy database/setup.sql lên Supabase**
- ⚡ **SAU ĐÓ: App sẽ hoạt động 100%**

---

**Updated:** 02/10/2025  
**Priority:** 🔴 CRITICAL - Database deployment required

