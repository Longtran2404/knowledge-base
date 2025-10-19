const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://byidgbgvnrfhujprzzge.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyNDEyMCwiZXhwIjoyMDU4MTAwMTIwfQ.bzSL7yQ91iztmvnyVymih7fUH9MOZCMcnCuaXEzqaKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAuthTrigger() {
  console.log('🔧 Fixing Auth Trigger...\n');

  // SQL to recreate trigger
  const fixSQL = `
-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS create_account_for_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION create_account_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nlc_accounts (
    user_id,
    email,
    full_name,
    email_verified,
    account_role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL,
    'sinh_vien'
  )
  ON CONFLICT (email)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating account: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_account_for_new_user();
`;

  console.log('📝 SQL to execute:');
  console.log('─'.repeat(60));
  console.log(fixSQL);
  console.log('─'.repeat(60));
  console.log('');

  console.log('⚠️  IMPORTANT: Copy the SQL above and run it in Supabase SQL Editor');
  console.log('   Dashboard → SQL Editor → New Query → Paste → Run\n');

  // Save to file for easy copy
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'fix_auth_trigger.sql');
  fs.writeFileSync(sqlPath, fixSQL);
  console.log(`✅ SQL saved to: ${sqlPath}`);
  console.log('   You can also run this file directly in SQL Editor\n');
}

fixAuthTrigger();
