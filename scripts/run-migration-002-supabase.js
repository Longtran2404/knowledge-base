/**
 * Chạy migration 002_extend_accounts_and_reports.sql lên Supabase.
 * Cần: DATABASE_URL hoặc SUPABASE_DB_URL (Postgres connection string từ Supabase Dashboard > Settings > Database).
 * Chạy: node scripts/run-migration-002-supabase.js
 *
 * Hoặc dùng MCP Supabase trong Cursor: mở Cursor > Settings > Tools & MCP, bật Supabase MCP,
 * rồi nhắc: "Apply migration 002_extend_accounts_and_reports" hoặc "Execute SQL from supabase/migrations/002_extend_accounts_and_reports.sql"
 */

const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_extend_accounts_and_reports.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('Thiếu DATABASE_URL hoặc SUPABASE_DB_URL. Lấy từ Supabase Dashboard > Settings > Database > Connection string.');
  process.exit(1);
}

async function run() {
  let pg;
  try {
    pg = (await import('pg')).default;
  } catch {
    console.error('Cài pg: npm i -D pg');
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration 002 chạy xong.');
  } catch (err) {
    console.error('Lỗi migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
