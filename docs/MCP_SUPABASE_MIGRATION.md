# Chạy migration / tạo bảng trên Supabase

## Cách nhanh nhất (không cần DATABASE_URL): SQL Editor

1. Mở [Supabase Dashboard](https://supabase.com/dashboard) → chọn project.
2. Vào **SQL Editor** → **New query**.
3. Mở file **`supabase/migrations/FULL_SCHEMA_001_subscription_002.sql`** trong repo, copy toàn bộ nội dung.
4. Paste vào ô SQL → bấm **Run**.

Một lần chạy sẽ tạo đủ: `nlc_accounts`, `nlc_user_files`, `nlc_workflows`, `nlc_workflow_orders`, trigger đăng ký, bảng gói (subscription + partner), và các bảng mở rộng: `nlc_sepay_pending_orders`, `nlc_auth_errors`, `nlc_reports`.

---

## Cách 1: Dùng MCP Supabase trong Cursor

1. Mở **Cursor** > **Settings** (Ctrl+,) > **Tools & MCP**.
2. Đảm bảo **Supabase MCP** đã được thêm và kết nối (URL: `https://mcp.supabase.com/mcp` hoặc cấu hình trong `.cursor/mcp.json` / `.mcp-supabase.json`).
3. Trong chat với AI, nhắc:
   - *"Apply migration từ file supabase/migrations/002_extend_accounts_and_reports.sql bằng MCP Supabase"*, hoặc
   - *"Execute SQL: [nội dung file 002_extend_accounts_and_reports.sql]"* (dùng tool `execute_sql` của MCP Supabase).

4. Nếu MCP ở chế độ read-only, cần bật quyền ghi (write) trong cấu hình MCP để tạo bảng.

Sau khi chạy xong, các bảng/cột sau sẽ có trên Supabase:

- **nlc_accounts**: thêm cột `id_card`, `city`, `ward`
- **nlc_sepay_pending_orders**: bảng mới (map invoice → user_id cho IPN)
- **nlc_auth_errors**: bảng mới (ghi lỗi đăng nhập/đăng ký)
- **nlc_reports**: bảng mới (báo cáo lỗi / tranh chấp)

## Cách 2: Chạy SQL trong Supabase Dashboard

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) > chọn project.
2. Mở **SQL Editor** > **New query**.
3. Copy toàn bộ nội dung file `supabase/migrations/002_extend_accounts_and_reports.sql` và paste vào.
4. Bấm **Run**.

## Cách 3: Script Node (cần DATABASE_URL)

1. Lấy connection string: Supabase Dashboard > **Settings** > **Database** > **Connection string** (URI).
2. Đặt env: `DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
3. Cài dependency: `npm i -D pg`
4. Chạy: `node scripts/run-migration-002-supabase.js`
