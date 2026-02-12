# 🚀 Knowledge Base - Deployment Guide

## 📋 Tổng quan

Hướng dẫn deploy dự án Knowledge Base lên Vercel với GitHub integration.

## 🔗 GitHub Repository

- **Repository**: https://github.com/Longtran2404/knowledge-base
- **Branch**: main
- **Framework**: Create React App (CRA)

## 🚀 Deploy lên Vercel

### Bước 1: Truy cập Vercel

1. Đi tới [vercel.com](https://vercel.com)
2. Đăng nhập bằng tài khoản GitHub
3. Click "New Project"

### Bước 2: Import từ GitHub

1. Tìm repository `knowledge-base` trong danh sách
2. Click "Import" để bắt đầu deploy
3. Vercel sẽ tự động detect Create React App

### Bước 3: Cấu hình Environment Variables

Thêm các biến môi trường sau trong Vercel Dashboard:

```env
REACT_APP_SUPABASE_URL=https://byidgbgvnrfhujprzzge.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw
REACT_APP_APP_URL=https://your-vercel-domain.vercel.app
```

### Bước 4: Cấu hình Build Settings

- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Bước 5: Deploy

1. Click "Deploy" để bắt đầu quá trình deploy
2. Vercel sẽ tự động build và deploy ứng dụng
3. Sau khi hoàn thành, bạn sẽ nhận được URL để truy cập ứng dụng

## 🗄️ Database Setup

### Trước khi deploy, cần setup database:

1. **Truy cập Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge

2. **Chạy Database Schema**
   - Vào SQL Editor
   - Copy nội dung file `database/complete-schema.sql`
   - Paste và chạy để tạo tables

3. **Setup Storage**
   - Tạo bucket `user-avatars`
   - Cấu hình RLS policies

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Build Error**
   - Kiểm tra environment variables
   - Chạy `npm run build` local để test

2. **Database Connection Error**
   - Kiểm tra Supabase URL và API key
   - Đảm bảo database đã được setup

3. **404 Error**
   - Kiểm tra routing configuration
   - Đảm bảo `vercel.json` được cấu hình đúng

## 📊 Monitoring

### Vercel Analytics
- Vercel sẽ tự động track performance
- Xem metrics trong Vercel Dashboard

### Supabase Monitoring
- Kiểm tra database logs trong Supabase Dashboard
- Monitor API usage và performance

## 🔄 Auto Deploy

- Mỗi khi push code lên GitHub, Vercel sẽ tự động deploy
- Có thể cấu hình branch protection và preview deployments

## 📱 Features

### Đã implement:
- ✅ Supabase Authentication
- ✅ Database với 9 tables
- ✅ File upload (avatars)
- ✅ Course management
- ✅ Blog system
- ✅ Payment integration
- ✅ Responsive design
- ✅ TypeScript support

### Cần setup:
- 🔧 Database schema (manual)
- 🔧 Environment variables
- 🔧 Storage bucket

## 🎯 Next Steps

1. **Setup Database** theo hướng dẫn
2. **Deploy lên Vercel** theo các bước trên
3. **Test ứng dụng** trên production URL
4. **Monitor performance** và fix bugs nếu có

## 📞 Support

Nếu có vấn đề trong quá trình deploy:
- Kiểm tra Vercel logs
- Kiểm tra Supabase logs
- Xem documentation trong `docs/` folder

---

**Knowledge Base** - Deploy thành công! 🚀✨
