# ⚠️ BẮT BUỘC: Chạy Migration Database

## Tại sao cần chạy migration?

Hệ thống mới cần các bảng sau để hoạt động:
- `nlc_payment_methods` - Quản lý thanh toán
- `nlc_site_content` - CMS nội dung
- `nlc_admin_audit_log` - Audit logs
- Set quyền admin cho `tranminhlong2404@gmail.com`

**Nếu không chạy migration:**
- ❌ Bạn sẽ thấy lỗi 404 khi load trang
- ❌ Không thể truy cập `/admin/cms` và `/admin/payment-methods`
- ❌ Tài khoản không có quyền admin

---

## 🚀 Cách 1: Chạy trực tiếp trên Supabase (Khuyến nghị)

### Bước 1: Truy cập Supabase Dashboard
1. Mở browser và vào: https://app.supabase.com
2. Đăng nhập với tài khoản của bạn
3. Chọn project: **Knowledge Base**

### Bước 2: Mở SQL Editor
1. Ở menu bên trái, click **SQL Editor**
2. Click nút **New Query** (góc trên bên phải)

### Bước 3: Copy & Paste SQL
1. Mở file: `supabase/migrations/upgrade_admin_and_cms.sql`
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào SQL Editor** (Ctrl+V)

### Bước 4: Chạy Migration
1. Click nút **Run** (hoặc nhấn `Ctrl+Enter`)
2. Đợi vài giây...
3. Kiểm tra kết quả:
   - ✅ Success → Hoàn thành!
   - ❌ Error → Xem phần Troubleshooting bên dưới

### Bước 5: Verify
Chạy SQL này để kiểm tra:
```sql
-- Check tables exist
SELECT
  'nlc_payment_methods' as table_name,
  COUNT(*) as row_count
FROM nlc_payment_methods
UNION ALL
SELECT
  'nlc_site_content',
  COUNT(*)
FROM nlc_site_content
UNION ALL
SELECT
  'nlc_admin_audit_log',
  COUNT(*)
FROM nlc_admin_audit_log;

-- Check admin role
SELECT
  email,
  account_role,
  full_name
FROM nlc_accounts
WHERE account_role = 'admin';
```

**Kết quả mong đợi:**
- `nlc_payment_methods`: 2 rows (2 payment methods mẫu)
- `nlc_site_content`: ~20 rows (default content)
- `nlc_admin_audit_log`: 0 rows (chưa có activity)
- Admin user: `tranminhlong2404@gmail.com` với `account_role = 'admin'`

---

## 🔧 Cách 2: Sử dụng Supabase CLI

```bash
# 1. Install Supabase CLI (nếu chưa có)
npm install -g supabase

# 2. Login
supabase login

# 3. Link to project
supabase link --project-ref byidgbgvnrfhujprzzge

# 4. Push migration
supabase db push
```

---

## ✅ Sau khi chạy migration

### 1. Restart Dev Server
```bash
# Stop server (Ctrl+C trong terminal)
# Start lại
npm start
```

### 2. Clear Browser Cache
```
Ctrl+Shift+Delete → Clear browsing data → Cached images and files
```

Hoặc Hard Refresh:
```
Ctrl+Shift+R
```

### 3. Test Admin Access
1. Đăng nhập với: `tranminhlong2404@gmail.com`
2. Truy cập: http://localhost:3000/admin/cms
3. Nếu vào được → ✅ Success!
4. Nếu bị chặn → ⚠️ Check lại migration

### 4. Test Payment Methods
1. Truy cập: http://localhost:3000/admin/payment-methods
2. Bạn sẽ thấy 2 payment methods mẫu
3. Thử edit và update thông tin

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Nguyên nhân:** Bảng đã tồn tại từ trước

**Giải pháp:**
```sql
-- Drop existing tables (CAREFUL!)
DROP TABLE IF EXISTS nlc_admin_audit_log CASCADE;
DROP TABLE IF EXISTS nlc_site_content CASCADE;
DROP TABLE IF EXISTS nlc_payment_methods CASCADE;

-- Then run migration again
```

### Error: "permission denied"
**Nguyên nhân:** User không có quyền

**Giải pháp:**
1. Chắc chắn bạn là owner của project
2. Hoặc xin quyền từ admin

### Error: "nlc_accounts" not found
**Nguyên nhân:** Bảng accounts chưa tồn tại

**Giải pháp:**
Chạy migration cũ trước:
```sql
-- Create nlc_accounts table first
CREATE TABLE IF NOT EXISTS nlc_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  account_role VARCHAR(50) DEFAULT 'sinh_vien',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Lỗi đăng ký: "Database error saving new user"
**Nguyên nhân:** Trigger tạo bản ghi trong `nlc_accounts` khi user mới đăng ký (auth.users) chưa có hoặc schema không khớp.

**Giải pháp:**
1. Đảm bảo bảng `nlc_accounts` tồn tại và có cột `user_id` (UUID), `email`, `full_name`, v.v.
2. Chạy migration đầy đủ có **trigger** trên `auth.users`: file `supabase/migrations/FULL_SCHEMA_001_subscription_002.sql` (hàm `create_account_for_new_user`, trigger `on_auth_user_created`).
3. **Chạy script trigger trong SQL Editor:** mở file `supabase/sql-editor-setup-auth-trigger.sql`, copy toàn bộ → Supabase Dashboard → SQL Editor → New query → Paste → Run.
4. Chi tiết: xem mục "Lỗi đăng ký: Database error saving new user" và "Bước 4: Chạy script trigger đăng ký" trong [docs/SUPABASE_SETUP_FINAL.md](SUPABASE_SETUP_FINAL.md).

### Không thấy quyền admin
**Kiểm tra email:**
```sql
SELECT * FROM nlc_accounts WHERE email = 'tranminhlong2404@gmail.com';
```

**Nếu không tìm thấy:**
```sql
-- Register account trước, sau đó update role
UPDATE nlc_accounts
SET account_role = 'admin'
WHERE email = 'tranminhlong2404@gmail.com';
```

---

## 📊 Verify Migration Success

### Check Tables
```sql
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename IN (
  'nlc_payment_methods',
  'nlc_site_content',
  'nlc_admin_audit_log'
)
ORDER BY tablename;
```

### Check RLS Policies
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'nlc_payment_methods',
  'nlc_site_content',
  'nlc_admin_audit_log'
)
ORDER BY tablename, policyname;
```

### Check Functions
```sql
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'log_admin_action',
  'get_site_content'
)
ORDER BY routine_name;
```

### Check Triggers
```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
  'audit_payment_methods',
  'audit_site_content'
)
ORDER BY trigger_name;
```

---

## 🔐 Security Checklist

Sau khi migration, verify security:

- [ ] RLS enabled trên tất cả tables
- [ ] Public chỉ có thể SELECT active content
- [ ] Chỉ admin mới INSERT/UPDATE/DELETE
- [ ] Triggers hoạt động (test bằng cách update 1 record)
- [ ] Admin account có role đúng

---

## 📝 Next Steps

Sau khi migration thành công:

1. ✅ Login với admin account
2. ✅ Truy cập `/admin/cms`
3. ✅ Tạo vài content items
4. ✅ Truy cập `/admin/payment-methods`
5. ✅ Cập nhật thông tin thanh toán thật
6. ✅ Test audit logs bằng cách edit content
7. ✅ Deploy to production

---

## ⚡ Quick Commands

```bash
# Check if migration needed
npx supabase db diff --schema public

# Run migration
# (Copy SQL from upgrade_admin_and_cms.sql and run in Supabase Dashboard)

# Verify tables
# (Run SELECT queries above in SQL Editor)

# Restart dev server
npm start

# Test admin pages
open http://localhost:3000/admin/cms
open http://localhost:3000/admin/payment-methods
```

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase logs: Dashboard → Database → Logs
2. Check browser console: F12 → Console tab
3. Check network tab: F12 → Network tab
4. Search error message in documentation

**Common issues:**
- 404 errors → Migration not run yet
- 401 errors → Not logged in
- 403 errors → User not admin
- 500 errors → Check Supabase logs

---

**✨ Sau khi hoàn thành, bạn sẽ có hệ thống CMS đầy đủ! ✨**
