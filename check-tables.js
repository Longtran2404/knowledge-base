const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://byidgbgvnrfhujprzzge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE'
);

console.log('🔍 Checking database tables...\n');

const tables = [
  'users',
  'courses',
  'blog_posts',
  'products',
  'cart_items',
  'user_files',
  'user_activities',
  'account_nam_long_center',
  'nlc_accounts',
  'nlc_courses',
  'nlc_enrollments',
  'nlc_payment_transactions',
  'nlc_course_content',
  'n8n_workflows'
];

(async () => {
  console.log('📊 Checking for tables:\n');

  const existing = [];
  const missing = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(0);

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          missing.push(table);
          console.log('❌', table.padEnd(30), '(not found)');
        } else {
          console.log('⚠️ ', table.padEnd(30), `(error: ${error.message})`);
        }
      } else {
        existing.push(table);
        console.log('✅', table.padEnd(30), '(exists)');
      }
    } catch (err) {
      console.log('❌', table.padEnd(30), `(error: ${err.message})`);
      missing.push(table);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Existing tables: ${existing.length}`);
  console.log(`❌ Missing tables: ${missing.length}`);

  if (existing.length > 0) {
    console.log('\n✅ Tables found:');
    existing.forEach(t => console.log('   -', t));
  }

  if (missing.length > 0) {
    console.log('\n❌ Tables missing (need to create):');
    missing.forEach(t => console.log('   -', t));

    console.log('\n💡 To create tables, run:');
    console.log('   node scripts/setup-database.js');
  }

  if (existing.length === 0) {
    console.log('\n⚠️  No tables found - database is empty!');
    console.log('You need to run database setup to create all tables.');
  }
})();
