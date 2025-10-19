-- =============================================
-- Migration: Add Subscription & Account Upgrade System
-- Date: 2025-10-16
-- Description: Premium membership system with tiered plans
-- =============================================

-- =============================================
-- PART 1: Subscription Plans Table
-- =============================================

CREATE TABLE IF NOT EXISTS nlc_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(100) NOT NULL UNIQUE, -- 'free', 'premium', 'business'
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  billing_period VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
  features JSONB NOT NULL DEFAULT '[]', -- Array of feature strings
  limits JSONB NOT NULL DEFAULT '{}', -- { storage_gb: 10, users: 1, etc }
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO nlc_subscription_plans (plan_name, display_name, description, price, billing_period, features, limits, sort_order)
VALUES
  (
    'free',
    'Miễn phí',
    'Gói cơ bản cho người dùng mới',
    0,
    'lifetime',
    '["Truy cập khóa học miễn phí", "Upload tối đa 5 files", "1GB dung lượng", "Hỗ trợ email"]',
    '{"storage_gb": 1, "max_files": 5, "max_workflows": 0, "support": "email"}',
    1
  ),
  (
    'premium',
    'Premium',
    'Gói nâng cao cho người dùng chuyên nghiệp',
    299000,
    'monthly',
    '["Tất cả khóa học", "Upload không giới hạn", "10GB dung lượng", "Download workflows", "Hỗ trợ ưu tiên", "Không quảng cáo"]',
    '{"storage_gb": 10, "max_files": -1, "max_workflows": 50, "support": "priority"}',
    2
  ),
  (
    'business',
    'Business',
    'Gói doanh nghiệp với tính năng cao cấp',
    999000,
    'monthly',
    '["Tất cả tính năng Premium", "100GB dung lượng", "Team collaboration", "White label", "API access", "Dedicated support", "Custom workflows"]',
    '{"storage_gb": 100, "max_files": -1, "max_workflows": -1, "support": "dedicated", "team_members": 10}',
    3
  )
ON CONFLICT (plan_name) DO NOTHING;


-- =============================================
-- PART 2: User Subscriptions Table
-- =============================================

CREATE TABLE IF NOT EXISTS nlc_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES nlc_subscription_plans(id) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'pending'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method VARCHAR(50), -- 'bank_transfer', 'momo', 'zalopay', etc
  transaction_id VARCHAR(255),
  amount_paid DECIMAL(10, 2),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, status) -- User can only have one active subscription
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON nlc_user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON nlc_user_subscriptions(expires_at) WHERE status = 'active';

-- Insert free plan for existing users
INSERT INTO nlc_user_subscriptions (user_id, plan_id, status, started_at)
SELECT
  u.id,
  p.id,
  'active',
  NOW()
FROM auth.users u
CROSS JOIN nlc_subscription_plans p
WHERE p.plan_name = 'free'
AND NOT EXISTS (
  SELECT 1 FROM nlc_user_subscriptions s
  WHERE s.user_id = u.id
  AND s.status = 'active'
)
ON CONFLICT DO NOTHING;


-- =============================================
-- PART 3: Subscription Payments Table
-- =============================================

CREATE TABLE IF NOT EXISTS nlc_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES nlc_user_subscriptions(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES nlc_subscription_plans(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id VARCHAR(255),
  payment_proof_url TEXT,
  payment_note TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user ON nlc_subscription_payments(user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON nlc_subscription_payments(payment_status);


-- =============================================
-- PART 4: Update nlc_accounts with subscription info
-- =============================================

ALTER TABLE nlc_accounts
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Update existing accounts
UPDATE nlc_accounts
SET subscription_plan = 'free', subscription_status = 'active'
WHERE subscription_plan IS NULL OR subscription_plan = '';


-- =============================================
-- PART 5: Functions
-- =============================================

-- Function to get active subscription for user
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name VARCHAR,
  display_name VARCHAR,
  status VARCHAR,
  expires_at TIMESTAMP WITH TIME ZONE,
  features JSONB,
  limits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    p.plan_name,
    p.display_name,
    s.status,
    s.expires_at,
    p.features,
    p.limits
  FROM nlc_user_subscriptions s
  JOIN nlc_subscription_plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has feature
CREATE OR REPLACE FUNCTION user_has_feature(p_user_id UUID, p_feature VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_features JSONB;
BEGIN
  SELECT features INTO v_features
  FROM nlc_user_subscriptions s
  JOIN nlc_subscription_plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  LIMIT 1;

  IF v_features IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_features ? p_feature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade subscription
CREATE OR REPLACE FUNCTION upgrade_subscription(
  p_user_id UUID,
  p_new_plan_id UUID,
  p_payment_method VARCHAR,
  p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_payment_id UUID;
  v_plan_period VARCHAR;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get plan period
  SELECT billing_period INTO v_plan_period
  FROM nlc_subscription_plans
  WHERE id = p_new_plan_id;

  -- Calculate expiry date
  IF v_plan_period = 'monthly' THEN
    v_expires_at := NOW() + INTERVAL '30 days';
  ELSIF v_plan_period = 'yearly' THEN
    v_expires_at := NOW() + INTERVAL '365 days';
  ELSE
    v_expires_at := NULL; -- lifetime
  END IF;

  -- Cancel existing active subscription
  UPDATE nlc_user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';

  -- Create new subscription
  INSERT INTO nlc_user_subscriptions (user_id, plan_id, status, started_at, expires_at)
  VALUES (p_user_id, p_new_plan_id, 'pending', NOW(), v_expires_at)
  RETURNING id INTO v_subscription_id;

  -- Create payment record
  INSERT INTO nlc_subscription_payments (
    subscription_id, user_id, plan_id, amount, payment_method, payment_status
  )
  VALUES (
    v_subscription_id, p_user_id, p_new_plan_id, p_amount, p_payment_method, 'pending'
  )
  RETURNING id INTO v_payment_id;

  -- Update nlc_accounts
  UPDATE nlc_accounts
  SET
    subscription_status = 'pending',
    subscription_expires_at = v_expires_at,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- PART 6: Triggers
-- =============================================

-- Auto-update nlc_accounts when subscription changes
CREATE OR REPLACE FUNCTION sync_account_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE nlc_accounts a
    SET
      subscription_plan = p.plan_name,
      subscription_status = NEW.status,
      subscription_expires_at = NEW.expires_at,
      updated_at = NOW()
    FROM nlc_subscription_plans p
    WHERE a.user_id = NEW.user_id
    AND p.id = NEW.plan_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_account_subscription ON nlc_user_subscriptions;
CREATE TRIGGER trigger_sync_account_subscription
  AFTER INSERT OR UPDATE ON nlc_user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_account_subscription();


-- =============================================
-- PART 7: RLS Policies
-- =============================================

-- Enable RLS
ALTER TABLE nlc_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public can view active plans
CREATE POLICY "Public can view active plans"
  ON nlc_subscription_plans FOR SELECT
  USING (is_active = true);

-- User Subscriptions: Users can view their own
CREATE POLICY "Users can view own subscriptions"
  ON nlc_user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all subscriptions"
  ON nlc_user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

-- Subscription Payments: Users can view their own
CREATE POLICY "Users can view own payments"
  ON nlc_subscription_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own payments
CREATE POLICY "Users can create own payments"
  ON nlc_subscription_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
  ON nlc_subscription_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );


-- =============================================
-- PART 8: Grant Permissions
-- =============================================

GRANT SELECT ON nlc_subscription_plans TO authenticated, anon;
GRANT SELECT ON nlc_user_subscriptions TO authenticated;
GRANT SELECT, INSERT ON nlc_subscription_payments TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_feature TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_subscription TO authenticated;


-- =============================================
-- Migration Complete
-- =============================================
