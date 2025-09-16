# 🚀 Nam Long Center - Supabase Setup Guide

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn setup Supabase cho dự án Nam Long Center từ đầu đến cuối.

## 🔧 Bước 1: Tạo Supabase Project

1. **Truy cập Supabase**
   - Đi tới [supabase.com](https://supabase.com)
   - Đăng nhập hoặc tạo account mới

2. **Tạo project mới**
   - Click "New Project"
   - Chọn organization
   - Đặt tên project: `namlongcenter`
   - Chọn database password mạnh
   - Chọn region gần nhất (Singapore cho Việt Nam)
   - Click "Create new project"

3. **Chờ project được tạo**
   - Quá trình này mất khoảng 2-3 phút
   - Project sẽ có URL và API keys

## 🗄️ Bước 2: Setup Database Schema

1. **Truy cập SQL Editor**
   - Vào project dashboard
   - Click "SQL Editor" ở sidebar

2. **Chạy database schema**
   - Copy toàn bộ nội dung file `database/supabase-schema.sql`
   - Paste vào SQL Editor
   - Click "Run" để thực thi

3. **Kiểm tra tables đã tạo**
   - Vào "Table Editor"
   - Kiểm tra các tables: `users`, `courses`, `blog_posts`, `user_courses`, `purchases`

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
   ```

## 🔑 Bước 5: Lấy API Keys

1. **Vào Project Settings**
   - Click "Settings" ở sidebar
   - Chọn "API"

2. **Copy các keys**
   - Project URL
   - Project API keys (anon/public key)
   - Service role key (giữ bí mật)

## ⚙️ Bước 6: Cấu hình Environment Variables

1. **Tạo file .env**
   ```bash
   cp env.example .env
   ```

2. **Cập nhật .env với Supabase keys**
   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🧪 Bước 7: Test Integration

1. **Start development server**
   ```bash
   npm start
   ```

2. **Test authentication**
   - Đăng ký tài khoản mới
   - Kiểm tra user được tạo trong database
   - Test đăng nhập/đăng xuất

3. **Test các features khác**
   - Tạo course mới
   - Tạo blog post
   - Upload avatar

## 🔒 Bước 8: Production Setup

1. **Cập nhật Site URL**
   - Vào Authentication Settings
   - Thay đổi Site URL thành domain production
   - Thêm Redirect URLs cho production

2. **Setup custom domain (optional)**
   - Vào Project Settings
   - Cấu hình custom domain
   - Setup SSL certificate

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **"Invalid API key"**
   - Kiểm tra lại API key trong .env
   - Đảm bảo không có khoảng trắng thừa

2. **"RLS policy violation"**
   - Kiểm tra RLS policies
   - Đảm bảo user đã đăng nhập

3. **"Table doesn't exist"**
   - Chạy lại database schema
   - Kiểm tra tên table có đúng không

4. **"Storage bucket not found"**
   - Tạo bucket `user-avatars`
   - Kiểm tra RLS policies cho storage

### Performance Issues

1. **Slow queries**
   - Thêm indexes cho các columns thường query
   - Sử dụng pagination cho large datasets

2. **Large bundle size**
   - Chỉ import những gì cần thiết từ Supabase
   - Sử dụng code splitting

## 📚 Tài liệu tham khảo

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra [Supabase Status](https://status.supabase.com/)
2. Xem [Supabase Discord](https://discord.supabase.com/)
3. Tạo issue trên GitHub repository
4. Liên hệ: info@namlongcenter.com

---

**Lưu ý**: Giữ bí mật Service Role key và không commit vào Git!
