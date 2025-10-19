-- Simple RLS Policy Fix
-- Remove complex OR condition, just use auth.uid()

DROP POLICY IF EXISTS "Users can read own account" ON nlc_accounts;
DROP POLICY IF EXISTS "Users can update own account" ON nlc_accounts;

-- Simple policy: Users can read where user_id matches auth.uid()
CREATE POLICY "Users can read own account"
ON nlc_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own account
CREATE POLICY "Users can update own account"
ON nlc_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow INSERT for new users (auth trigger)
DROP POLICY IF EXISTS "Allow insert for auth trigger" ON nlc_accounts;
CREATE POLICY "Allow insert for auth trigger"
ON nlc_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
