-- Fix Subscription System - Final Version
-- Handle existing tables properly

-- Create nlc_subscription_plans table
CREATE TABLE IF NOT EXISTS nlc_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL DEFAULT 30,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO nlc_subscription_plans (plan_name, display_name, description, price, duration_days, features) VALUES
('free', 'Miễn phí', 'Gói cơ bản miễn phí', 0, 365, '["Truy cập nội dung cơ bản", "Hỗ trợ cộng đồng"]'::jsonb),
('premium', 'Premium', 'Gói Premium cho sinh viên', 299000, 30, '["Truy cập toàn bộ khóa học", "Tải tài liệu", "Hỗ trợ ưu tiên"]'::jsonb),
('business', 'Business', 'Gói doanh nghiệp', 999000, 30, '["Tất cả tính năng Premium", "API access", "Dedicated support", "Custom workflows"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- Create nlc_user_subscriptions table
CREATE TABLE IF NOT EXISTS nlc_user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES nlc_subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nlc_subscription_payments table
CREATE TABLE IF NOT EXISTS nlc_subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES nlc_subscription_plans(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES nlc_user_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    payment_method VARCHAR(100),
    payment_proof_url TEXT,
    transaction_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected', 'refunded')),
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON nlc_user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON nlc_user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON nlc_subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON nlc_subscription_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON nlc_subscription_payments(plan_id);

-- RLS Policies for subscriptions
ALTER TABLE nlc_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist
DROP POLICY IF EXISTS "plans_public_read" ON nlc_subscription_plans;
DROP POLICY IF EXISTS "subscriptions_user_read" ON nlc_user_subscriptions;
DROP POLICY IF EXISTS "payments_user_read" ON nlc_subscription_payments;
DROP POLICY IF EXISTS "payments_user_insert" ON nlc_subscription_payments;
DROP POLICY IF EXISTS "plans_service_all" ON nlc_subscription_plans;
DROP POLICY IF EXISTS "subscriptions_service_all" ON nlc_user_subscriptions;
DROP POLICY IF EXISTS "payments_service_all" ON nlc_subscription_payments;

-- Everyone can view plans
CREATE POLICY "plans_public_read" ON nlc_subscription_plans FOR SELECT USING (true);

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_user_read" ON nlc_user_subscriptions
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can view their own payments
CREATE POLICY "payments_user_read" ON nlc_subscription_payments
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can insert their own payments
CREATE POLICY "payments_user_insert" ON nlc_subscription_payments
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Service role full access
CREATE POLICY "plans_service_all" ON nlc_subscription_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "subscriptions_service_all" ON nlc_user_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "payments_service_all" ON nlc_subscription_payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix nlc_payment_methods table - check columns first
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nlc_payment_methods' AND column_name = 'account_holder') THEN
        ALTER TABLE nlc_payment_methods ADD COLUMN account_holder VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nlc_payment_methods' AND column_name = 'provider_name') THEN
        ALTER TABLE nlc_payment_methods ADD COLUMN provider_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nlc_payment_methods' AND column_name = 'instructions') THEN
        ALTER TABLE nlc_payment_methods ADD COLUMN instructions TEXT;
    END IF;
END $$;

-- Update existing payment methods
UPDATE nlc_payment_methods SET
    account_holder = 'TRAN MINH LONG',
    provider_name = 'Vietcombank',
    instructions = 'Vui lòng chuyển khoản và gửi ảnh xác nhận'
WHERE method_name = 'bank_transfer';

UPDATE nlc_payment_methods SET
    account_holder = 'Trần Minh Long',
    provider_name = 'MoMo',
    instructions = 'Quét mã QR hoặc chuyển đến số điện thoại'
WHERE method_name = 'momo';

UPDATE nlc_payment_methods SET
    account_holder = 'Trần Minh Long',
    provider_name = 'ZaloPay',
    instructions = 'Quét mã QR hoặc chuyển đến số điện thoại'
WHERE method_name = 'zalopay';

-- RLS for payment methods
ALTER TABLE nlc_payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_methods_public_read" ON nlc_payment_methods;
DROP POLICY IF EXISTS "payment_methods_service_all" ON nlc_payment_methods;

CREATE POLICY "payment_methods_public_read" ON nlc_payment_methods FOR SELECT USING (is_active = true);
CREATE POLICY "payment_methods_service_all" ON nlc_payment_methods FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create trigger to sync subscription with account
CREATE OR REPLACE FUNCTION sync_account_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Update nlc_accounts subscription info when user_subscriptions changes
    UPDATE nlc_accounts
    SET
        subscription_plan = (SELECT plan_name FROM nlc_subscription_plans WHERE id = NEW.plan_id),
        subscription_expires_at = NEW.expires_at,
        subscription_status = NEW.status,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_account_subscription ON nlc_user_subscriptions;
CREATE TRIGGER trigger_sync_account_subscription
AFTER INSERT OR UPDATE ON nlc_user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_account_subscription();
