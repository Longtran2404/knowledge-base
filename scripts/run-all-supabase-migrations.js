/**
 * Chạy toàn bộ migration Supabase theo thứ tự (dùng khi project chưa có bảng).
 * Cần: DATABASE_URL hoặc SUPABASE_DB_URL (Postgres URI từ Supabase Dashboard > Settings > Database).
 * Chạy: node scripts/run-all-supabase-migrations.js
 */

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const ORDER = [
  '001_create_base_tables.sql',
  'add_subscription_system.sql',
  '002_extend_accounts_and_reports.sql',
];

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('Thiếu DATABASE_URL hoặc SUPABASE_DB_URL.');
  console.error('Lấy từ: Supabase Dashboard > Settings > Database > Connection string (URI).');
  process.exit(1);
}

async function run() {
  let pg;
  try {
    pg = (await import('pg')).default;
  } catch {
    console.error('Cài pg: npm i pg');
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    for (const name of ORDER) {
      const filePath = path.join(MIGRATIONS_DIR, name);
      if (!fs.existsSync(filePath)) {
        console.warn('Bỏ qua (không tìm thấy):', name);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log('Chạy:', name);
      await client.query(sql);
      console.log('  OK');
    }
    console.log('Tất cả migration chạy xong.');
  } catch (err) {
    console.error('Lỗi:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
