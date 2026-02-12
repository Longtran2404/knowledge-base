# Upload lại lên GitHub và Vercel (sau khi đã xóa repo/project cũ)

## Bước 1: Tạo repository mới trên GitHub

1. Vào **https://github.com/new**
2. **Repository name:** gõ **`knowledge-base`**
3. Chọn **Public** (hoặc Private tùy bạn)
4. **Không** tick "Add a README file" (để repo trống)
5. Bấm **Create repository**

## Bước 2: Đẩy code lên GitHub

Trong terminal, tại thư mục project (namlongcenter):

```bash
# Trỏ remote tới repo mới (thay YOUR_USERNAME bằng username GitHub của bạn, ví dụ Longtran2404)
git remote set-url origin https://github.com/YOUR_USERNAME/knowledge-base.git

# Đẩy code lên
git push -u origin main
```

Nếu GitHub bắt đăng nhập: dùng Personal Access Token thay mật khẩu, hoặc đăng nhập qua trình duyệt (Git Credential Manager).

## Bước 3: Deploy lên Vercel

1. Vào **https://vercel.com/new**
2. **Import Git Repository** → chọn **knowledge-base** (hoặc kết nối GitHub nếu chưa có)
3. **Project Name** có thể để **knowledge-base** hoặc đổi tùy ý
4. Thêm **Environment Variables** nếu cần (ví dụ SePay, Supabase): Settings → Environment Variables
5. Bấm **Deploy**

Hoặc dùng CLI (sau khi đã push lên GitHub):

```bash
vercel login
vercel --prod
```

---

Sau khi tạo xong repo **knowledge-base** trên GitHub, chỉ cần chạy 2 lệnh ở Bước 2 (đổi YOUR_USERNAME cho đúng) là code sẽ lên GitHub. Sau đó làm Bước 3 để lên Vercel.
