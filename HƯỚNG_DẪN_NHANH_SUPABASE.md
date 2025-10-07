# 🚀 HƯỚNG DẪN NHANH: TẠO SUPABASE PROJECT MỚI

## ⚡ 5 PHÚT ĐỂ CHẠY LẠI APP

### Bước 1: Xóa localStorage (30 giây)

1. Mở trình duyệt đang chạy app
2. Nhấn `F12` → Tab **Console**
3. Chạy lệnh:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Bước 2: Tạo Supabase Project (2 phút)

1. **Vào:** https://app.supabase.com/new
   
2. **Đăng nhập** (nếu chưa)

3. **Tạo project:**
   ```
   Name: Nam Long Center
   Database Password: [TẠO PASSWORD MẠNH - GHI LẠI!]
   Region: Southeast Asia (Singapore)
   ```

4. **Click "Create new project"**

5. **Đợi 2-3 phút** (có thanh progress)

### Bước 3: Lấy Credentials (30 giây)

1. Sau khi project tạo xong
2. Bên trái click **Settings** (icon bánh răng ⚙️)
3. Click **API**
4. Copy 2 thông tin:

   **Project URL:**
   ```
   https://abcdefghijk.supabase.co
   ```

   **anon public:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (rất dài)
   ```

### Bước 4: Cập nhật .env (30 giây)

Mở file `.env` trong project và thay:

```env
# THAY ĐỔI 2 DÒNG NÀY
REACT_APP_SUPABASE_URL=https://YOUR_NEW_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY

# GIỮ NGUYÊN PHẦN DƯỚI
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

**VÍ DỤ thực tế:**
```env
REACT_APP_SUPABASE_URL=https://abcxyz123.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY3h5ejEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA...
```

### Bước 5: Setup Database (1 phút)

1. Trong Supabase Dashboard, click **SQL Editor** (icon database)
2. Click **New query**
3. Mở file `database/setup.sql` trong VS Code
4. Copy toàn bộ → Paste vào SQL Editor
5. Click **RUN** hoặc `Ctrl+Enter`
6. Đợi vài giây → Done!

### Bước 6: Restart Server (30 giây)

Trong terminal:

```powershell
# Dừng server (Ctrl+C)

# Khởi động lại
npm start
```

---

## ✅ KIỂM TRA THÀNH CÔNG

Sau khi restart, app sẽ:
- ✅ Không còn lỗi `ERR_NAME_NOT_RESOLVED`
- ✅ Trang login hiển thị bình thường
- ✅ Có thể đăng ký/đăng nhập

---

## 🎯 TÓM TẮT CHECKLIST

- [ ] 1. Xóa localStorage (F12 → Console → `localStorage.clear()`)
- [ ] 2. Tạo project mới tại https://app.supabase.com/new
- [ ] 3. Copy Project URL và anon key
- [ ] 4. Cập nhật file `.env`
- [ ] 5. Run SQL từ `database/setup.sql`
- [ ] 6. Restart server (`npm start`)
- [ ] 7. Test đăng nhập

---

## 💡 MẸO

### Tránh mất project:
- ✅ Login vào Supabase 1 lần/tuần
- ✅ Hoặc upgrade lên Pro ($25/tháng)

### Backup credentials:
```
Lưu vào 1Password, LastPass, hoặc file txt riêng:
- Project URL: https://xxxxx.supabase.co
- Anon Key: eyJhbGc...
- Database Password: *****
```

---

**Làm xong 6 bước trên → App chạy ngay!** 🎉








