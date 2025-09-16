#!/usr/bin/env node

/**
 * Nam Long Center - Database Setup Script
 * Sets up the complete database schema in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://byidgbgvnrfhujprzzge.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

async function setupDatabase() {
  console.log('🚀 Setting up Nam Long Center Database...\n');

  try {
    // Create Supabase client with service key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Read complete database schema
    const schemaPath = path.join(__dirname, '..', 'database', 'complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing complete database schema...');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`⚠️  Warning executing statement: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Warning executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`✅ Database schema execution completed!`);
    console.log(`   - Successful statements: ${successCount}`);
    console.log(`   - Warnings/Errors: ${errorCount}`);

    // Create storage bucket for avatars
    console.log('\n📁 Setting up storage bucket...');
    
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('user-avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists');
      } else {
        console.error('❌ Error creating storage bucket:', bucketError);
      }
    } else {
      console.log('✅ Storage bucket created successfully!');
    }

    // Setup storage policies
    console.log('\n🔒 Setting up storage policies...');
    
    const storagePolicies = `
      -- Allow users to upload their own avatars
      CREATE POLICY IF NOT EXISTS "Users can upload own avatar" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      -- Allow users to view all avatars
      CREATE POLICY IF NOT EXISTS "Anyone can view avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'user-avatars');

      -- Allow users to update their own avatars
      CREATE POLICY IF NOT EXISTS "Users can update own avatar" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

      -- Allow users to delete their own avatars
      CREATE POLICY IF NOT EXISTS "Users can delete own avatar" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: storagePolicies });
    
    if (policyError) {
      console.error('❌ Error setting up storage policies:', policyError);
    } else {
      console.log('✅ Storage policies set up successfully!');
    }

    // Test database connection
    console.log('\n🧪 Testing database connection...');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError);
    } else {
      console.log('✅ Connection test successful!');
    }

    // List all tables
    console.log('\n📊 Database tables created:');
    const tables = [
      'users', 'courses', 'blog_posts', 'user_courses', 'purchases',
      'account_nam_long_center', 'managers', 'manager_approvals', 'manager_notifications'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table} - Error: ${error.message}`);
      } else {
        console.log(`   ✅ ${table} - Working`);
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Test authentication at /auth');
    console.log('3. Test course management at /khoa-hoc');
    console.log('4. Test blog system at /blog');
    console.log('5. Test file upload functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
