-- =============================================
-- Migration: Upgrade Admin System & CMS
-- Date: 2025-10-16
-- Description:
-- 1. Set tranminhlong2404@gmail.com as super admin
-- 2. Add payment methods management
-- 3. Add CMS for dynamic content editing
-- =============================================

-- =============================================
-- PART 1: Set Super Admin
-- =============================================

-- Update account role to admin for tranminhlong2404@gmail.com
UPDATE nlc_accounts
SET
  account_role = 'admin',
  updated_at = NOW()
WHERE email = 'tranminhlong2404@gmail.com';

-- If account doesn't exist, create it (you'll need to register first)
-- This is just to ensure the role is set


-- =============================================
-- PART 2: Payment Methods Table
-- =============================================

-- Create payment methods table for personal payment accounts
CREATE TABLE IF NOT EXISTS nlc_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_type VARCHAR(50) NOT NULL, -- 'bank_transfer', 'momo', 'zalopay', 'vnpay', 'paypal'
  method_name VARCHAR(255) NOT NULL, -- Display name
  account_holder VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255), -- For bank transfer
  qr_code_url TEXT, -- URL to QR code image
  instructions TEXT, -- Payment instructions
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON nlc_payment_methods(is_active, display_order);

-- Insert default payment methods
INSERT INTO nlc_payment_methods (method_type, method_name, account_holder, account_number, bank_name, instructions, display_order)
VALUES
  ('bank_transfer', 'Chuyển khoản Ngân hàng', 'TRAN MINH LONG', '0123456789', 'Vietcombank', 'Vui lòng chuyển khoản với nội dung: [MÃ ĐƠN HÀNG] - [TÊN CỦA BẠN]', 1),
  ('momo', 'Ví MoMo', 'TRAN MINH LONG', '0123456789', NULL, 'Quét mã QR hoặc chuyển đến số điện thoại với nội dung: [MÃ ĐƠN HÀNG]', 2)
ON CONFLICT DO NOTHING;


-- =============================================
-- PART 3: Site Content Management (CMS)
-- =============================================

-- Create site content table for dynamic content management
CREATE TABLE IF NOT EXISTS nlc_site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key VARCHAR(100) NOT NULL, -- 'home', 'about', 'contact', 'hero_section', etc.
  section_key VARCHAR(100) NOT NULL, -- 'hero', 'features', 'pricing', 'footer', etc.
  content_key VARCHAR(100) NOT NULL, -- 'title', 'subtitle', 'description', 'button_text', etc.
  content_value TEXT NOT NULL, -- The actual content
  content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'markdown', 'image_url', 'json'
  metadata JSONB, -- Additional metadata (color, size, position, etc.)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_key, section_key, content_key)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_site_content_page ON nlc_site_content(page_key, section_key, is_active);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON nlc_site_content(is_active);

-- Insert default content for Home page
INSERT INTO nlc_site_content (page_key, section_key, content_key, content_value, content_type, display_order)
VALUES
  -- Hero Section
  ('home', 'hero', 'title', 'Chào mừng đến với Nam Long Center', 'text', 1),
  ('home', 'hero', 'subtitle', 'Nền tảng học tập và công nghệ hàng đầu Việt Nam', 'text', 2),
  ('home', 'hero', 'description', 'Khám phá các khóa học chất lượng cao, n8n workflows, và nhiều tài nguyên học tập khác', 'text', 3),
  ('home', 'hero', 'cta_primary_text', 'Khám phá ngay', 'text', 4),
  ('home', 'hero', 'cta_primary_link', '/marketplace', 'text', 5),
  ('home', 'hero', 'cta_secondary_text', 'Xem Workflow Store', 'text', 6),
  ('home', 'hero', 'cta_secondary_link', '/workflows', 'text', 7),

  -- Features Section
  ('home', 'features', 'section_title', 'Tính năng nổi bật', 'text', 1),
  ('home', 'features', 'feature_1_title', 'Khóa học chất lượng', 'text', 2),
  ('home', 'features', 'feature_1_desc', 'Hàng trăm khóa học từ các chuyên gia hàng đầu', 'text', 3),
  ('home', 'features', 'feature_2_title', 'n8n Workflow Store', 'text', 4),
  ('home', 'features', 'feature_2_desc', 'Tự động hóa công việc với n8n workflows có sẵn', 'text', 5),
  ('home', 'features', 'feature_3_title', 'Cộng đồng hỗ trợ', 'text', 6),
  ('home', 'features', 'feature_3_desc', 'Kết nối với hàng nghìn học viên và chuyên gia', 'text', 7),

  -- Contact Section
  ('contact', 'info', 'email', 'tranminhlong2404@gmail.com', 'text', 1),
  ('contact', 'info', 'phone', '0123 456 789', 'text', 2),
  ('contact', 'info', 'address', 'Hà Nội, Việt Nam', 'text', 3),

  -- Footer Section
  ('global', 'footer', 'copyright', '© 2025 Nam Long Center. All rights reserved.', 'text', 1),
  ('global', 'footer', 'company_name', 'Nam Long Center', 'text', 2),
  ('global', 'footer', 'company_description', 'Nền tảng học tập và công nghệ hàng đầu', 'text', 3)
ON CONFLICT (page_key, section_key, content_key) DO NOTHING;


-- =============================================
-- PART 4: Add Audit Log for Admin Actions
-- =============================================

CREATE TABLE IF NOT EXISTS nlc_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  resource_type VARCHAR(100) NOT NULL, -- 'workflow', 'course', 'payment_method', 'site_content', 'user'
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON nlc_admin_audit_log(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON nlc_admin_audit_log(resource_type, resource_id);


-- =============================================
-- PART 5: RLS Policies
-- =============================================

-- Enable RLS on new tables
ALTER TABLE nlc_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Payment Methods Policies
-- Anyone can view active payment methods
CREATE POLICY "Public can view active payment methods"
  ON nlc_payment_methods FOR SELECT
  USING (is_active = true);

-- Only admins can manage payment methods
CREATE POLICY "Admins can manage payment methods"
  ON nlc_payment_methods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

-- Site Content Policies
-- Anyone can view active site content
CREATE POLICY "Public can view active site content"
  ON nlc_site_content FOR SELECT
  USING (is_active = true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
  ON nlc_site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

-- Audit Log Policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON nlc_admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nlc_accounts
      WHERE nlc_accounts.user_id = auth.uid()
      AND nlc_accounts.account_role = 'admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON nlc_admin_audit_log FOR INSERT
  WITH CHECK (true);


-- =============================================
-- PART 6: Create Functions for Audit Logging
-- =============================================

-- Function to automatically log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if user is authenticated and is admin
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO nlc_admin_audit_log (
      admin_user_id,
      action_type,
      resource_type,
      resource_id,
      old_value,
      new_value
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER audit_payment_methods
  AFTER INSERT OR UPDATE OR DELETE ON nlc_payment_methods
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_site_content
  AFTER INSERT OR UPDATE OR DELETE ON nlc_site_content
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();


-- =============================================
-- PART 7: Update nlc_workflow_orders for manual payment
-- =============================================

-- Add columns to track manual payment verification
ALTER TABLE nlc_workflow_orders
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES nlc_payment_methods(id),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_note TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_workflow_orders_payment_method ON nlc_workflow_orders(payment_method_id);


-- =============================================
-- PART 8: Create Functions for Site Content
-- =============================================

-- Function to get site content by page and section
CREATE OR REPLACE FUNCTION get_site_content(
  p_page_key VARCHAR(100),
  p_section_key VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
  content_key VARCHAR(100),
  content_value TEXT,
  content_type VARCHAR(50),
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.content_key,
    sc.content_value,
    sc.content_type,
    sc.metadata
  FROM nlc_site_content sc
  WHERE sc.page_key = p_page_key
    AND (p_section_key IS NULL OR sc.section_key = p_section_key)
    AND sc.is_active = true
  ORDER BY sc.display_order, sc.content_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- PART 9: Grant Permissions
-- =============================================

-- Grant permissions to authenticated users
GRANT SELECT ON nlc_payment_methods TO authenticated;
GRANT SELECT ON nlc_site_content TO authenticated;
GRANT SELECT ON nlc_admin_audit_log TO authenticated;

-- Grant permissions to anon users (for public content)
GRANT SELECT ON nlc_payment_methods TO anon;
GRANT SELECT ON nlc_site_content TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_site_content TO authenticated, anon;


-- =============================================
-- Migration Complete
-- =============================================
