# 🚨 Database Setup Required

## Vấn đề hiện tại
Tất cả database tables đều không tồn tại, dẫn đến lỗi 404 khi ứng dụng cố gắng truy cập dữ liệu.

## Giải pháp

### Bước 1: Truy cập Supabase Dashboard
1. Mở trình duyệt và truy cập: https://supabase.com/dashboard
2. Đăng nhập vào tài khoản của bạn
3. Chọn project: `byidgbgvnrfhujprzzge`

### Bước 2: Mở SQL Editor
1. Trong sidebar, click vào "SQL Editor"
2. Click "New query"

### Bước 3: Chạy Schema chính
Copy và paste nội dung từ file `database/complete-schema.sql` vào SQL Editor và chạy:

```sql
-- Copy toàn bộ nội dung từ database/complete-schema.sql
```

### Bước 4: Chạy Schema bổ sung
Copy và paste nội dung từ file `database/user-files-schema.sql` vào SQL Editor và chạy:

```sql
-- Copy toàn bộ nội dung từ database/user-files-schema.sql
```

### Bước 5: Kiểm tra kết quả
Sau khi chạy xong, bạn sẽ thấy các tables sau được tạo:
- ✅ users
- ✅ user_files
- ✅ user_activities
- ✅ notifications
- ✅ cart_items
- ✅ products
- ✅ courses
- ✅ blog_posts
- ✅ user_courses
- ✅ purchases
- ✅ managers
- ✅ manager_approvals
- ✅ manager_notifications

### Bước 6: Test ứng dụng
1. Quay lại ứng dụng React
2. Refresh trang
3. Thử đăng nhập và upload file
4. Kiểm tra console để đảm bảo không còn lỗi 404

## Lưu ý quan trọng
- Đảm bảo chạy schema theo đúng thứ tự
- Nếu gặp lỗi, hãy kiểm tra xem có table nào đã tồn tại chưa
- Có thể cần cấp quyền RLS (Row Level Security) cho các tables

## Troubleshooting
Nếu vẫn gặp lỗi sau khi setup:
1. Kiểm tra lại environment variables trong `.env.local`
2. Đảm bảo Supabase project đang hoạt động
3. Kiểm tra logs trong Supabase dashboard
4. Thử tạo lại project Supabase nếu cần
