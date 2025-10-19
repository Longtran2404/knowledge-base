-- Fix Subscription System Relationships
-- Add proper foreign keys and fix queries

-- First, check if nlc_subscription_payments table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nlc_subscription_payments') THEN
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
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, plan_id, status)
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
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'refunded')),
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
        CREATE INDEX IF NOT EXISTS idx_payments_status ON nlc_subscription_payments(status);
        CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON nlc_subscription_payments(plan_id);

        -- RLS Policies for subscriptions
        ALTER TABLE nlc_subscription_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE nlc_user_subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE nlc_subscription_payments ENABLE ROW LEVEL SECURITY;

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

        RAISE NOTICE 'Subscription tables created successfully';
    ELSE
        RAISE NOTICE 'Subscription tables already exist';
    END IF;
END $$;

-- Add payment methods table
CREATE TABLE IF NOT EXISTS nlc_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    account_number VARCHAR(255),
    account_name VARCHAR(255),
    bank_name VARCHAR(255),
    qr_code_url TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO nlc_payment_methods (method_name, account_number, account_name, bank_name, instructions) VALUES
('bank_transfer', '1234567890', 'TRAN MINH LONG', 'Vietcombank', 'Vui lòng chuyển khoản và gửi ảnh xác nhận'),
('momo', '0123456789', 'Trần Minh Long', 'MoMo', 'Quét mã QR hoặc chuyển đến số điện thoại'),
('zalopay', '0123456789', 'Trần Minh Long', 'ZaloPay', 'Quét mã QR hoặc chuyển đến số điện thoại')
ON CONFLICT (method_name) DO NOTHING;

-- RLS for payment methods
ALTER TABLE nlc_payment_methods ENABLE ROW LEVEL SECURITY;
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
