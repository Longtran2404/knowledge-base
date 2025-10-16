# 🚨 KHẮC PHỤC LỖI KẾT NỐI SUPABASE

## Vấn đề hiện tại

```
ERR_NAME_NOT_RESOLVED
byidgbgvnrfhujprzzge.supabase.co không thể kết nối
```

## Nguyên nhân

Supabase project `byidgbgvnrfhujprzzge` đang:
- ❌ BỊ PAUSE (free tier tự động pause sau 7 ngày không dùng)
- ❌ HOẶC đã bị xóa

## ✅ GIẢI PHÁP NGAY

### 1. XÓA LOCALSTORAGE (BẮT BUỘC!)

**Mở Console trình duyệt (F12) và chạy:**

```javascript
// Xóa tất cả auth tokens cũ
localStorage.clear();
console.log('✅ Đã xóa localStorage!');

// Reload trang
location.reload();
```

### 2. KIỂM TRA SUPABASE PROJECT

#### Option A: RESTORE project cũ (nếu bị pause)

1. Vào https://app.supabase.com/
2. Đăng nhập với tài khoản của bạn
3. Tìm project `byidgbgvnrfhujprzzge`
4. Nếu thấy nút **"Restore Project"** → Click vào
5. Đợi vài phút để project active lại

#### Option B: TẠO PROJECT MỚI (nếu project không tồn tại)

1. Vào https://app.supabase.com/new
2. Tạo project mới:
   - **Name**: Nam Long Center
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Southeast Asia (Singapore) - gần VN nhất
3. Đợi project được tạo (2-3 phút)
4. Vào **Settings → API**
5. Copy:
   - **Project URL**
   - **anon/public key**

### 3. CẬP NHẬT FILE .ENV

Sau khi có project mới, cập nhật file `.env`:

```env
# Thay bằng credentials MỚI từ Supabase
REACT_APP_SUPABASE_URL=https://your-new-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-new-anon-key

# Giữ nguyên phần này
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

### 4. SETUP DATABASE (nếu là project mới)

Nếu bạn tạo project mới, cần setup lại database:

1. Vào Supabase Dashboard → **SQL Editor**
2. Mở file `database/setup.sql` trong project
3. Copy toàn bộ nội dung
4. Paste vào SQL Editor
5. Click **RUN** để tạo tables

### 5. RESTART DEV SERVER

```powershell
# Dừng server hiện tại (Ctrl+C)

# Xóa cache
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Khởi động lại
npm start
```

### 6. KIỂM TRA KẾT NỐI

Sau khi restart, kiểm tra:

✅ **Thành công nếu:**
- Không còn lỗi `ERR_NAME_NOT_RESOLVED`
- Console không có lỗi refresh token
- Có thể đăng nhập bình thường

❌ **Vẫn lỗi nếu:**
- Vẫn thấy lỗi DNS
- → Kiểm tra lại `.env` file
- → Đảm bảo project Supabase đang ACTIVE

## 🔍 KIỂM TRA NHANH

### Cách kiểm tra project có active không:

```bash
# Test connection trong PowerShell
curl https://byidgbgvnrfhujprzzge.supabase.co/rest/v1/
```

**Kết quả:**
- ✅ Nếu có response → Project đang active
- ❌ Nếu lỗi DNS → Project không tồn tại hoặc bị pause

## 📝 HƯỚNG DẪN CHI TIẾT TẠO PROJECT MỚI

### Bước 1: Tạo Project

1. Vào https://app.supabase.com/
2. Click **"New Project"**
3. Điền thông tin:
   ```
   Organization: Chọn organization của bạn
   Name: Nam Long Center
   Database Password: [Tạo password mạnh - LƯU LẠI!]
   Region: Southeast Asia (Singapore)
   Pricing Plan: Free
   ```
4. Click **"Create new project"**
5. Đợi 2-3 phút

### Bước 2: Lấy Credentials

1. Project đã tạo xong
2. Vào **Settings** (icon bánh răng) → **API**
3. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Key dài bắt đầu bằng `eyJhbGc...`

### Bước 3: Setup Database

1. Vào **SQL Editor** (icon database)
2. Click **"New query"**
3. Mở file `d:\Web\Nam Long Center\namlongcenter\database\setup.sql`
4. Copy toàn bộ nội dung
5. Paste vào SQL Editor
6. Click **"RUN"** hoặc Ctrl+Enter
7. Đợi chạy xong (vài giây)

### Bước 4: Enable Storage (Optional)

1. Vào **Storage**
2. Create bucket mới:
   ```
   Name: user-avatars
   Public: Yes
   ```

### Bước 5: Cập nhật .env

```env
REACT_APP_SUPABASE_URL=https://your-new-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci... (key rất dài)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

## ⚡ QUICK FIX (Nếu đang vội)

```bash
# 1. Xóa localStorage (trong Browser Console)
localStorage.clear(); location.reload();

# 2. Stop server
# Ctrl+C trong terminal

# 3. Tạo project mới tại: https://app.supabase.com/new

# 4. Cập nhật .env với credentials mới

# 5. Restart
npm start
```

## 🎯 CHECKLIST

- [ ] Đã xóa localStorage
- [ ] Đã kiểm tra Supabase Dashboard
- [ ] Đã restore hoặc tạo project mới
- [ ] Đã copy credentials mới
- [ ] Đã cập nhật file .env
- [ ] Đã setup database (nếu project mới)
- [ ] Đã restart dev server
- [ ] Test đăng nhập thành công

## ⚠️ LƯU Ý QUAN TRỌNG

### Free Tier Limitations:
- ⏰ Project pause sau 7 ngày không dùng
- 💾 Database: 500MB
- 📁 Storage: 1GB
- 🔗 API requests: Không giới hạn

### Tránh bị pause:
1. Login vào dashboard 1 lần/tuần
2. Hoặc upgrade lên Pro ($25/tháng)
3. Hoặc dùng cron job để ping API

## 🆘 VẪN KHÔNG ĐƯỢC?

Nếu làm hết các bước trên mà vẫn lỗi:

1. **Kiểm tra file .env có tồn tại không:**
   ```powershell
   Get-Content .env
   ```

2. **Kiểm tra format .env đúng chưa:**
   - Không có dấu nháy `"` quanh values
   - Không có spaces dư thừa
   - Key phải là `REACT_APP_SUPABASE_URL` (chính xác)

3. **Clear cache hoàn toàn:**
   ```powershell
   npm run build
   ```

4. **Kiểm tra network:**
   - Tắt VPN nếu đang bật
   - Kiểm tra firewall
   - Thử đổi DNS sang 8.8.8.8

---

**Cần hỗ trợ thêm?** 
Gửi screenshot của:
1. Supabase Dashboard (Settings → API)
2. File `.env` (che mất sensitive keys)
3. Console errors sau khi làm xong các bước trên













