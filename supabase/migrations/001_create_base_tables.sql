  -- =============================================
  -- Migration: Create Base Tables
  -- Date: 2025-10-16
  -- Description: Create foundational tables for the system
  -- =============================================

  -- =============================================
  -- PART 1: Create nlc_accounts Table
  -- =============================================

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
    account_role VARCHAR(50) DEFAULT 'sinh_vien', -- 'sinh_vien', 'giang_vien', 'quan_ly', 'admin'
    account_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    email_verified BOOLEAN DEFAULT false,
    company VARCHAR(255),
    job_title VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON nlc_accounts(user_id);
  CREATE INDEX IF NOT EXISTS idx_accounts_email ON nlc_accounts(email);
  CREATE INDEX IF NOT EXISTS idx_accounts_role ON nlc_accounts(account_role);
  CREATE INDEX IF NOT EXISTS idx_accounts_status ON nlc_accounts(account_status);

  -- Enable RLS
  ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;

  -- RLS Policies for nlc_accounts
  -- Users can view their own account
  CREATE POLICY "Users can view own account"
    ON nlc_accounts FOR SELECT
    USING (user_id = auth.uid());

  -- Users can update their own account
  CREATE POLICY "Users can update own account"
    ON nlc_accounts FOR UPDATE
    USING (user_id = auth.uid());

  -- Admins can view all accounts
  CREATE POLICY "Admins can view all accounts"
    ON nlc_accounts FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE nlc_accounts.user_id = auth.uid()
        AND nlc_accounts.account_role = 'admin'
      )
    );

  -- Admins can update all accounts
  CREATE POLICY "Admins can update all accounts"
    ON nlc_accounts FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE nlc_accounts.user_id = auth.uid()
        AND nlc_accounts.account_role = 'admin'
      )
    );

  -- Allow insert for new registrations (will be handled by trigger)
  CREATE POLICY "Allow insert for new registrations"
    ON nlc_accounts FOR INSERT
    WITH CHECK (true);


  -- =============================================
  -- PART 2: Create Trigger to Auto-Create Account
  -- =============================================

  -- Function to create account when user registers
  CREATE OR REPLACE FUNCTION create_account_for_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO nlc_accounts (
      user_id,
      email,
      full_name,
      avatar_url,
      email_verified,
      account_role
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.email_confirmed_at IS NOT NULL,
      'sinh_vien' -- Default role
    )
    ON CONFLICT (email) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      full_name = COALESCE(EXCLUDED.full_name, nlc_accounts.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, nlc_accounts.avatar_url),
      email_verified = EXCLUDED.email_verified,
      updated_at = NOW();

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_account_for_new_user();


  -- =============================================
  -- PART 3: Create nlc_user_files Table
  -- =============================================

  CREATE TABLE IF NOT EXISTS nlc_user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_category VARCHAR(50), -- 'video', 'audio', 'document', 'image', 'archive', 'other'
    file_extension VARCHAR(20),
    mime_type VARCHAR(100),

    -- Video specific fields
    is_protected BOOLEAN DEFAULT false,
    allow_download BOOLEAN DEFAULT false,
    watermark_text TEXT,
    duration INTEGER, -- in seconds
    resolution VARCHAR(50), -- e.g., '1920x1080'
    bitrate INTEGER,
    codec VARCHAR(50),

    -- Metadata
    destination_page VARCHAR(100), -- 'khoa_hoc', 'tai_nguyen', 'blog', etc.
    description TEXT,
    tags TEXT[],

    -- Statistics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'ready', 'failed'
    is_public BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_user_files_user ON nlc_user_files(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_files_status ON nlc_user_files(status);
  CREATE INDEX IF NOT EXISTS idx_user_files_public ON nlc_user_files(is_public);
  CREATE INDEX IF NOT EXISTS idx_user_files_category ON nlc_user_files(file_category);
  CREATE INDEX IF NOT EXISTS idx_user_files_destination ON nlc_user_files(destination_page);

  -- Enable RLS
  ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;

  -- RLS Policies for nlc_user_files
  -- Users can view their own files
  CREATE POLICY "Users can view own files"
    ON nlc_user_files FOR SELECT
    USING (user_id = auth.uid());

  -- Users can view public files
  CREATE POLICY "Anyone can view public files"
    ON nlc_user_files FOR SELECT
    USING (is_public = true AND status = 'ready');

  -- Users can insert their own files
  CREATE POLICY "Users can insert own files"
    ON nlc_user_files FOR INSERT
    WITH CHECK (user_id = auth.uid());

  -- Users can update their own files
  CREATE POLICY "Users can update own files"
    ON nlc_user_files FOR UPDATE
    USING (user_id = auth.uid());

  -- Users can delete their own files
  CREATE POLICY "Users can delete own files"
    ON nlc_user_files FOR DELETE
    USING (user_id = auth.uid());

  -- Admins can manage all files
  CREATE POLICY "Admins can manage all files"
    ON nlc_user_files FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE nlc_accounts.user_id = auth.uid()
        AND nlc_accounts.account_role = 'admin'
      )
    );


  -- =============================================
  -- PART 4: Create nlc_workflows Table
  -- =============================================

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
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'rejected'
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_workflows_seller ON nlc_workflows(seller_id);
  CREATE INDEX IF NOT EXISTS idx_workflows_status ON nlc_workflows(status);
  CREATE INDEX IF NOT EXISTS idx_workflows_category ON nlc_workflows(workflow_category);
  CREATE INDEX IF NOT EXISTS idx_workflows_featured ON nlc_workflows(is_featured);

  -- Enable RLS
  ALTER TABLE nlc_workflows ENABLE ROW LEVEL SECURITY;

  -- RLS Policies
  CREATE POLICY "Anyone can view approved workflows"
    ON nlc_workflows FOR SELECT
    USING (status = 'approved');

  CREATE POLICY "Users can view own workflows"
    ON nlc_workflows FOR SELECT
    USING (seller_id = auth.uid());

  CREATE POLICY "Users can insert own workflows"
    ON nlc_workflows FOR INSERT
    WITH CHECK (seller_id = auth.uid());

  CREATE POLICY "Users can update own workflows"
    ON nlc_workflows FOR UPDATE
    USING (seller_id = auth.uid());

  CREATE POLICY "Admins can manage all workflows"
    ON nlc_workflows FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE nlc_accounts.user_id = auth.uid()
        AND nlc_accounts.account_role IN ('admin', 'quan_ly')
      )
    );


  -- =============================================
  -- PART 5: Create nlc_workflow_orders Table
  -- =============================================

  CREATE TABLE IF NOT EXISTS nlc_workflow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    workflow_id UUID REFERENCES nlc_workflows(id) ON DELETE SET NULL NOT NULL,
    order_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50), -- 'bank_transfer', 'momo', 'vnpay', etc.
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_workflow_orders_buyer ON nlc_workflow_orders(buyer_id);
  CREATE INDEX IF NOT EXISTS idx_workflow_orders_workflow ON nlc_workflow_orders(workflow_id);
  CREATE INDEX IF NOT EXISTS idx_workflow_orders_status ON nlc_workflow_orders(payment_status);

  -- Enable RLS
  ALTER TABLE nlc_workflow_orders ENABLE ROW LEVEL SECURITY;

  -- RLS Policies
  CREATE POLICY "Users can view own orders"
    ON nlc_workflow_orders FOR SELECT
    USING (buyer_id = auth.uid());

  CREATE POLICY "Users can insert own orders"
    ON nlc_workflow_orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

  CREATE POLICY "Admins can view all orders"
    ON nlc_workflow_orders FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE nlc_accounts.user_id = auth.uid()
        AND nlc_accounts.account_role IN ('admin', 'quan_ly')
      )
    );


  -- =============================================
  -- PART 6: Grant Permissions
  -- =============================================

  GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_accounts TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_user_files TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_workflows TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON nlc_workflow_orders TO authenticated;

  GRANT SELECT ON nlc_workflows TO anon;
  GRANT SELECT ON nlc_user_files TO anon;


  -- =============================================
  -- PART 7: Insert Initial Admin User
  -- =============================================

  -- This will be executed after the trigger creates the account
  -- Update to admin role for tranminhlong2404@gmail.com
  -- Note: User must register first before running this
  UPDATE nlc_accounts
  SET account_role = 'admin', updated_at = NOW()
  WHERE email = 'tranminhlong2404@gmail.com';


  -- =============================================
  -- Migration Complete
  -- =============================================
