# Database Schema - Knowledge Base

Thư mục này chứa schema database hoàn chỉnh cho Knowledge Base.

## 📁 Files

- **`setup.sql`** - **File chính duy nhất** để setup database hoàn chỉnh
- **`README.md`** - Hướng dẫn này

## 🚀 Cách sử dụng

### 1. Mở Supabase Dashboard

- Truy cập: https://supabase.com/dashboard
- Chọn project của bạn
- Vào **SQL Editor** (biểu tượng SQL ở sidebar trái)

### 2. Chạy SQL Setup

- Copy toàn bộ nội dung file `setup.sql`
- Paste vào SQL Editor
- Click **"Run"** để thực thi

### 3. Kiểm tra kết quả

Sau khi chạy thành công, bạn sẽ thấy:

- ✅ 7 bảng NLC được tạo
- ✅ Admin account: `tranminhlong2404@gmail.com`
- ✅ 3 sample courses
- ✅ Indexes và triggers được thiết lập

## 🗄️ Database Structure

### 7 Bảng chính:

1. **`nlc_accounts`** - Thông tin người dùng chính
2. **`nlc_courses`** - Danh sách khóa học
3. **`nlc_enrollments`** - Đăng ký khóa học của user
4. **`nlc_managers`** - Quản lý và admin
5. **`nlc_user_approvals`** - Phê duyệt nâng cấp role
6. **`nlc_notifications`** - Hệ thống thông báo
7. **`nlc_activity_log`** - Log hoạt động của user

### Features:

- ✅ **Foreign Keys** - Liên kết chặt chẽ giữa các bảng
- ✅ **Indexes** - Tối ưu performance
- ✅ **Triggers** - Tự động cập nhật timestamps
- ✅ **Sample Data** - Dữ liệu mẫu sẵn sàng
- ✅ **Admin Account** - Tài khoản admin đầy đủ quyền

## 🔧 Environment Variables

Đảm bảo file `.env.local` có:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing

Sau khi setup database:

1. **Test đăng ký user mới** - Kiểm tra tạo account tự động
2. **Test đăng ký khóa học** - Kiểm tra enrollment system
3. **Test admin dashboard** - Kiểm tra quyền admin
4. **Test notifications** - Kiểm tra hệ thống thông báo

## 🔒 Security

- Tất cả bảng sử dụng **Row Level Security (RLS)**
- User chỉ có thể truy cập dữ liệu của mình
- Admin có quyền truy cập toàn bộ
- Authentication được xử lý bởi Supabase Auth

## 📊 Admin Account

Sau khi setup, admin account:

- **Email**: `tranminhlong2404@gmail.com`
- **Role**: `admin`
- **Plan**: `business`
- **Permissions**: Toàn quyền quản lý

## ⚠️ Lưu ý

- File `setup.sql` sẽ **XÓA tất cả bảng cũ** trước khi tạo mới
- Backup dữ liệu quan trọng trước khi chạy (nếu có)
- Test kỹ sau khi setup để đảm bảo mọi thứ hoạt động

## 🎯 Kết quả mong đợi

Sau khi chạy thành công:

- ❌ Không còn lỗi 406/400
- ✅ Account Management page hoạt động
- ✅ Tất cả tính năng sẵn sàng
- ✅ Database đồng bộ với code

---

**🎉 Database sẵn sàng cho production!**
