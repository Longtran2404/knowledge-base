-- Fix RLS Policies for nlc_accounts
-- This allows users to read their own account data

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own account" ON nlc_accounts;
DROP POLICY IF EXISTS "Users can update own account" ON nlc_accounts;
DROP POLICY IF EXISTS "Service role can do anything" ON nlc_accounts;

-- Enable RLS on nlc_accounts
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own account
CREATE POLICY "Users can read own account"
ON nlc_accounts
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  auth.jwt() ->> 'email' = email
);

-- Policy: Users can update their own account
CREATE POLICY "Users can update own account"
ON nlc_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do anything
CREATE POLICY "Service role full access"
ON nlc_accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also fix nlc_user_files policies
DROP POLICY IF EXISTS "Users can read own files" ON nlc_user_files;
DROP POLICY IF EXISTS "Users can insert own files" ON nlc_user_files;
DROP POLICY IF EXISTS "Users can update own files" ON nlc_user_files;
DROP POLICY IF EXISTS "Users can delete own files" ON nlc_user_files;

ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own files"
ON nlc_user_files
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
ON nlc_user_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
ON nlc_user_files
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
ON nlc_user_files
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
