# 🚀 Database Setup Final - Nam Long Center

## ✅ Bước tiếp theo: Setup Database

### **Trạng thái hiện tại:**

- ✅ **Dự án đang chạy** - http://localhost:3000
- ✅ **Code đã được enable** - Tất cả Supabase calls đã active
- ⚠️ **Database cần setup** - Một số bảng chưa được tạo

### **Các bảng cần tạo:**

- `nlc_password_change_requests` - Yêu cầu đổi mật khẩu
- `nlc_phone_verifications` - Xác thực số điện thoại
- `nlc_saved_payment_methods` - Phương thức thanh toán đã lưu
- `nlc_subscriptions` - Đăng ký membership

## 📋 Hướng dẫn Setup Database:

### **Bước 1: Mở Supabase Dashboard**

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng SQL ở sidebar)

### **Bước 2: Chạy SQL**

1. Copy toàn bộ nội dung từ file `database/setup.sql`
2. Paste vào SQL Editor
3. Click **Run** để thực thi

### **Bước 3: Kiểm tra kết quả**

Sau khi chạy SQL, bạn sẽ thấy:

- ✅ 12 bảng được tạo thành công
- ✅ RLS policies được thiết lập
- ✅ Indexes được tạo cho performance

## 🧪 Test Database Connection:

Sau khi setup xong, chạy lệnh này để kiểm tra:

```bash
node scripts/test-database-connection.js
```

Kết quả mong đợi:

```
✅ Database connection successful!
✅ Table nlc_users exists and is accessible
✅ Table nlc_membership_plans exists and is accessible
✅ Table nlc_password_change_requests exists and is accessible
✅ Table nlc_phone_verifications exists and is accessible
✅ Table nlc_saved_payment_methods exists and is accessible
✅ Table nlc_subscriptions exists and is accessible
```

## 🎯 Test Account Management Features:

Sau khi database setup xong, bạn có thể test:

### **1. Account Management Page:**

- Truy cập: http://localhost:3000/quan-ly-tai-khoan
- **Profile Tab**: Xem thông tin membership
- **Settings Tab**: Test tất cả tính năng

### **2. Đổi mật khẩu:**

- Click "Thay đổi mật khẩu"
- Nhập email → Gửi email xác thực
- Truy cập link trong email → Đổi mật khẩu

### **3. Xác thực số điện thoại:**

- Click "Xác thực số điện thoại"
- Nhập số điện thoại → Gửi mã SMS
- Nhập mã xác thực (123456) → Xác thực thành công

### **4. Nâng cấp Membership:**

- Click "Nâng cấp Membership"
- Chọn gói → Nâng cấp thành công

### **5. Xóa tài khoản:**

- Click "Xóa tài khoản"
- Nhập `email-delete` → Xóa tài khoản

## 🔧 Troubleshooting:

### **Nếu gặp lỗi 406/400:**

- Kiểm tra RLS policies đã được tạo chưa
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra bảng có tồn tại không

### **Nếu gặp lỗi permission:**

- Kiểm tra Supabase service role key
- Kiểm tra RLS policies cho từng bảng

## 🎉 Kết quả cuối cùng:

Sau khi setup xong, bạn sẽ có:

- ✅ **Account Management hoàn chỉnh** với tất cả tính năng
- ✅ **Database đầy đủ** với 12 bảng và RLS
- ✅ **UI/UX chuyên nghiệp** với dialogs và validation
- ✅ **Bảo mật cao** với xác thực email và xác nhận xóa

**Dự án sẽ hoạt động 100% sau khi setup database!** 🚀
