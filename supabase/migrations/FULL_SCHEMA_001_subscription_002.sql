-- =============================================
-- FULL SCHEMA: 001 + add_subscription_system + 002
-- Chạy 1 lần trong Supabase Dashboard > SQL Editor > New query > Paste > Run
-- =============================================

-- ========== 001_create_base_tables ==========
CREATE TABLE IF NOT EXISTS nlc_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(50),
  address TEXT,
  account_role VARCHAR(50) DEFAULT 'sinh_vien',
  account_status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  company VARCHAR(255),
  job_title VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON nlc_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON nlc_accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON nlc_accounts(account_role);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON nlc_accounts(account_status);
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own account" ON nlc_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own account" ON nlc_accounts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all accounts" ON nlc_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM nlc_accounts a2 WHERE a2.user_id = auth.uid() AND a2.account_role = 'admin'));
CREATE POLICY "Admins can update all accounts" ON nlc_accounts FOR UPDATE USING (EXISTS (SELECT 1 FROM nlc_accounts a2 WHERE a2.user_id = auth.uid() AND a2.account_role = 'admin'));
CREATE POLICY "Allow insert for new registrations" ON nlc_accounts FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION create_account_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO nlc_accounts (user_id, email, full_name, avatar_url, email_verified, account_role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url', NEW.email_confirmed_at IS NOT NULL, 'sinh_vien')
  ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, full_name = COALESCE(EXCLUDED.full_name, nlc_accounts.full_name), avatar_url = COALESCE(EXCLUDED.avatar_url, nlc_accounts.avatar_url), email_verified = EXCLUDED.email_verified, updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION create_account_for_new_user();

CREATE TABLE IF NOT EXISTS nlc_user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  file_category VARCHAR(50),
  file_extension VARCHAR(20),
  mime_type VARCHAR(100),
  is_protected BOOLEAN DEFAULT false,
  allow_download BOOLEAN DEFAULT false,
  watermark_text TEXT,
  duration INTEGER,
  resolution VARCHAR(50),
  bitrate INTEGER,
  codec VARCHAR(50),
  destination_page VARCHAR(100),
  description TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_files_user ON nlc_user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_status ON nlc_user_files(status);
CREATE INDEX IF NOT EXISTS idx_user_files_public ON nlc_user_files(is_public);
CREATE INDEX IF NOT EXISTS idx_user_files_category ON nlc_user_files(file_category);
CREATE INDEX IF NOT EXISTS idx_user_files_destination ON nlc_user_files(destination_page);
ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own files" ON nlc_user_files FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can view public files" ON nlc_user_files FOR SELECT USING (is_public = true AND status = 'ready');
CREATE POLICY "Users can insert own files" ON nlc_user_files FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own files" ON nlc_user_files FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own files" ON nlc_user_files FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all files" ON nlc_user_files FOR ALL USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));

CREATE TABLE IF NOT EXISTS nlc_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workflow_name VARCHAR(255) NOT NULL,
  workflow_description TEXT,
  workflow_category VARCHAR(100),
  workflow_json JSONB NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  thumbnail_url TEXT,
  preview_images TEXT[],
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workflows_seller ON nlc_workflows(seller_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON nlc_workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON nlc_workflows(workflow_category);
CREATE INDEX IF NOT EXISTS idx_workflows_featured ON nlc_workflows(is_featured);
ALTER TABLE nlc_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved workflows" ON nlc_workflows FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own workflows" ON nlc_workflows FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "Users can insert own workflows" ON nlc_workflows FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Users can update own workflows" ON nlc_workflows FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Admins can manage all workflows" ON nlc_workflows FOR ALL USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role IN ('admin', 'quan_ly')));

CREATE TABLE IF NOT EXISTS nlc_workflow_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  workflow_id UUID REFERENCES nlc_workflows(id) ON DELETE SET NULL NOT NULL,
  order_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_buyer ON nlc_workflow_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_workflow ON nlc_workflow_orders(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_orders_status ON nlc_workflow_orders(payment_status);
ALTER TABLE nlc_workflow_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON nlc_workflow_orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can insert own orders" ON nlc_workflow_orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON nlc_workflow_orders FOR SELECT USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role IN ('admin', 'quan_ly')));

GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_user_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_workflow_orders TO authenticated;
GRANT SELECT ON nlc_workflows TO anon;
GRANT SELECT ON nlc_user_files TO anon;

UPDATE nlc_accounts SET account_role = 'admin', updated_at = NOW() WHERE email = 'tranminhlong2404@gmail.com';

-- ========== add_subscription_system ==========
CREATE TABLE IF NOT EXISTS nlc_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  billing_period VARCHAR(50) NOT NULL DEFAULT 'monthly',
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO nlc_subscription_plans (plan_name, display_name, description, price, billing_period, features, limits, sort_order)
VALUES ('free', 'Miễn phí', 'Gói cơ bản cho người dùng mới', 0, 'lifetime', '["Truy cập khóa học miễn phí", "Upload tối đa 5 files", "1GB dung lượng", "Hỗ trợ email"]', '{"storage_gb": 1, "max_files": 5, "max_workflows": 0, "support": "email"}', 1),
       ('premium', 'Premium', 'Gói nâng cao cho người dùng chuyên nghiệp', 299000, 'monthly', '["Tất cả khóa học", "Upload không giới hạn", "10GB dung lượng", "Download workflows", "Hỗ trợ ưu tiên", "Không quảng cáo"]', '{"storage_gb": 10, "max_files": -1, "max_workflows": 50, "support": "priority"}', 2),
       ('business', 'Business', 'Gói doanh nghiệp với tính năng cao cấp', 999000, 'monthly', '["Tất cả tính năng Premium", "100GB dung lượng", "Team collaboration", "White label", "API access", "Dedicated support", "Custom workflows"]', '{"storage_gb": 100, "max_files": -1, "max_workflows": -1, "support": "dedicated", "team_members": 10}', 3)
ON CONFLICT (plan_name) DO NOTHING;

INSERT INTO nlc_subscription_plans (plan_name, display_name, description, price, billing_period, features, limits, sort_order)
VALUES ('partner', 'Partner', 'Gói đối tác ưu đãi', 199000, 'monthly', '["Tính năng Premium", "Giá đối tác", "Hỗ trợ ưu tiên"]', '{"storage_gb": 10, "max_files": -1, "max_workflows": 50, "support": "priority"}', 4)
ON CONFLICT (plan_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS nlc_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES nlc_subscription_plans(id) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  amount_paid DECIMAL(10, 2),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_active ON nlc_user_subscriptions(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON nlc_user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON nlc_user_subscriptions(expires_at) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS nlc_subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES nlc_user_subscriptions(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES nlc_subscription_plans(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
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
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user ON nlc_subscription_payments(user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON nlc_subscription_payments(payment_status);

ALTER TABLE nlc_accounts ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free', ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE, ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
UPDATE nlc_accounts SET subscription_plan = 'free', subscription_status = 'active' WHERE subscription_plan IS NULL OR subscription_plan = '';

CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (subscription_id UUID, plan_name VARCHAR, display_name VARCHAR, status VARCHAR, expires_at TIMESTAMP WITH TIME ZONE, features JSONB, limits JSONB) AS $$
BEGIN
  RETURN QUERY SELECT s.id, p.plan_name, p.display_name, s.status, s.expires_at, p.features, p.limits
  FROM nlc_user_subscriptions s JOIN nlc_subscription_plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id AND s.status = 'active' ORDER BY s.created_at DESC LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_feature(p_user_id UUID, p_feature VARCHAR) RETURNS BOOLEAN AS $$
DECLARE v_features JSONB;
BEGIN
  SELECT features INTO v_features FROM nlc_user_subscriptions s JOIN nlc_subscription_plans p ON s.plan_id = p.id WHERE s.user_id = p_user_id AND s.status = 'active' LIMIT 1;
  RETURN v_features IS NOT NULL AND v_features ? p_feature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upgrade_subscription(p_user_id UUID, p_new_plan_id UUID, p_payment_method VARCHAR, p_amount DECIMAL)
RETURNS UUID AS $$
DECLARE v_subscription_id UUID; v_payment_id UUID; v_plan_period VARCHAR; v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT billing_period INTO v_plan_period FROM nlc_subscription_plans WHERE id = p_new_plan_id;
  v_expires_at := CASE WHEN v_plan_period = 'monthly' THEN NOW() + INTERVAL '30 days' WHEN v_plan_period = 'yearly' THEN NOW() + INTERVAL '365 days' ELSE NULL END;
  UPDATE nlc_user_subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE user_id = p_user_id AND status = 'active';
  INSERT INTO nlc_user_subscriptions (user_id, plan_id, status, started_at, expires_at) VALUES (p_user_id, p_new_plan_id, 'pending', NOW(), v_expires_at) RETURNING id INTO v_subscription_id;
  INSERT INTO nlc_subscription_payments (subscription_id, user_id, plan_id, amount, payment_method, payment_status) VALUES (v_subscription_id, p_user_id, p_new_plan_id, p_amount, p_payment_method, 'pending');
  UPDATE nlc_accounts SET subscription_status = 'pending', subscription_expires_at = v_expires_at, updated_at = NOW() WHERE user_id = p_user_id;
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_account_subscription() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE nlc_accounts a SET subscription_plan = p.plan_name, subscription_status = NEW.status, subscription_expires_at = NEW.expires_at, updated_at = NOW()
    FROM nlc_subscription_plans p WHERE a.user_id = NEW.user_id AND p.id = NEW.plan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_sync_account_subscription ON nlc_user_subscriptions;
CREATE TRIGGER trigger_sync_account_subscription AFTER INSERT OR UPDATE ON nlc_user_subscriptions FOR EACH ROW EXECUTE FUNCTION sync_account_subscription();

ALTER TABLE nlc_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active plans" ON nlc_subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own subscriptions" ON nlc_user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON nlc_user_subscriptions FOR ALL USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));
CREATE POLICY "Users can view own payments" ON nlc_subscription_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payments" ON nlc_subscription_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all payments" ON nlc_subscription_payments FOR ALL USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));

GRANT SELECT ON nlc_subscription_plans TO authenticated, anon;
GRANT SELECT ON nlc_user_subscriptions TO authenticated;
GRANT SELECT, INSERT ON nlc_subscription_payments TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_feature TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_subscription TO authenticated;

-- ========== 002_extend_accounts_and_reports ==========
ALTER TABLE nlc_accounts ADD COLUMN IF NOT EXISTS id_card VARCHAR(20), ADD COLUMN IF NOT EXISTS city VARCHAR(255), ADD COLUMN IF NOT EXISTS ward VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_accounts_id_card ON nlc_accounts(id_card) WHERE id_card IS NOT NULL;

CREATE TABLE IF NOT EXISTS nlc_sepay_pending_orders (
  order_invoice_number VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sepay_pending_user ON nlc_sepay_pending_orders(user_id);
ALTER TABLE nlc_sepay_pending_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service or API can manage sepay_pending" ON nlc_sepay_pending_orders FOR ALL USING (true) WITH CHECK (true);

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
CREATE POLICY "Admins can view auth_errors" ON nlc_auth_errors FOR SELECT USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));
CREATE POLICY "Allow insert auth_errors" ON nlc_auth_errors FOR INSERT WITH CHECK (true);

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
CREATE POLICY "Users can view own reports" ON nlc_reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own reports" ON nlc_reports FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all reports" ON nlc_reports FOR SELECT USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));
CREATE POLICY "Admins can update reports" ON nlc_reports FOR UPDATE USING (EXISTS (SELECT 1 FROM nlc_accounts WHERE nlc_accounts.user_id = auth.uid() AND nlc_accounts.account_role = 'admin'));

GRANT SELECT, INSERT ON nlc_auth_errors TO authenticated;
GRANT SELECT, INSERT ON nlc_auth_errors TO anon;
GRANT SELECT, INSERT, UPDATE ON nlc_reports TO authenticated;
