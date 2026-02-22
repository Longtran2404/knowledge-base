-- =============================================
-- Migration: Extend nlc_accounts, Add auth_errors and reports
-- Description: id_card, city, ward on nlc_accounts; nlc_auth_errors; nlc_reports
-- =============================================

-- PART 1: Extend nlc_accounts
ALTER TABLE nlc_accounts
  ADD COLUMN IF NOT EXISTS id_card VARCHAR(20),
  ADD COLUMN IF NOT EXISTS city VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ward VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_accounts_id_card ON nlc_accounts(id_card) WHERE id_card IS NOT NULL;

-- PART 1b: nlc_sepay_pending_orders (map invoice -> user_id for IPN)
CREATE TABLE IF NOT EXISTS nlc_sepay_pending_orders (
  order_invoice_number VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sepay_pending_user ON nlc_sepay_pending_orders(user_id);

ALTER TABLE nlc_sepay_pending_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service or API can manage sepay_pending"
  ON nlc_sepay_pending_orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- PART 2: nlc_auth_errors (login/signup failures for debug and report)
CREATE TABLE IF NOT EXISTS nlc_auth_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  error_code VARCHAR(100),
  error_message TEXT,
  ip_or_origin VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_errors_email ON nlc_auth_errors(email);
CREATE INDEX IF NOT EXISTS idx_auth_errors_created ON nlc_auth_errors(created_at);

ALTER TABLE nlc_auth_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can read auth_errors (or service role)
CREATE POLICY "Admins can view auth_errors"
  ON nlc_auth_errors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

-- Allow insert from authenticated and anon (for login/signup failures before auth)
CREATE POLICY "Allow insert auth_errors"
  ON nlc_auth_errors FOR INSERT
  WITH CHECK (true);

-- PART 3: nlc_reports (user reports: payment, content, bug)
CREATE TABLE IF NOT EXISTS nlc_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'bug',
  title VARCHAR(500),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON nlc_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON nlc_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON nlc_reports(type);

ALTER TABLE nlc_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON nlc_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reports"
  ON nlc_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON nlc_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON nlc_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

GRANT SELECT, INSERT ON nlc_auth_errors TO authenticated;
GRANT SELECT, INSERT ON nlc_auth_errors TO anon;
GRANT SELECT, INSERT, UPDATE ON nlc_reports TO authenticated;
