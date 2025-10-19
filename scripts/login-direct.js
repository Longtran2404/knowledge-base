const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing Supabase Auth...\n');

  // Try to sign up a new user
  const testEmail = 'test@namlongcenter.com';
  const testPassword = 'Test@123456';

  console.log('📝 Creating test user:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (error) {
      console.log('❌ Signup error:', error.message);

      // Try login instead
      console.log('\n🔄 Trying to login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        console.log('❌ Login error:', loginError.message);
        console.log('\n💡 Possible issues:');
        console.log('   1. Email confirmation required');
        console.log('   2. Supabase Auth not configured');
        console.log('   3. User already exists with different password');
      } else {
        console.log('✅ Login successful!');
        console.log('   Session:', loginData.session ? 'Active' : 'None');
        console.log('   User ID:', loginData.user?.id);
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Session:', data.session ? 'Active' : 'None');

      if (!data.session) {
        console.log('\n⚠️  No session created - email confirmation may be required');
      }
    }
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

testLogin();
