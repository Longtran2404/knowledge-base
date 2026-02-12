/**
 * Setup Database - Chạy file database.sql duy nhất
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Knowledge Base Database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Reading setup.sql...');
    console.log(`File size: ${sqlContent.length} characters`);
    
    console.log('');
    console.log('⚠️  IMPORTANT: This script cannot execute SQL directly.');
    console.log('📋 Please follow these steps:');
    console.log('');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy the content from database/setup.sql');
    console.log('4. Paste and run the SQL');
    console.log('');
    console.log('✅ This will create all tables and fix the 406/400 errors');
    console.log('');
    console.log('📊 Database will include:');
    console.log('   - nlc_users table');
    console.log('   - nlc_file_uploads table');
    console.log('   - nlc_cart_items table');
    console.log('   - nlc_products table');
    console.log('   - nlc_courses table');
    console.log('   - nlc_membership_plans table');
    console.log('   - nlc_payment_transactions table');
    console.log('   - nlc_notifications table');
    console.log('');
    console.log('🔧 After running SQL:');
    console.log('1. Test your application');
    console.log('2. Check if 406/400 errors are resolved');
    console.log('3. Enable Supabase calls in services');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();