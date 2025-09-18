const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMissingTables() {
  console.log('🔧 Setting up missing database tables...');
  
  try {
    // Read the user-files schema
    const schemaPath = path.join(__dirname, '..', 'database', 'user-files-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error creating tables:', error);
      return false;
    }
    
    console.log('✅ Successfully created missing tables:');
    console.log('  - user_files');
    console.log('  - user_activities');
    console.log('  - notifications');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    return false;
  }
}

async function testTables() {
  console.log('🧪 Testing table access...');
  
  try {
    // Test user_files table
    const { data: files, error: filesError } = await supabase
      .from('user_files')
      .select('*')
      .limit(1);
    
    if (filesError) {
      console.error('❌ Error accessing user_files:', filesError);
      return false;
    }
    
    console.log('✅ user_files table accessible');
    
    // Test user_activities table
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*')
      .limit(1);
    
    if (activitiesError) {
      console.error('❌ Error accessing user_activities:', activitiesError);
      return false;
    }
    
    console.log('✅ user_activities table accessible');
    
    // Test notifications table
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notificationsError) {
      console.error('❌ Error accessing notifications:', notificationsError);
      return false;
    }
    
    console.log('✅ notifications table accessible');
    
    return true;
  } catch (error) {
    console.error('❌ Error testing tables:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database setup...');
  
  const setupSuccess = await setupMissingTables();
  if (!setupSuccess) {
    console.log('❌ Database setup failed');
    process.exit(1);
  }
  
  const testSuccess = await testTables();
  if (!testSuccess) {
    console.log('❌ Table testing failed');
    process.exit(1);
  }
  
  console.log('🎉 Database setup completed successfully!');
}

main().catch(console.error);
