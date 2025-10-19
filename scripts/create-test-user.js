const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAdmin() {
  const email = 'admin@namlongcenter.com';
  const password = 'Admin@123456';

  console.log('👤 Creating test admin account...');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('');

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin Test'
      }
    });

    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ User created successfully!');
      console.log('   User ID:', data.user.id);
      console.log('');

      // Set as admin in nlc_accounts
      const { error: updateError } = await supabase
        .from('nlc_accounts')
        .update({ account_role: 'admin' })
        .eq('email', email);

      if (updateError) {
        console.log('⚠️  Could not set admin role:', updateError.message);
        console.log('   But user was created. Set role manually.');
      } else {
        console.log('✅ Set as admin successfully!');
      }

      console.log('');
      console.log('🌐 Login at: http://localhost:3000');
      console.log('   Email:', email);
      console.log('   Password:', password);
    }
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

createTestAdmin();
