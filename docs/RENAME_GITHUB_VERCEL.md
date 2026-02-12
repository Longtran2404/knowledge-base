# Đổi tên repo/project sang Knowledge Base trên GitHub và Vercel

Sau khi đổi tên, URL mới sẽ dạng:
- **GitHub:** `https://github.com/Longtran2404/knowledge-base`
- **Vercel:** `https://knowledge-base-xxx.vercel.app` (nếu đổi tên project)

---

## 1. Đổi tên repository trên GitHub

1. Mở repo hiện tại: **https://github.com/Longtran2404/nam-long-center**
2. Vào **Settings** (tab phía trên).
3. Ở phần **General** → **Repository name**, đổi `nam-long-center` thành **`knowledge-base`**.
4. Bấm **Rename**. GitHub sẽ chuyển hướng sang URL mới và giữ redirect từ URL cũ.

**Cập nhật remote trên máy (sau khi đổi tên):**
```bash
git remote set-url origin https://github.com/Longtran2404/knowledge-base.git
git fetch origin
```

---

## 2. Đổi tên project trên Vercel

1. Đăng nhập [vercel.com](https://vercel.com) → chọn **project** (đang tên cũ, ví dụ `nam-long-center`).
2. Vào **Settings** → **General**.
3. Ở **Project Name**, đổi thành **`knowledge-base`** (hoặc tên bạn muốn).
4. Bấm **Save**. URL production sẽ thành `https://knowledge-base-<random>.vercel.app` (hoặc domain custom nếu bạn đã gắn).

**Nếu project Vercel đang kết nối GitHub:** Sau khi đổi tên repo trên GitHub, Vercel có thể vẫn deploy bình thường. Chỉ cần đổi **Project Name** trong Vercel để tên hiển thị và subdomain khớp tên mới.

---

## 3. Kiểm tra sau khi đổi

- **GitHub:** Mở `https://github.com/Longtran2404/knowledge-base` → repo mở được, clone/push vẫn dùng URL mới.
- **Vercel:** Vào project → **Deployments** → Production URL mới (hoặc domain custom) mở được.

README và script trong repo đã dùng `knowledge-base`, không cần sửa thêm sau khi đổi tên.
