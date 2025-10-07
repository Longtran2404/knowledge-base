/**
 * Test Supabase Connection - Direct Test
 * Kiểm tra trực tiếp với Supabase client
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://byidgbgvnrfhujprzzge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

console.log('🔍 Testing Supabase Direct Connection...\n');
console.log('📍 Project URL:', SUPABASE_URL);
console.log('📍 Project ID: byidgbgvnrfhujprzzge\n');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('📡 Test 1: Health Check via Supabase Client');

  try {
    // Test auth health
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Auth error:', error.message);

      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('\n⚠️  NETWORK CONNECTION FAILED');
        console.error('Possible reasons:');
        console.error('1. Supabase project does not exist at this URL');
        console.error('2. Project is still being provisioned (wait 5-10 minutes)');
        console.error('3. Project has been paused - resume from dashboard');
        console.error('4. DNS has not propagated yet for new projects');
        console.error('5. Your network/firewall is blocking the connection\n');

        console.log('🔧 Verification steps:');
        console.log('1. Visit: https://supabase.com/dashboard/projects');
        console.log('2. Check if project "byidgbgvnrfhujprzzge" exists');
        console.log('3. Verify project status is "Active" (not Paused/Provisioning)');
        console.log('4. Copy the exact Project URL from Settings → API');
        return false;
      }
    } else {
      console.log('✅ Supabase client initialized successfully');
      console.log('Session data:', data);
    }

    // Test database connection
    console.log('\n📡 Test 2: Database Query Test');

    // Try a simple query (this will fail if tables don't exist, but will show connection works)
    const { data: tables, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (dbError) {
      // Check if error is because table doesn't exist (that's OK - means connection works)
      if (dbError.message.includes('does not exist') || dbError.code === '42P01') {
        console.log('✅ Database connection successful!');
        console.log('⚠️  Note: "users" table does not exist yet (this is OK)');
        console.log('💡 You need to run database setup to create tables');
        return true;
      } else {
        console.error('❌ Database error:', dbError.message);
        console.error('Code:', dbError.code);
        return false;
      }
    } else {
      console.log('✅ Database query successful!');
      console.log('Result:', tables);
      return true;
    }

  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    console.error('Full error:', err);

    if (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  DNS RESOLUTION FAILED');
      console.error('The domain "byidgbgvnrfhujprzzge.supabase.co" cannot be reached.');
      console.error('\nThis means:');
      console.error('→ The project does NOT exist at this URL');
      console.error('→ OR the project is still being created (wait 5-10 min)');
      console.error('→ OR you have the wrong project reference ID\n');
    }

    return false;
  }
}

// Test with service role key
async function testServiceRole() {
  console.log('\n📡 Test 3: Service Role Key Test');

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Try to list schemas (admin only)
    const { data, error } = await supabaseAdmin
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .limit(5);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('✅ Service role key is valid');
        console.log('⚠️  Note: Some system tables may not be accessible');
        return true;
      }
      console.error('❌ Service role error:', error.message);
      return false;
    } else {
      console.log('✅ Service role key works! Found tables:');
      console.log(data);
      return true;
    }
  } catch (err) {
    console.error('❌ Service role test failed:', err.message);
    return false;
  }
}

// Run all tests
(async () => {
  const connectionOk = await testConnection();

  if (connectionOk) {
    await testServiceRole();

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUPABASE CONNECTION VERIFIED');
    console.log('='.repeat(60));
    console.log('\nYour Supabase project is accessible and ready to use!');
    console.log('\nNext steps:');
    console.log('1. Run database setup: npm run setup:database');
    console.log('2. Create necessary tables (users, courses, etc.)');
    console.log('3. Start the application: npm start\n');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ SUPABASE CONNECTION FAILED');
    console.log('='.repeat(60));
    console.log('\nPlease follow the instructions above to fix the issue.\n');
    process.exit(1);
  }
})();
