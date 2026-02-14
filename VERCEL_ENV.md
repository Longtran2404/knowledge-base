# Biến môi trường cho Vercel

Thêm các biến sau vào **Vercel Dashboard** → Project → **Settings** → **Environment Variables**:

## Bắt buộc (Supabase)

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `REACT_APP_SUPABASE_URL` | `https://rdthvbxengvsnjicmugv.supabase.co` | Project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | (anon public JWT) | Dùng cho client - Auth + Database |
| `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` | (service_role JWT) | Chỉ server-side - bypass RLS |

## Storage (lưu tài liệu)

| Biến | Mục đích |
|------|----------|
| `SUPABASE_S3_ACCESS_KEY_ID` | S3 protocol - upload tài liệu |
| `SUPABASE_S3_SECRET_ACCESS_KEY` | S3 protocol |
| `SUPABASE_S3_ENDPOINT` | `https://rdthvbxengvsnjicmugv.storage.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_REGION` | `ap-south-1` |

## Khác

| Biến | Mục đích |
|------|----------|
| `SUPABASE_DB_PASSWORD` | Database password (migrations) |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable API Key |

**Lưu ý:** File `.env` đã được cập nhật local. **Không commit** `.env` lên Git. Trên Vercel, thêm thủ công từ Dashboard.
