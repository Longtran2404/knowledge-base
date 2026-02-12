const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixDatabase() {
  console.log('🔍 Checking database state...\n');

  try {
    // Check if nlc_accounts table exists
    const { data: accounts, error: accountsError } = await supabase
      .from('nlc_accounts')
      .select('id, email, account_role')
      .limit(5);

    if (accountsError) {
      if (accountsError.code === 'PGRST116' || accountsError.message.includes('does not exist')) {
        console.log('❌ Table nlc_accounts does not exist');
        console.log('✅ You need to run migration: 001_create_base_tables.sql\n');
        return;
      }
      console.log('❌ Error querying nlc_accounts:', accountsError.message);
      console.log('💡 This might be a duplicate key issue\n');
    } else {
      console.log('✅ Table nlc_accounts exists');
      console.log(`📊 Found ${accounts.length} accounts:\n`);
      accounts.forEach(acc => {
        console.log(`   - ${acc.email}: ${acc.account_role} (ID: ${acc.id})`);
      });
      console.log('');
    }

    // Check for duplicate keys
    console.log('🔍 Checking for duplicate primary keys...');
    const { data: duplicates, error: dupError } = await supabase.rpc('exec_raw_sql', {
      sql: `
        SELECT id, COUNT(*) as count
        FROM nlc_accounts
        GROUP BY id
        HAVING COUNT(*) > 1;
      `
    });

    if (!dupError && duplicates && duplicates.length > 0) {
      console.log('⚠️  Found duplicate keys!');
      console.log(duplicates);
    } else {
      console.log('✅ No duplicate keys found\n');
    }

    // Get total accounts
    const { count } = await supabase
      .from('nlc_accounts')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total accounts in database: ${count}\n`);

    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (!authError) {
      console.log(`👥 Total users in auth.users: ${authUsers.users.length}`);
      console.log('Users:');
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

async function fixDuplicates() {
  console.log('\n🔧 Attempting to fix database...\n');

  try {
    // Delete all records from nlc_accounts (but keep table structure)
    console.log('🗑️  Deleting all records from nlc_accounts...');
    const { error: deleteError } = await supabase
      .from('nlc_accounts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)

    if (deleteError) {
      console.log('❌ Failed to delete:', deleteError.message);
    } else {
      console.log('✅ All records deleted from nlc_accounts\n');
    }

    // Get current user from auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    if (authUsers && authUsers.users.length > 0) {
      console.log('📝 Recreating accounts from auth.users...\n');

      for (const user of authUsers.users) {
        console.log(`   Creating account for ${user.email}...`);

        const { error: insertError } = await supabase
          .from('nlc_accounts')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            account_role: user.email === 'tranminhlong2404@gmail.com' ? 'admin' : 'sinh_vien',
            email_verified: !!user.email_confirmed_at,
          });

        if (insertError) {
          console.log(`   ❌ Failed: ${insertError.message}`);
        } else {
          console.log(`   ✅ Created`);
        }
      }

      console.log('\n✅ Database fixed! Please refresh your browser.\n');
    }

  } catch (err) {
    console.error('💥 Error during fix:', err.message);
  }
}

// Main execution
(async () => {
  console.log('═══════════════════════════════════════════════');
  console.log('   Knowledge Base - Database Diagnostic Tool');
  console.log('═══════════════════════════════════════════════\n');

  await checkAndFixDatabase();

  // Ask user if they want to fix
  const args = process.argv.slice(2);
  if (args.includes('--fix')) {
    await fixDuplicates();
    await checkAndFixDatabase(); // Check again
  } else {
    console.log('💡 To fix the database, run:');
    console.log('   node scripts/check-and-fix-db.js --fix\n');
  }
})();
