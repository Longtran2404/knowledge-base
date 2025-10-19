const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAsAdmin() {
  const email = process.argv[2] || 'tranminhlong2404@gmail.com';

  console.log(`🔐 Setting ${email} as admin...\n`);

  try {
    const { data, error } = await supabase
      .from('nlc_accounts')
      .update({ account_role: 'admin' })
      .eq('email', email)
      .select();

    if (error) {
      console.log('❌ Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Success! User is now ADMIN:');
      console.log('   Email:', data[0].email);
      console.log('   Role:', data[0].account_role);
      console.log('   Name:', data[0].full_name);
      console.log('\n🔄 Please refresh your browser to see changes.');
    } else {
      console.log('❌ User not found in database');
      console.log('   Make sure user has signed up first!');
    }
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

setAsAdmin();
