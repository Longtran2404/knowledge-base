-- Fix Infinite Recursion in RLS Policies
-- Drop ALL existing policies and recreate clean ones

-- Disable RLS temporarily
ALTER TABLE nlc_accounts DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'nlc_accounts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON nlc_accounts', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "enable_read_own_account"
ON nlc_accounts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "enable_insert_own_account"
ON nlc_accounts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "enable_update_own_account"
ON nlc_accounts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role has full access
CREATE POLICY "service_role_all"
ON nlc_accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Same for nlc_user_files
ALTER TABLE nlc_user_files DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'nlc_user_files'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON nlc_user_files', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable_read_own_files"
ON nlc_user_files
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "enable_insert_own_files"
ON nlc_user_files
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "enable_update_own_files"
ON nlc_user_files
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "enable_delete_own_files"
ON nlc_user_files
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
