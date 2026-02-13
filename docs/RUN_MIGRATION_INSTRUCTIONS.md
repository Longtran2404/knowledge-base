# 🚀 Hướng dẫn chạy Database Migrations

## ⚠️ Quan trọng: Phải chạy theo đúng thứ tự!

Database migrations phải được chạy **theo thứ tự** sau trong Supabase Dashboard:

---

## 📋 Các bước thực hiện

### Bước 1: Mở Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Chọn project **Knowledge Base**
3. Vào menu **SQL Editor** (biểu tượng </> bên trái)

---

### Bước 2: 🧹 Clean Up Database (NẾU CÓ LỖI)

**⚠️ CHỈ CHẠY NẾU GẶP LỖI:** `duplicate key violates constraint` hoặc `500 Internal Server Error`

**File:** `supabase/migrations/000_fix_existing_database.sql`

**Mục đích:** Xóa tất cả bảng cũ để bắt đầu lại

**Cách chạy:**
1. Click **New Query**
2. Mở file `000_fix_existing_database.sql`
3. Copy toàn bộ → Paste → **Run**
4. ✅ Thành công

⚠️ Script này sẽ **XÓA TẤT CẢ DỮ LIỆU** trong bảng `nlc_*`

---

### Bước 3: Chạy Migration 1 - Base Tables (BẮT BUỘC)

**File:** `supabase/migrations/001_create_base_tables.sql`

**Mục đích:** Tạo các bảng cơ bản:
- ✅ `nlc_accounts` - Tài khoản người dùng với roles
- ✅ `nlc_user_files` - Quản lý file upload
- ✅ `nlc_workflows` - Workflow marketplace
- ✅ `nlc_workflow_orders` - Đơn hàng workflow
- ✅ **Set email tranminhlong2404@gmail.com thành ADMIN**

**Cách chạy:**
1. Click **New Query** trong SQL Editor
2. Mở file `supabase/migrations/001_create_base_tables.sql`
3. Copy **TOÀN BỘ** nội dung
4. Paste vào SQL Editor
5. Click **Run** (hoặc nhấn Ctrl+Enter)
6. ✅ Đợi thông báo **Success**

---

### Bước 4: Chạy Migration 2 - Admin & CMS

**File:** `supabase/migrations/upgrade_admin_and_cms.sql`

**Mục đích:** Thêm các tính năng admin:
- ✅ `nlc_payment_methods` - Quản lý phương thức thanh toán
- ✅ `nlc_site_content` - CMS quản lý nội dung
- ✅ `nlc_admin_audit_log` - Log hành động admin
- ✅ RLS policies cho admin

**Cách chạy:**
1. Click **New Query** lần nữa
2. Mở file `supabase/migrations/upgrade_admin_and_cms.sql`
3. Copy **TOÀN BỘ** nội dung
4. Paste vào SQL Editor
5. Click **Run**
6. ✅ Đợi thông báo **Success**

---

### Bước 5: Chạy Migration 3 - Subscription System

**File:** `supabase/migrations/add_subscription_system.sql`

**Mục đích:** Thêm hệ thống subscription:
- ✅ `nlc_subscription_plans` - 3 gói: Free, Premium, Business
- ✅ `nlc_user_subscriptions` - Subscription của user
- ✅ `nlc_subscription_payments` - Thanh toán subscription
- ✅ Function `upgrade_subscription()`

**Cách chạy:**
1. Click **New Query** lần nữa
2. Mở file `supabase/migrations/add_subscription_system.sql`
3. Copy **TOÀN BỘ** nội dung
4. Paste vào SQL Editor
5. Click **Run**
6. ✅ Đợi thông báo **Success**

---

## ✅ Kiểm tra sau khi chạy migrations

Sau khi chạy xong **CẢ 3 MIGRATIONS**, kiểm tra:

### 1. Kiểm tra tables đã tạo:

Chạy query này trong SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'nlc_%'
ORDER BY table_name;
```

Kết quả phải có **ít nhất** các bảng sau:
- ✅ nlc_accounts
- ✅ nlc_admin_audit_log
- ✅ nlc_payment_methods
- ✅ nlc_site_content
- ✅ nlc_subscription_payments
- ✅ nlc_subscription_plans
- ✅ nlc_user_files
- ✅ nlc_user_subscriptions
- ✅ nlc_workflow_orders
- ✅ nlc_workflows

### 2. Kiểm tra admin role:

```sql
SELECT email, full_name, account_role
FROM nlc_accounts
WHERE email = 'tranminhlong2404@gmail.com';
```

Kết quả phải là:
- email: `tranminhlong2404@gmail.com`
- account_role: `admin` ← **QUAN TRỌNG!**

### 3. Kiểm tra subscription plans:

```sql
SELECT plan_name, price, billing_period
FROM nlc_subscription_plans
ORDER BY price;
```

Kết quả phải có 3 gói:
- Free (0 đ)
- Premium (299,000 đ/tháng)
- Business (999,000 đ/tháng)

---

## 🎯 Sau khi hoàn thành

1. **Refresh website** (Ctrl + Shift + R)
2. **Đăng xuất** và **Đăng nhập lại**
3. Kiểm tra sidebar → phải thấy nút **Dashboard** và **Subscriptions**
4. Vào `/admin/dashboard` → thấy trang quản trị
5. Vào Profile → tab **Giờ học** → thấy thống kê

---

## ❌ Nếu gặp lỗi

### Lỗi: "relation already exists"
- **Nguyên nhân:** Bảng đã tồn tại từ lần chạy trước
- **Giải pháp:** Bỏ qua lỗi này, tiếp tục chạy migration tiếp theo

### Lỗi: "relation nlc_accounts does not exist"
- **Nguyên nhân:** Chưa chạy Migration 1
- **Giải pháp:** Quay lại **Bước 2**, chạy `001_create_base_tables.sql` trước

### Lỗi: "permission denied"
- **Nguyên nhân:** User trong Supabase không có quyền
- **Giải pháp:** Đảm bảo bạn đang dùng tài khoản **Owner** của project

### Lỗi: "nlc_accounts không có dữ liệu"
- **Nguyên nhân:** Chưa đăng ký tài khoản
- **Giải pháp:**
  1. Vào website
  2. Đăng ký tài khoản với email `tranminhlong2404@gmail.com`
  3. Chạy lại Migration 1 để set role admin

---

## 🔐 Bảo mật

⚠️ **LƯU Ý:** File SQL chứa email admin. Không commit lên Git public repository!

Đã thêm vào `.gitignore`:
```
supabase/migrations/*.sql
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Supabase project có đang chạy không?
2. Internet connection ổn định không?
3. Có dùng đúng project không?

---

## ✨ Hoàn thành!

Sau khi chạy xong cả 3 migrations, bạn sẽ có:
- ✅ Tài khoản admin hoàn chỉnh
- ✅ CMS quản lý nội dung
- ✅ Hệ thống subscription 3 tiers
- ✅ Quản lý thanh toán
- ✅ Workflow marketplace
- ✅ Upload & quản lý files
- ✅ Audit logging

🚀 **Chúc mừng! Database đã sẵn sàng!**
