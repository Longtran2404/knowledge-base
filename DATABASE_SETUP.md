# 🚀 Database Setup - Nam Long Center

## Vấn đề hiện tại

- ❌ Lỗi 406 khi truy cập `/rest/v1/users`
- ❌ Lỗi 400 khi truy cập `/rest/v1/file_uploads`
- ❌ Database schema bị xung đột

## ✅ Giải pháp

### Bước 1: Chạy SQL

```bash
npm run setup:db
```

### Bước 2: Setup Database

1. Mở **Supabase Dashboard**
2. Vào **SQL Editor**
3. Copy toàn bộ nội dung file `database/setup.sql`
4. Paste và **Run SQL**

### Bước 3: Test

- Kiểm tra ứng dụng
- Xem lỗi 406/400 đã hết chưa
- Test upload file
- Test giỏ hàng

## 📊 Database bao gồm

### 8 bảng chính:

- `nlc_users` - Thông tin user
- `nlc_file_uploads` - Quản lý file
- `nlc_cart_items` - Giỏ hàng
- `nlc_products` - Sản phẩm
- `nlc_courses` - Khóa học
- `nlc_membership_plans` - Gói membership
- `nlc_payment_transactions` - Thanh toán
- `nlc_notifications` - Thông báo

### Tính năng:

- ✅ Row Level Security (RLS)
- ✅ Indexes tối ưu
- ✅ Policies bảo mật
- ✅ Functions hỗ trợ
- ✅ Sample data

## ⚠️ Lưu ý

- File SQL sẽ **XÓA** tất cả bảng cũ
- Backup data trước khi chạy
- Test kỹ sau khi setup

## 🎯 Kết quả

- ✅ Không còn lỗi 406/400
- ✅ File upload hoạt động
- ✅ Cart hoạt động
- ✅ Membership system hoạt động
