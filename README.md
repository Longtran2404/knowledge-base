# 🚀 Nam Long Center

Hệ thống quản lý học tập và khóa học trực tuyến với đầy đủ tính năng hiện đại.

## ✨ Tính năng chính

- 🎓 **Quản lý khóa học** - Tạo, quản lý và theo dõi khóa học
- 📝 **Blog hệ thống** - Viết và quản lý bài viết
- 👤 **Quản lý người dùng** - Đăng ký, đăng nhập, profile
- 💳 **Hệ thống thanh toán** - Tích hợp Stripe
- 📁 **Upload file** - Avatar và tài liệu
- 🔐 **Bảo mật** - Row Level Security với Supabase
- 📱 **Responsive** - Giao diện thân thiện mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18.3.1 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Library**: Shadcn/UI + Radix UI
- **State Management**: Zustand + React Query
- **Build Tool**: CRACO + Webpack

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment

```bash
cp env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup database

```bash
# Xem hướng dẫn chi tiết
cat docs/DATABASE_SETUP_GUIDE.md

# Hoặc chạy script test
npm run test:db
```

### 4. Chạy ứng dụng

```bash
# Development
npm start

# Production build
npm run build
```

## 📁 Cấu trúc thư mục

```
namlongcenter/
├── docs/                    # Tài liệu hướng dẫn
├── scripts/                 # Scripts tiện ích
├── database/               # Database schema
├── src/
│   ├── components/         # React components
│   ├── pages/             # Trang chính
│   ├── lib/               # Utilities và services
│   ├── contexts/          # React contexts
│   └── types/             # TypeScript types
└── public/                # Static files
```

## 🗄️ Database

### Tables chính:

- `users` - Thông tin người dùng
- `courses` - Khóa học
- `blog_posts` - Bài viết blog
- `user_courses` - Đăng ký khóa học
- `purchases` - Giao dịch
- `account_nam_long_center` - Quản lý tài khoản
- `managers` - Danh sách quản lý
- `manager_approvals` - Phê duyệt quản lý
- `manager_notifications` - Thông báo

## 🧪 Testing

```bash
# Test database connection
npm run test:db

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 📚 Tài liệu

- [Database Setup Guide](docs/DATABASE_SETUP_GUIDE.md)
- [Supabase Integration Summary](docs/SUPABASE_INTEGRATION_SUMMARY.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Payment Setup Guide](docs/PAYMENT_SETUP_GUIDE.md)

## 🚀 Scripts có sẵn

```bash
npm start              # Chạy development server
npm run build          # Build production
npm run test           # Chạy tests
npm run test:db        # Test database connection
npm run setup:db       # Setup database
npm run lint           # Lint code
npm run lint:check     # Check linting
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Database connection error**

   - Kiểm tra Supabase URL và API key
   - Chạy `npm run test:db` để kiểm tra

2. **Build error**

   - Chạy `npm run lint:check` để kiểm tra lỗi code
   - Kiểm tra TypeScript types

3. **Authentication error**
   - Kiểm tra Supabase Auth configuration
   - Xem [Database Setup Guide](docs/DATABASE_SETUP_GUIDE.md)

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Nam Long Center** - Học tập hiệu quả, phát triển bền vững! 🎓✨
