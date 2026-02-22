-- =============================================
-- Chạy trong Supabase Dashboard > SQL Editor
-- Copy toàn bộ file > New query > Paste > Run
-- Idempotent: chạy nhiều lần không lỗi
--
-- CHỈ TẠO/SỬA: trigger đăng ký (nlc_accounts) + cột thiếu + policy INSERT.
-- CÁC BẢNG KHÁC (nlc_user_files, nlc_workflows, nlc_auth_errors, nlc_reports,
-- nlc_sepay_pending_orders, nlc_cart_items, nlc_workflow_orders, nlc_user_subscriptions,
-- nlc_subscription_plans, nlc_subscription_payments, ...):
--   Chạy file supabase/migrations/FULL_SCHEMA_001_subscription_002.sql trong SQL Editor
--   (copy toàn bộ file đó > New query > Paste > Run). Sau đó có thể chạy tiếp
--   supabase/migrations/002_extend_accounts_and_reports.sql nếu cần nlc_auth_errors, nlc_reports.
-- =============================================

-- Bước 1: Đảm bảo nlc_accounts có đủ cột mà trigger cần (nếu bảng đã tạo từ script khác)
ALTER TABLE public.nlc_accounts
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_role VARCHAR(50) DEFAULT 'sinh_vien',
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ward VARCHAR(255),
  ADD COLUMN IF NOT EXISTS id_card VARCHAR(20),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Bước 2: Policy INSERT để trigger (hoặc client) có thể insert
DROP POLICY IF EXISTS "Allow insert for new registrations" ON public.nlc_accounts;
CREATE POLICY "Allow insert for new registrations" ON public.nlc_accounts FOR INSERT WITH CHECK (true);

-- Bước 3: Function + trigger trên auth.users
-- Chỉ tạo/cập nhật nlc_accounts khi email đã xác thực (email_confirmed_at IS NOT NULL).
-- Profile (phone, birth_date, gender, address, city, ward, id_card) lấy từ raw_user_meta_data.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_account_for_new_user();

CREATE OR REPLACE FUNCTION create_account_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.nlc_accounts (
    user_id,
    email,
    full_name,
    avatar_url,
    email_verified,
    account_role,
    phone,
    birth_date,
    gender,
    address,
    city,
    ward,
    id_card
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    true,
    'sinh_vien',
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'birth_date')::date,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'ward',
    NEW.raw_user_meta_data->>'id_card'
  )
  ON CONFLICT (email)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = COALESCE(EXCLUDED.full_name, nlc_accounts.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, nlc_accounts.avatar_url),
    email_verified = EXCLUDED.email_verified,
    phone = COALESCE(EXCLUDED.phone, nlc_accounts.phone),
    birth_date = COALESCE(EXCLUDED.birth_date, nlc_accounts.birth_date),
    gender = COALESCE(EXCLUDED.gender, nlc_accounts.gender),
    address = COALESCE(EXCLUDED.address, nlc_accounts.address),
    city = COALESCE(EXCLUDED.city, nlc_accounts.city),
    ward = COALESCE(EXCLUDED.ward, nlc_accounts.ward),
    id_card = COALESCE(EXCLUDED.id_card, nlc_accounts.id_card),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating account: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_account_for_new_user();
