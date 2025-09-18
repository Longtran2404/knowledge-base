#!/usr/bin/env node

/**
 * Database Setup Script for Nam Long Center
 * This script will create all necessary tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...');
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Failed to connect to Supabase:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Create tables
    console.log('📋 Creating database tables...');
    
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
            plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
            is_active BOOLEAN DEFAULT TRUE,
            last_login_at TIMESTAMPTZ,
            login_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_files',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_files (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            file_type TEXT NOT NULL,
            is_public BOOLEAN DEFAULT FALSE,
            download_count INTEGER DEFAULT 0,
            uploaded_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'cart_items',
        sql: `
          CREATE TABLE IF NOT EXISTS public.cart_items (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            item_type TEXT NOT NULL CHECK (item_type IN ('product', 'course')),
            item_id UUID NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS public.products (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'courses',
        sql: `
          CREATE TABLE IF NOT EXISTS public.courses (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_activities',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_activities (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            action_type TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'notifications',
        sql: `
          CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      }
    ];
    
    for (const table of tables) {
      console.log(`📝 Creating table: ${table.name}`);
      
      // Note: We can't execute DDL directly through the client
      // This is a placeholder - you'll need to run these in Supabase Dashboard
      console.log(`   SQL: ${table.sql.trim()}`);
    }
    
    console.log('\n📋 Database setup instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL commands above');
    console.log('4. Or use the provided SQL files in database/ folder');
    
    console.log('\n✅ Database setup script completed!');
    console.log('⚠️  Remember to run the SQL commands in Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();