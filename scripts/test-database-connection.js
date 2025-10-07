const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file and ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('nlc_users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const tables = [
      'nlc_users',
      'nlc_membership_plans', 
      'nlc_password_change_requests',
      'nlc_phone_verifications',
      'nlc_saved_payment_methods',
      'nlc_subscriptions'
    ];
    
    console.log('🔍 Checking if tables exist...');
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Table ${table} does not exist or has issues:`, tableError.message);
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table ${table}:`, err.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database setup appears to be working!');
    console.log('You can now test the Account Management features.');
  } else {
    console.log('\n⚠️  Database setup needs attention.');
    console.log('Please run the SQL from database/setup.sql in your Supabase dashboard.');
  }
});
