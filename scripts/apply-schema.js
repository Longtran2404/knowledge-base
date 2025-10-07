const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n🔍 Checking existing tables...\n');

  const tables = [
    'nlc_accounts',
    'nlc_courses',
    'nlc_enrollments',
    'nlc_managers',
    'nlc_user_approvals',
    'nlc_notifications',
    'nlc_activity_log',
    'nlc_user_files',
    'nlc_cart_items'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`❌ ${table} - DOES NOT EXIST`);
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table} - EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table} - Error: ${err.message}`);
    }
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)[1]);
  console.log('2. Go to SQL Editor');
  console.log('3. Run the SQL from database/setup.sql');
  console.log('4. Run this script again to verify\n');
}

checkTables().catch(console.error);
