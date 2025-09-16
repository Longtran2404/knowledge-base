#!/usr/bin/env node

/**
 * Nam Long Center - Database Connection Test
 * Tests the database connection and verifies tables exist
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://byidgbgvnrfhujprzzge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

async function testDatabase() {
  console.log('🧪 Testing Nam Long Center Database Connection...\n');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test tables
    const tables = [
      'users', 'courses', 'blog_posts', 'user_courses', 'purchases',
      'account_nam_long_center', 'managers', 'manager_approvals', 'manager_notifications'
    ];

    console.log('📊 Testing database tables:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${table} - Error: ${error.message}`);
        } else {
          console.log(`   ✅ ${table} - Working (${data.length} rows)`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} - Exception: ${err.message}`);
      }
    }

    // Test storage bucket
    console.log('\n📁 Testing storage bucket:');
    try {
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .list();

      if (error) {
        console.log(`   ❌ user-avatars - Error: ${error.message}`);
      } else {
        console.log(`   ✅ user-avatars - Working (${data.length} files)`);
      }
    } catch (err) {
      console.log(`   ❌ user-avatars - Exception: ${err.message}`);
    }

    // Test authentication
    console.log('\n🔐 Testing authentication:');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log(`   ⚠️  Auth - Not authenticated (expected): ${error.message}`);
      } else {
        console.log(`   ✅ Auth - Working (user: ${user ? user.email : 'none'})`);
      }
    } catch (err) {
      console.log(`   ❌ Auth - Exception: ${err.message}`);
    }

    console.log('\n🎉 Database test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If tables show errors, run the database setup guide');
    console.log('2. If storage shows errors, create the user-avatars bucket');
    console.log('3. Run: npm start to test the application');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
