const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  // Use a more realistic email
  const email = 'admin.test@gmail.com';
  const password = 'Test@123456';

  console.log('🧪 Testing signup with realistic email...');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'Admin Test'
        }
      }
    });

    if (error) {
      console.log('❌ Signup failed:', error.message);
      console.log('   Status:', error.status);
      console.log('   Code:', error.code);
      console.log('');

      // Try to see if it's because user already exists
      if (error.message.includes('already registered')) {
        console.log('💡 User already exists. Trying to login...\n');

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (loginError) {
          console.log('❌ Login also failed:', loginError.message);
        } else {
          console.log('✅ Login successful!');
          console.log('   User ID:', loginData.user.id);
          console.log('   Email:', loginData.user.email);
          console.log('');
          console.log('🔐 Access Token (copy this):');
          console.log(loginData.session.access_token);
        }
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('');

      if (data.session) {
        console.log('✅ Session created!');
        console.log('   You can login now.');
      } else {
        console.log('⚠️  No session - email confirmation may be required');
        console.log('   Check your email inbox.');
      }
    }
  } catch (err) {
    console.error('💥 Fatal error:', err);
  }
}

testSignup();
