# Chuyển từ CRA sang Next.js

Dự án đã được chuyển từ Create React App (CRA) sang **Next.js 15** (App Router), chạy ở chế độ SPA: toàn bộ route do React Router trong App xử lý.

## Đã thay đổi

- **package.json**: Bỏ `react-scripts`, `@craco/craco`; thêm `next`, `eslint-config-next`. Scripts: `dev` = `next dev`, `build` = `next build`, `start` = `next start`.
- **next.config.ts**: Cấu hình env map `REACT_APP_*` → `NEXT_PUBLIC_*` để giữ tương thích .env cũ.
- **src/app/**: Root layout (`layout.tsx`) và catch-all route `[[...slug]]/page.tsx` + `client.tsx` (nhúng App CRA với `ssr: false`).
- **src/pages** → **src/views**: Đổi tên để Next.js không nhận nhầm là Pages Router; `App.tsx` import từ `./views/`.
- **babel.config.js**: Đổi tên thành `babel.config.js.cra-backup` để Next dùng SWC.
- **services/config.ts**: Đọc cả `NEXT_PUBLIC_*` và `REACT_APP_*`.

## Cách chạy

```bash
npm run dev    # http://localhost:3000
npm run build
npm run start  # chạy bản build
```

## Lưu ý

- **ESLint**: Đang `ignoreDuringBuilds: true` trong next.config (nhiều rule Next khác CRA). Có thể bật lại và sửa dần.
- **Env**: Giữ `.env` với `REACT_APP_*` vẫn được; nếu thêm biến mới nên dùng `NEXT_PUBLIC_*`.
- **public/index.html**, **src/index.tsx**: Có thể xóa (Next không dùng); giữ lại cũng không ảnh hưởng.

## Bước tiếp (tùy chọn)

- Chuyển dần từ React Router sang file-based routing của Next (tạo từng route trong `app/`).
- Bật lại ESLint và sửa `@next/next/no-img-element`, `no-html-link-for-pages`, v.v.
- Dùng `next/image` cho ảnh, `next/link` cho link nội bộ khi tạo trang mới.
