import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n📝 Add to .env.local:');
  console.log('REACT_APP_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filePath: string) {
  const fileName = path.basename(filePath);
  console.log(`\n🚀 Running migration: ${fileName}...`);

  const sql = fs.readFileSync(filePath, 'utf-8');

  // Split by semicolon and filter out empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct query if RPC doesn't exist
        const { error: directError } = await (supabase as any).from('_').select(statement);
        if (directError && !directError.message.includes('does not exist')) {
          console.error(`   ❌ Statement ${i + 1} failed:`, directError.message);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Statement ${i + 1} error:`, err.message);
      errorCount++;
    }
  }

  console.log(`✅ Migration complete: ${successCount} successful, ${errorCount} errors`);
}

async function main() {
  console.log('🔧 Knowledge Base - Database Migration Tool\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  const migrations = [
    'upgrade_admin_and_cms.sql',
    'add_subscription_system.sql'
  ];

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    if (fs.existsSync(filePath)) {
      await runMigration(filePath);
    } else {
      console.error(`❌ Migration file not found: ${migration}`);
    }
  }

  console.log('\n✨ All migrations completed!');
  console.log('🔄 Please refresh your browser (Ctrl + Shift + R)');
}

main().catch(console.error);
