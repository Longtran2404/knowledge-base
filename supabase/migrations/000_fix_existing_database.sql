-- =============================================
-- Migration: Fix Existing Database
-- Date: 2025-10-16
-- Description: Clean up and prepare existing database
-- =============================================

-- ⚠️ WARNING: This will DROP and RECREATE tables
-- Make sure you have a backup if you have important data!

-- =============================================
-- PART 1: Drop Existing Tables (in correct order)
-- =============================================

-- Drop triggers first (must do BEFORE dropping tables)
DO $$
BEGIN
  -- Drop trigger on auth.users
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Drop triggers on nlc tables (only if tables exist)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nlc_user_subscriptions') THEN
    DROP TRIGGER IF EXISTS trigger_sync_account_subscription ON nlc_user_subscriptions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nlc_payment_methods') THEN
    DROP TRIGGER IF EXISTS audit_payment_methods ON nlc_payment_methods;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nlc_site_content') THEN
    DROP TRIGGER IF EXISTS audit_site_content ON nlc_site_content;
  END IF;
END $$;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS get_user_subscription(UUID);
DROP FUNCTION IF EXISTS user_has_feature(UUID, VARCHAR);
DROP FUNCTION IF EXISTS upgrade_subscription(UUID, UUID, VARCHAR, DECIMAL);
DROP FUNCTION IF EXISTS get_site_content(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS log_admin_action();
DROP FUNCTION IF EXISTS sync_account_subscription();
DROP FUNCTION IF EXISTS create_account_for_new_user();

-- Drop tables with CASCADE (this will drop all dependent objects)
DROP TABLE IF EXISTS nlc_subscription_payments CASCADE;
DROP TABLE IF EXISTS nlc_user_subscriptions CASCADE;
DROP TABLE IF EXISTS nlc_subscription_plans CASCADE;
DROP TABLE IF EXISTS nlc_admin_audit_log CASCADE;
DROP TABLE IF EXISTS nlc_site_content CASCADE;
DROP TABLE IF EXISTS nlc_payment_methods CASCADE;
DROP TABLE IF EXISTS nlc_workflow_orders CASCADE;
DROP TABLE IF EXISTS nlc_workflows CASCADE;
DROP TABLE IF EXISTS nlc_user_files CASCADE;
DROP TABLE IF EXISTS nlc_accounts CASCADE;


-- =============================================
-- PART 2: Clean up old data from auth.users
-- =============================================

-- This ensures fresh start
-- (Don't delete auth.users, just clean up metadata if needed)


-- =============================================
-- PART 3: You're ready to run migrations now!
-- =============================================

-- After running this script, run these migrations IN ORDER:
-- 1. 001_create_base_tables.sql
-- 2. upgrade_admin_and_cms.sql
-- 3. add_subscription_system.sql
