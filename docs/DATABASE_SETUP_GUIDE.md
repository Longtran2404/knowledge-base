# 🗄️ Nam Long Center - Database Setup Guide

## 📋 Tổng quan

Hướng dẫn setup database Supabase cho dự án Nam Long Center với đầy đủ các bảng và chính sách bảo mật.

## 🚀 Bước 1: Truy cập Supabase Dashboard

1. **Đăng nhập Supabase**

   - Truy cập [supabase.com](https://supabase.com)
   - Đăng nhập vào project: `byidgbgvnrfhujprzzge`

2. **Mở SQL Editor**
   - Vào project dashboard
   - Click "SQL Editor" ở sidebar trái

## 🗄️ Bước 2: Chạy Database Schema

1. **Copy toàn bộ nội dung file `database/complete-schema.sql`**
2. **Paste vào SQL Editor**
3. **Click "Run" để thực thi**

### Schema bao gồm:

- ✅ **users** - Bảng người dùng chính
- ✅ **courses** - Bảng khóa học
- ✅ **blog_posts** - Bảng bài viết blog
- ✅ **user_courses** - Bảng theo dõi đăng ký khóa học
- ✅ **purchases** - Bảng giao dịch mua khóa học
- ✅ **account_nam_long_center** - Bảng quản lý tài khoản
- ✅ **managers** - Bảng danh sách quản lý
- ✅ **manager_approvals** - Bảng phê duyệt quản lý
- ✅ **manager_notifications** - Bảng thông báo

## 🔐 Bước 3: Cấu hình Authentication

1. **Vào Authentication settings**

   - Click "Authentication" ở sidebar
   - Chọn "Settings"

2. **Cấu hình Site URL**

   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs:
     - `http://localhost:3000/auth`
     - `http://localhost:3000/reset-password`

3. **Enable email authentication**
   - Bật "Enable email confirmations"
   - Cấu hình email templates (optional)

## 📁 Bước 4: Setup Storage

1. **Tạo storage bucket**

   - Vào "Storage" ở sidebar
   - Click "Create bucket"
   - Tên bucket: `user-avatars`
   - Chọn "Public bucket"
   - Click "Create bucket"

2. **Cấu hình RLS policies cho storage**
   - Vào "Storage" > "Policies"
   - Tạo các policies sau:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view all avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🧪 Bước 5: Kiểm tra Setup

1. **Kiểm tra tables**

   - Vào "Table Editor"
   - Kiểm tra các tables đã được tạo

2. **Kiểm tra RLS policies**

   - Vào "Authentication" > "Policies"
   - Kiểm tra các policies đã được tạo

3. **Kiểm tra storage**
   - Vào "Storage"
   - Kiểm tra bucket `user-avatars` đã được tạo

## 🚀 Bước 6: Test Application

1. **Khởi chạy ứng dụng**

   ```bash
   npm start
   ```

2. **Test các chức năng**
   - Đăng ký/Đăng nhập tại `/auth`
   - Xem khóa học tại `/khoa-hoc`
   - Xem blog tại `/blog`
   - Upload avatar tại `/profile`

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"relation does not exist"**

   - Kiểm tra lại schema đã được chạy chưa
   - Chạy lại file `complete-schema.sql`

2. **"RLS policy error"**

   - Kiểm tra RLS policies đã được tạo chưa
   - Chạy lại phần RLS policies

3. **"Storage bucket not found"**

   - Kiểm tra bucket `user-avatars` đã được tạo chưa
   - Tạo lại bucket nếu cần

4. **"Authentication error"**
   - Kiểm tra Site URL và Redirect URLs
   - Kiểm tra email configuration

## 📊 Database Structure

### Core Tables:

- **users**: Thông tin người dùng
- **courses**: Khóa học
- **blog_posts**: Bài viết blog
- **user_courses**: Đăng ký khóa học
- **purchases**: Giao dịch

### Account Management:

- **account_nam_long_center**: Quản lý tài khoản
- **managers**: Danh sách quản lý
- **manager_approvals**: Phê duyệt quản lý
- **manager_notifications**: Thông báo

### Features:

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic user profile creation
- ✅ File upload support
- ✅ Account management system
- ✅ Manager approval workflow

## 🎉 Hoàn thành!

Sau khi setup xong, bạn sẽ có:

- ✅ Database hoàn chỉnh với 9 tables
- ✅ RLS policies bảo mật
- ✅ Storage bucket cho avatars
- ✅ Authentication system
- ✅ Account management system

Bây giờ bạn có thể chạy `npm start` và test toàn bộ ứng dụng!
