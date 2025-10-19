const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function checkDatabase() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Check table structure by getting sample record
    const { data: sample, error: sampleError } = await supabase
      .from('nlc_accounts')
      .select('*')
      .limit(1)
      .single();

    if (sample) {
      console.log('✅ Sample record from nlc_accounts:');
      console.log(JSON.stringify(sample, null, 2));
      console.log('\n📊 Fields present:', Object.keys(sample).join(', '));
    } else if (sampleError) {
      console.log('❌ Error fetching sample:', sampleError.message);
    }

    // Check if subscription columns exist
    console.log('\n🔍 Checking for subscription_system columns...');
    const { data: account } = await supabase
      .from('nlc_accounts')
      .select('subscription_plan, subscription_status, subscription_expires_at')
      .limit(1)
      .single();

    if (account) {
      if ('subscription_plan' in account) {
        console.log('✅ Subscription columns exist');
        console.log(`   - subscription_plan: ${account.subscription_plan}`);
        console.log(`   - subscription_status: ${account.subscription_status}`);
      } else {
        console.log('❌ Subscription columns missing');
        console.log('💡 Need to run: add_subscription_system.sql');
      }
    }

  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

checkDatabase();
