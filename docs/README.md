# 📚 Knowledge Base - Documentation

> Tài liệu hướng dẫn cho dự án Knowledge Base

## 📂 Cấu trúc tài liệu

### 🚀 Setup & Deployment
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Hướng dẫn khởi động nhanh
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn deploy production
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Hướng dẫn test

### 💾 Database
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - Setup database
- [SUPABASE_SETUP_FINAL.md](./SUPABASE_SETUP_FINAL.md) - Cấu hình Supabase
- [HƯỚNG_DẪN_NHANH_SUPABASE.md](./HƯỚNG_DẪN_NHANH_SUPABASE.md) - Hướng dẫn nhanh (Tiếng Việt)
- [KHẮC_PHỤC_LỖI_SUPABASE.md](./KHẮC_PHỤC_LỖI_SUPABASE.md) - Khắc phục lỗi (Tiếng Việt)

### 💳 Payment Integration
- [PAYMENT_SYSTEM_SETUP.md](./PAYMENT_SYSTEM_SETUP.md) - Hệ thống thanh toán
- [VNPAY_SETUP_GUIDE.md](./VNPAY_SETUP_GUIDE.md) - Tích hợp VNPay
- [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) - Tích hợp Stripe

### 🔐 Authentication
- [EMAIL_AUTH_SETUP.md](./EMAIL_AUTH_SETUP.md) - Xác thực email
- [EMAILJS_SETUP.md](./EMAILJS_SETUP.md) - Cấu hình EmailJS

### 🛒 Features
- [CART_FEATURES.md](./CART_FEATURES.md) - Tính năng giỏ hàng

### 🔄 Workflow & Migration
- [QUICK_START_WORKFLOWS.md](./QUICK_START_WORKFLOWS.md) - Workflow nhanh
- [WORKFLOW_MARKETPLACE_SETUP.md](./WORKFLOW_MARKETPLACE_SETUP.md) - Setup marketplace workflow
- [WORKFLOW_COMPLETE_GUIDE.md](./WORKFLOW_COMPLETE_GUIDE.md) - Hướng dẫn workflow đầy đủ
- [WORKFLOW_SUMMARY.md](./WORKFLOW_SUMMARY.md) - Tóm tắt workflow
- [RUN_MIGRATION.md](./RUN_MIGRATION.md) - Chạy migration
- [RUN_MIGRATION_INSTRUCTIONS.md](./RUN_MIGRATION_INSTRUCTIONS.md) - Hướng dẫn migration
- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Cấu hình storage
- [UPGRADE_INSTRUCTIONS.md](./UPGRADE_INSTRUCTIONS.md) - Nâng cấp

### 📝 Other
- [CHANGELOG.md](./CHANGELOG.md) - Lịch sử thay đổi

## 🔧 Quick Setup

### Database Setup:
1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project: `byidgbgvnrfhujprzzge`
3. Vào SQL Editor
4. Copy & Run file: `database/setup.sql`

### Run Project:
```bash
npm install
npm start
```

### Deploy:
```bash
npm run build
vercel --prod
```

## 📞 Contact
- Email: tranminhlong2404@gmail.com
- Version: 1.0.0
