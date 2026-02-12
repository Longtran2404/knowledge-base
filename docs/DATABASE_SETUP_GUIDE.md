# 🗄️ Hướng dẫn Setup Database - Knowledge Base

## ✅ Tình trạng hiện tại

**Supabase Connection**: ✅ Connected
**Project ID**: `byidgbgvnrfhujprzzge`
**Project URL**: https://byidgbgvnrfhujprzzge.supabase.co

### Tables hiện có (5/14):
- ✅ products
- ✅ user_activities
- ✅ account_nam_long_center
- ✅ nlc_courses
- ✅ nlc_payment_transactions

### Tables cần tạo (9):
- ❌ users
- ❌ courses
- ❌ blog_posts
- ❌ cart_items
- ❌ user_files
- ❌ nlc_accounts
- ❌ nlc_enrollments
- ❌ nlc_course_content
- ❌ n8n_workflows

---

## 🚀 Cách 1: Setup qua Supabase Dashboard (KHUYẾN NGHỊ)

### Bước 1: Mở SQL Editor

1. Truy cập Dashboard: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge
2. Click **"SQL Editor"** ở sidebar bên trái
3. Click nút **"New Query"**

### Bước 2: Copy SQL Setup

1. Mở file `database/setup.sql` trong project
2. Copy **TOÀN BỘ** nội dung (khoảng 500+ dòng)
3. Paste vào SQL Editor

### Bước 3: Chạy SQL

1. Click nút **"Run"** (hoặc Ctrl+Enter)
2. Đợi 10-30 giây để hoàn thành
3. Kiểm tra output:
   - ✅ **Success** - Tất cả tables đã được tạo
   - ❌ **Error** - Xem phần Troubleshooting bên dưới

### Bước 4: Xác nhận

Chạy command để verify:
```bash
node check-tables.js
```

**Output mong đợi**:
```
✅ Existing tables: 14
❌ Missing tables: 0
```

---

## 🖥️ Cách 2: Setup qua psql Command Line

### Yêu cầu:
- PostgreSQL client đã cài đặt
- psql command available

### Commands:

```bash
# Set database password (lấy từ Supabase Settings → Database)
export PGPASSWORD='your-database-password'

# Connect và chạy SQL
psql "postgresql://postgres.byidgbgvnrfhujprzzge@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f database/setup.sql
```

**Lưu ý**:
- Thay `your-database-password` bằng password thực
- Lấy password từ: Project Settings → Database → Password

---

## 🔧 Cách 3: Setup qua Supabase CLI

### Install Supabase CLI:

```bash
npm install -g supabase
```

### Link project:

```bash
# Login
supabase login

# Link với project
supabase link --project-ref byidgbgvnrfhujprzzge

# Apply migrations
supabase db push
```

---

## 🧪 Kiểm tra sau khi setup

### Test 1: Check tables
```bash
node check-tables.js
```

### Test 2: Test app
```bash
npm start
```

Mở http://localhost:3000 và:
1. Đăng ký tài khoản mới
2. Đăng nhập
3. Upload file
4. Thêm sản phẩm vào giỏ hàng

Nếu không có lỗi 406/400 → ✅ Setup thành công!

---

## ⚠️ Troubleshooting

### Lỗi: "relation already exists"

**Nguyên nhân**: Table đã tồn tại từ trước

**Giải pháp**:
```sql
-- Chạy trong SQL Editor trước
DROP TABLE IF EXISTS table_name CASCADE;
```

Hoặc thay đổi đầu file `setup.sql` để force drop:
```sql
-- Uncomment dòng này
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
```

### Lỗi: "permission denied"

**Nguyên nhân**: Dùng anon key thay vì service_role key

**Giải pháp**:
- Sử dụng SQL Editor trên Dashboard (recommended)
- Hoặc dùng service_role key khi connect qua psql

### Lỗi: "syntax error near..."

**Nguyên nhân**: SQL không tương thích với Postgres version

**Giải pháp**:
1. Check Postgres version:
   ```sql
   SELECT version();
   ```
2. Update syntax nếu cần
3. Hoặc chạy từng section riêng lẻ

---

## 📊 Database Schema Overview

### Core Tables:

1. **nlc_accounts** - User accounts và authentication
2. **nlc_courses** - Course catalog
3. **nlc_enrollments** - Student enrollments
4. **nlc_managers** - Admin users
5. **nlc_payment_transactions** - Payment history
6. **nlc_course_content** - Course materials
7. **nlc_file_uploads** - File storage metadata

### Supporting Tables:

- **products** - Marketplace products
- **cart_items** - Shopping cart
- **user_files** - User uploaded files
- **user_activities** - Activity logs
- **n8n_workflows** - Automation workflows

---

## 🎯 Quick Commands

```bash
# Verify Supabase connection
node test-supabase-direct.js

# Check which tables exist
node check-tables.js

# Setup database (manual instructions)
node scripts/setup-database.js

# Start development server
npm start
```

---

## 📞 Need Help?

**Lỗi vẫn còn?**
1. Check Supabase logs: Dashboard → Logs
2. Check browser console: F12 → Console
3. Check server logs: Terminal output

**Supabase Resources:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## ✅ Checklist

Sau khi setup, verify các điều sau:

- [ ] Supabase connection works (test-supabase-direct.js)
- [ ] All 14 tables exist (check-tables.js)
- [ ] Dev server starts without errors (npm start)
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can upload files
- [ ] Can add items to cart
- [ ] No 406/400 errors in console

---

*Last updated: 2025-10-02*
*Project: Knowledge Base*
*Supabase Project: byidgbgvnrfhujprzzge*
