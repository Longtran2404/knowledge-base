const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  const email = 'tranminhlong2404@gmail.com';
  const newPassword = 'Admin@123456'; // Mật khẩu mới (đủ mạnh)

  console.log('🔐 Resetting password for:', email);
  console.log('👤 User ID: 3d1daff8-8928-4437-b2a4-ed38882539f2\n');

  try {
    // Get user info first
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      '3d1daff8-8928-4437-b2a4-ed38882539f2'
    );

    if (userError) {
      console.log('❌ Cannot get user:', userError.message);
      return;
    }

    console.log('✅ User found:', userData.user.email);
    console.log('   Confirmed:', userData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Created:', userData.user.created_at);

    // Try to update password
    console.log('\n🔄 Updating password...');
    const { data, error } = await supabase.auth.admin.updateUserById(
      '3d1daff8-8928-4437-b2a4-ed38882539f2',
      {
        password: newPassword,
        email_confirm: true
      }
    );

    if (error) {
      console.log('❌ Error:', error.message);
      console.log('\n💡 Alternative: You can reset password via Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Authentication → Users');
      console.log('   3. Find tranminhlong2404@gmail.com');
      console.log('   4. Click "..." → Send password recovery email');
    } else {
      console.log('✅ Password updated successfully!');
      console.log('\n📝 New Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('\n🌐 Go to: http://localhost:3000');
      console.log('   and login with these credentials.');
    }
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

resetPassword();
