# ⚠️ Supabase Connection Issue - Hướng dẫn Khắc phục

## Vấn đề hiện tại

Domain `byidgbgvnrfhujprzzge.supabase.co` **không thể kết nối** (DNS lookup failed).

### Lỗi xuất hiện:
```
ERR_CONNECTION_REFUSED
ERR_CONNECTION_TIMED_OUT
getaddrinfo ENOTFOUND byidgbgvnrfhujprzzge.supabase.co
```

---

## 🔍 Nguyên nhân

1. **Project chưa được provision đúng** - Supabase chưa hoàn tất tạo infrastructure
2. **Project vừa mới tạo** - DNS chưa propagate (cần 5-30 phút)
3. **Project đã bị pause/delete** - Cần kiểm tra trên dashboard
4. **URL không chính xác** - Copy sai reference ID

---

## ✅ Giải pháp

### Bước 1: Kiểm tra Project trên Supabase Dashboard

1. Truy cập: **https://supabase.com/dashboard/projects**

2. Tìm project `byidgbgvnrfhujprzzge` trong danh sách

3. Kiểm tra **Status** của project:
   - ✅ **Active** - Project đang hoạt động bình thường
   - ⚠️ **Provisioning** - Project đang được tạo (đợi 5-10 phút)
   - 🔴 **Paused** - Click nút "Resume" để kích hoạt lại
   - ❌ **Not Found** - Project không tồn tại (cần tạo mới)

### Bước 2: Lấy thông tin chính xác

Nếu project tồn tại và đang Active:

1. **Click vào project** để mở
2. **Vào Settings → API**
3. **Copy các thông tin sau:**

   ```
   Project URL: https://[your-project-ref].supabase.co
   anon/public key: eyJhbG... (JWT token dài)
   service_role key: eyJhbG... (cho admin access)
   ```

4. **Screenshot** trang Settings → API để tham khảo

### Bước 3: Cập nhật file `.env`

Mở file `.env` trong thư mục gốc project và cập nhật:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://[COPY-FROM-DASHBOARD].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbG...[COPY-FROM-DASHBOARD]
```

**⚠️ Lưu ý:**
- Không có dấu cách trước/sau dấu `=`
- URL phải bắt đầu bằng `https://`
- Key phải là JWT token đầy đủ (không cắt ngắn)

### Bước 4: Restart Development Server

```bash
# Dừng server hiện tại (Ctrl+C)

# Xóa cache (nếu cần)
npm run clean

# Khởi động lại
npm start
```

---

## 🆕 Nếu cần tạo Project mới

### Option A: Tạo trên Supabase Dashboard (Khuyến nghị)

1. **Truy cập**: https://supabase.com/dashboard
2. **Click**: "New Project"
3. **Điền thông tin**:
   - Project Name: `Nam Long Center`
   - Database Password: (Tạo password mạnh)
   - Region: `Southeast Asia (Singapore)` hoặc gần Việt Nam nhất
   - Pricing Plan: `Free` (cho development)

4. **Click**: "Create new project"
5. **Chờ 5-10 phút** để Supabase provision infrastructure
6. **Khi status = "Active"**, vào Settings → API lấy thông tin

### Option B: Tạo qua Supabase CLI

```bash
# Install Supabase CLI (nếu chưa có)
npm install -g supabase

# Login
supabase login

# Tạo project
supabase projects create nam-long-center --region ap-southeast-1

# Link với project
supabase link --project-ref [your-project-ref]
```

---

## 🧪 Kiểm tra kết nối

Sau khi cập nhật credentials, chạy script test:

```bash
node test-supabase-connection.js
```

**Output mong đợi:**
```
✅ Connection successful!
Status Code: 200
✅ REST API accessible!
✅ All tests passed!
```

**Nếu vẫn lỗi:**
```
❌ Connection failed!
Error: getaddrinfo ENOTFOUND
```
→ Project chưa sẵn sàng, đợi thêm vài phút hoặc kiểm tra lại URL

---

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề sau khi thử các bước trên:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Supabase Discord**: https://discord.supabase.com
3. **Supabase Docs**: https://supabase.com/docs/guides/platform

---

## 📝 Checklist

- [ ] Project tồn tại trên Supabase Dashboard
- [ ] Project status = "Active" (không phải Paused/Provisioning)
- [ ] Project URL chính xác (copy từ Settings → API)
- [ ] anon key chính xác (copy từ Settings → API)
- [ ] File `.env` đã được cập nhật đúng format
- [ ] Dev server đã được restart
- [ ] Test script chạy thành công
- [ ] Browser không còn lỗi ERR_CONNECTION

---

## 🎯 Tóm tắt

**Vấn đề**: URL `byidgbgvnrfhujprzzge.supabase.co` không tồn tại trên DNS

**Giải pháp nhanh**:
1. Vào https://supabase.com/dashboard/projects
2. Kiểm tra project có tồn tại và đang Active
3. Copy đúng URL và keys từ Settings → API
4. Cập nhật file `.env`
5. Restart `npm start`

**Thời gian khắc phục**: 5-15 phút (nếu project đã tồn tại)

---

*Tài liệu này được tạo tự động vào: 2025-10-02*
