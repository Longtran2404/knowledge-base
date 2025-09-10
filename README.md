# 🎓 Nam Long Center - Nền tảng đào tạo trực tuyến

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js" alt="Next.js Version" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-green?style=for-the-badge&logo=vercel" alt="Vercel Deployed" />
</div>

## 📖 Giới thiệu

**Nam Long Center** là một nền tảng đào tạo trực tuyến hiện đại, được xây dựng với công nghệ tiên tiến để mang đến trải nghiệm học tập tốt nhất cho học viên. Dự án tập trung vào việc cung cấp các khóa học chất lượng cao, tài nguyên học tập phong phú và hệ thống quản lý toàn diện.

## ✨ Tính năng chính

### 🔐 Hệ thống xác thực tùy chỉnh
- **Đăng ký/Đăng nhập** với email và mật khẩu
- **Xác thực email** tự động sau đăng ký
- **Quên mật khẩu** với email reset
- **Bảo mật cao** với mã hóa bcrypt và JWT
- **Giao diện đẹp** với password strength indicator

### 📚 Quản lý khóa học
- **Danh sách khóa học** với bộ lọc thông minh
- **Chi tiết khóa học** với thông tin đầy đủ
- **Đánh giá và rating** từ học viên
- **Phân loại theo cấp độ** (Cơ bản, Trung cấp, Nâng cao)

### 🛒 Marketplace
- **Sản phẩm số** và template
- **Giỏ hàng** thông minh
- **Thanh toán** đa dạng phương thức
- **Quản lý đơn hàng** chi tiết

### 📖 Tài nguyên học tập
- **Thư viện tài liệu** phong phú
- **Tải xuống** PDF, video, template
- **Phân loại** theo chủ đề
- **Tìm kiếm** nhanh chóng

### 🎯 Hệ thống quản lý
- **Dashboard** cho quản trị viên
- **Thống kê** chi tiết
- **Quản lý người dùng**
- **Báo cáo** doanh thu

## 🚀 Công nghệ sử dụng

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **React Router DOM** - Routing
- **Zustand** - State management
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - Database và API
- **PostgreSQL** - Database chính
- **Custom Email Auth** - Hệ thống xác thực tùy chỉnh
- **JWT** - Token authentication
- **bcryptjs** - Password hashing

### Email Service
- **Nodemailer** - Email sending
- **Custom templates** - Email design
- **SMTP configuration** - Email delivery

### Development Tools
- **Vite** - Build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **CRACO** - Webpack configuration

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/LongTran2404/namlongcenter.git
cd namlongcenter
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment variables**
```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Nam Long Center <your_email@gmail.com>

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

4. **Chạy database migrations**
```bash
# Chạy file SQL trong database/email-auth-schema.sql
# trên Supabase SQL Editor
```

5. **Khởi chạy ứng dụng**
```bash
# Development
npm start

# Production build
npm run build
npm run preview
```

## 🗂️ Cấu trúc dự án

```
namlongcenter/
├── 📁 public/                 # Static assets
├── 📁 src/
│   ├── 📁 components/         # React components
│   │   ├── 📁 ui/            # Shadcn/UI components
│   │   ├── 📁 layout/        # Layout components
│   │   └── 📁 guide/         # Tour guide components
│   ├── 📁 contexts/          # React contexts
│   ├── 📁 data/              # Mock data
│   ├── 📁 lib/               # Utilities và helpers
│   │   ├── 📁 hooks/         # Custom hooks
│   │   ├── 📁 stores/        # Zustand stores
│   │   └── 📁 schemas/       # Validation schemas
│   ├── 📁 pages/             # Page components
│   ├── 📁 types/             # TypeScript types
│   └── 📁 config/            # Configuration files
├── 📁 database/              # Database schemas
├── 📄 package.json
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
└── 📄 README.md
```

## 🔧 Cấu hình

### Email Service
Dự án sử dụng Nodemailer để gửi email. Cấu hình trong `src/config/email.config.ts`:

```typescript
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};
```

### Database Schema
Dự án sử dụng Supabase với các bảng chính:
- `users` - Thông tin người dùng
- `sessions` - Quản lý phiên đăng nhập
- `email_verification_tokens` - Token xác thực email
- `password_reset_tokens` - Token reset mật khẩu

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect GitHub repository** với Vercel
2. **Cấu hình Environment Variables** trong Vercel dashboard
3. **Deploy** tự động từ main branch

### Manual Deployment
```bash
# Build project
npm run build

# Deploy to your hosting provider
# Upload dist/ folder to your server
```

## 📱 Tính năng nổi bật

### 🎨 UI/UX Design
- **Responsive design** - Tương thích mọi thiết bị
- **Dark/Light mode** - Chế độ sáng/tối
- **Smooth animations** - Hiệu ứng mượt mà
- **Accessibility** - Hỗ trợ người khuyết tật

### 🔒 Bảo mật
- **Password strength** - Kiểm tra độ mạnh mật khẩu
- **Email verification** - Xác thực email bắt buộc
- **JWT tokens** - Bảo mật phiên đăng nhập
- **HTTPS** - Mã hóa dữ liệu

### ⚡ Performance
- **Code splitting** - Tải trang nhanh
- **Image optimization** - Tối ưu hình ảnh
- **Caching** - Cache thông minh
- **Lazy loading** - Tải lazy

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng! Hãy:

1. **Fork** repository này
2. **Tạo branch** mới cho feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Mở Pull Request**

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: info@namlongcenter.com
- **Website**: https://namlongcenter.com
- **GitHub**: [@LongTran2404](https://github.com/LongTran2404)

## 🙏 Lời cảm ơn

Cảm ơn tất cả các contributors đã đóng góp cho dự án này!

---

<div align="center">
  <p>Được phát triển với ❤️ bởi <strong>Nam Long Center Team</strong></p>
  <p>© 2024 Nam Long Center. All rights reserved.</p>
</div>