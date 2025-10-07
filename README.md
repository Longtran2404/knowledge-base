# Nam Long Center v1.0.0

Ứng dụng web hiện đại cho trung tâm Nam Long với React 18, TypeScript, và Supabase.

## 🚀 Tính năng chính

- **Authentication**: Đăng nhập/đăng ký với Supabase Auth (PKCE flow)
- **File Management**: Upload, quản lý và chia sẻ file với progress tracking
- **Real-time**: Thông báo và cập nhật real-time với Supabase Realtime
- **Modern UI**: Liquid Glass design system với Framer Motion animations
- **Payment**: Tích hợp VNPay và MoMo payment gateways
- **Membership**: Hệ thống membership với 3 cấp độ (Free, Member, Premium)
- **Cart & Orders**: Giỏ hàng và quản lý đơn hàng
- **Responsive**: Thiết kế responsive cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18.3.1, TypeScript 5.0, Create React App
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **State Management**: React Context API
- **Build Tool**: CRACO (Create React App Configuration Override)
- **Payment**: VNPay, MoMo integration

## 📦 Cài đặt

```bash
# Clone repository
git clone https://github.com/Longtran2404/nam-long-center.git
cd nam-long-center

# Cài đặt dependencies
npm install

# Cấu hình environment variables
cp .env.example .env.local
# Chỉnh sửa .env.local với thông tin Supabase của bạn

# Chạy development server
npm start
```

## 🔧 Environment Variables

Tạo file `.env.local` với các biến sau:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deploy lên Vercel

### 1. Deploy từ GitHub

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import repository từ GitHub: `Longtran2404/nam-long-center`
4. Cấu hình Environment Variables:
   - `REACT_APP_SUPABASE_URL`: URL Supabase của bạn
   - `REACT_APP_SUPABASE_ANON_KEY`: Anon key Supabase của bạn
5. Click "Deploy"

### 2. Deploy từ CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login vào Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## 📁 Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── ui/             # UI components
│   ├── upload/         # File upload components
│   └── ...
├── contexts/           # React contexts
├── lib/                # Utilities và services
│   ├── supabase-config.ts
│   ├── api/            # API services
│   ├── payment/        # Payment gateways
│   └── ...
├── pages/              # Page components
└── types/              # TypeScript types
```

## 🔐 Supabase Setup

1. Tạo project mới trên [Supabase](https://supabase.com)
2. Chạy SQL migrations để tạo tables
3. Cấu hình Row Level Security (RLS) policies
4. Setup Storage buckets cho file uploads
5. Cấu hình Authentication providers

## 📱 Scripts

```bash
npm start          # Chạy development server
npm run build      # Build production
npm run lint       # Chạy ESLint
npm run test       # Chạy tests
npm run setup:storage  # Setup Supabase storage
```

## 🎨 UI Components

- **LiquidGlassButton**: Button với hiệu ứng glass morphism
- **LiquidGlassCard**: Card component với glass effect
- **EnhancedToast**: Toast notification system
- **AdvancedFileUpload**: File upload với progress tracking

## 🔄 State Management

- **UnifiedAuthContext**: Quản lý authentication state
- **CartContext**: Quản lý shopping cart
- **NotificationContext**: Quản lý notifications
- **Redux Store**: Global state management

## 📊 Performance

- Code splitting với React.lazy()
- Memoization với useCallback và useMemo
- Optimized bundle size với Webpack
- Image optimization
- Caching strategies

## 🚀 Deployment

Dự án đã được cấu hình sẵn cho Vercel deployment với:

- `vercel.json`: Cấu hình build và routing
- `.vercelignore`: Loại trừ files không cần thiết
- Environment variables setup

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📞 Support

Nếu có vấn đề gì, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Nam Long Center** - Nền tảng học tập và chia sẻ tài liệu hiện đại 🎓
