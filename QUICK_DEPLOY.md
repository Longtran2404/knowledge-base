# 🚀 Quick Deploy Guide - Nam Long Center

## ✅ GitHub Repository Ready!

**Repository**: https://github.com/Longtran2404/nam-long-center

## 🚀 Deploy lên Vercel (5 phút)

### Bước 1: Truy cập Vercel

1. Đi tới [vercel.com](https://vercel.com)
2. Click "Sign up" hoặc "Log in"
3. Chọn "Continue with GitHub"

### Bước 2: Import Project

1. Click "New Project"
2. Tìm repository `nam-long-center` trong danh sách
3. Click "Import" bên cạnh repository

### Bước 3: Cấu hình Project

1. **Project Name**: `nam-long-center` (hoặc tên bạn muốn)
2. **Framework Preset**: Create React App (tự động detect)
3. **Root Directory**: `./` (mặc định)
4. **Build Command**: `npm run build` (mặc định)
5. **Output Directory**: `build` (mặc định)

### Bước 4: Environment Variables

Click "Environment Variables" và thêm:

```
REACT_APP_SUPABASE_URL = https://byidgbgvnrfhujprzzge.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw
REACT_APP_APP_URL = https://your-app-name.vercel.app
```

### Bước 5: Deploy

1. Click "Deploy"
2. Chờ 2-3 phút để build
3. Nhận URL production: `https://your-app-name.vercel.app`

## 🗄️ Database Setup (Cần thiết!)

### Trước khi test app, cần setup database:

1. **Truy cập Supabase Dashboard**

   - URL: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge
   - Đăng nhập với tài khoản Supabase

2. **Chạy Database Schema**

   - Vào "SQL Editor"
   - Copy toàn bộ nội dung file `database/complete-schema.sql`
   - Paste vào SQL Editor
   - Click "Run" để tạo tables

3. **Setup Storage Bucket**
   - Vào "Storage"
   - Click "Create bucket"
   - Tên: `user-avatars`
   - Chọn "Public bucket"
   - Click "Create bucket"

## 🧪 Test App

Sau khi deploy xong:

1. **Truy cập URL Vercel** (ví dụ: `https://nam-long-center.vercel.app`)
2. **Test các chức năng**:
   - Đăng ký/Đăng nhập
   - Xem khóa học
   - Xem blog
   - Upload avatar

## 🔧 Troubleshooting

### Nếu app không hoạt động:

1. **Check Environment Variables**

   - Vào Vercel Dashboard > Settings > Environment Variables
   - Đảm bảo đã thêm đủ 3 biến

2. **Check Database**

   - Vào Supabase Dashboard
   - Kiểm tra tables đã được tạo chưa
   - Chạy lại schema nếu cần

3. **Check Build Logs**
   - Vào Vercel Dashboard > Deployments
   - Click vào deployment để xem logs

## 📱 Features Available

- ✅ **Authentication**: Đăng ký/đăng nhập với Supabase
- ✅ **Course Management**: Quản lý khóa học
- ✅ **Blog System**: Hệ thống blog
- ✅ **File Upload**: Upload avatar
- ✅ **Payment**: Tích hợp thanh toán
- ✅ **Responsive**: Giao diện responsive
- ✅ **TypeScript**: Type safety

## 🎯 Next Steps

1. **Deploy lên Vercel** (5 phút)
2. **Setup Database** (5 phút)
3. **Test App** (5 phút)
4. **Customize** theo nhu cầu

## 📞 Support

- **GitHub Issues**: https://github.com/Longtran2404/nam-long-center/issues
- **Documentation**: Xem folder `docs/`
- **Database Guide**: `docs/DATABASE_SETUP_GUIDE.md`

---

**Ready to deploy! 🚀✨**

Repository: https://github.com/Longtran2404/nam-long-center
