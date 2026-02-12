-- Create missing tables for Knowledge Base database
-- Run this in Supabase SQL Editor

-- 1. Create nlc_accounts table (CRITICAL - fixes 404 error)
CREATE TABLE IF NOT EXISTS nlc_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    account_role TEXT NOT NULL DEFAULT 'sinh_vien' CHECK (account_role IN ('sinh_vien', 'giang_vien', 'quan_ly', 'admin')),
    membership_plan TEXT NOT NULL DEFAULT 'free' CHECK (membership_plan IN ('free', 'basic', 'premium', 'vip', 'business')),
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending_approval')),
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'facebook')),
    last_login_at TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    password_changed_at TIMESTAMPTZ,
    membership_expires_at TIMESTAMPTZ,
    membership_type TEXT CHECK (membership_type IN ('free', 'basic', 'premium', 'vip')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create nlc_user_files table (CRITICAL - fixes upload feature)
CREATE TABLE IF NOT EXISTS nlc_user_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'document',
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    download_count INTEGER NOT NULL DEFAULT 0,
    upload_progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'uploading',
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create nlc_enrollments table
CREATE TABLE IF NOT EXISTS nlc_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_user_id TEXT NOT NULL,
    enrolled_course_id TEXT NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    current_lesson INTEGER NOT NULL DEFAULT 0,
    total_time_spent INTEGER NOT NULL DEFAULT 0,
    enrollment_type TEXT NOT NULL DEFAULT 'free' CHECK (enrollment_type IN ('free', 'paid')),
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_reference TEXT,
    started_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    certificate_issued_at TIMESTAMPTZ,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    student_review TEXT,
    review_helpful_count INTEGER NOT NULL DEFAULT 0,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create nlc_managers table
CREATE TABLE IF NOT EXISTS nlc_managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_user_id TEXT NOT NULL UNIQUE,
    manager_email TEXT NOT NULL,
    manager_full_name TEXT NOT NULL,
    manager_level TEXT NOT NULL DEFAULT 'manager' CHECK (manager_level IN ('manager', 'admin', 'super_admin')),
    manager_permissions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    can_approve_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_courses BOOLEAN NOT NULL DEFAULT FALSE,
    can_access_finances BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create nlc_user_approvals table
CREATE TABLE IF NOT EXISTS nlc_user_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    requested_role TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create nlc_activity_log table
CREATE TABLE IF NOT EXISTS nlc_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nlc_accounts_user ON nlc_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_accounts_email ON nlc_accounts(email);
CREATE INDEX IF NOT EXISTS idx_nlc_accounts_role ON nlc_accounts(account_role);
CREATE INDEX IF NOT EXISTS idx_nlc_accounts_status ON nlc_accounts(account_status);

CREATE INDEX IF NOT EXISTS idx_nlc_user_files_user ON nlc_user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_user_files_type ON nlc_user_files(file_type);
CREATE INDEX IF NOT EXISTS idx_nlc_user_files_public ON nlc_user_files(is_public);
CREATE INDEX IF NOT EXISTS idx_nlc_user_files_status ON nlc_user_files(status);

CREATE INDEX IF NOT EXISTS idx_nlc_enrollments_student ON nlc_enrollments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_enrollments_course ON nlc_enrollments(enrolled_course_id);
CREATE INDEX IF NOT EXISTS idx_nlc_enrollments_completed ON nlc_enrollments(is_completed);

CREATE INDEX IF NOT EXISTS idx_nlc_managers_user ON nlc_managers(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_managers_active ON nlc_managers(is_active);

CREATE INDEX IF NOT EXISTS idx_nlc_approvals_user ON nlc_user_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_approvals_status ON nlc_user_approvals(approval_status);

CREATE INDEX IF NOT EXISTS idx_nlc_activity_user ON nlc_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_nlc_activity_type ON nlc_activity_log(activity_type);

-- Create update timestamp function if not exists
CREATE OR REPLACE FUNCTION nlc_update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS tr_nlc_accounts_update ON nlc_accounts;
CREATE TRIGGER tr_nlc_accounts_update
    BEFORE UPDATE ON nlc_accounts
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

DROP TRIGGER IF EXISTS tr_nlc_user_files_update ON nlc_user_files;
CREATE TRIGGER tr_nlc_user_files_update
    BEFORE UPDATE ON nlc_user_files
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

DROP TRIGGER IF EXISTS tr_nlc_enrollments_update ON nlc_enrollments;
CREATE TRIGGER tr_nlc_enrollments_update
    BEFORE UPDATE ON nlc_enrollments
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

DROP TRIGGER IF EXISTS tr_nlc_managers_update ON nlc_managers;
CREATE TRIGGER tr_nlc_managers_update
    BEFORE UPDATE ON nlc_managers
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

DROP TRIGGER IF EXISTS tr_nlc_approvals_update ON nlc_user_approvals;
CREATE TRIGGER tr_nlc_approvals_update
    BEFORE UPDATE ON nlc_user_approvals
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

-- Enable Row Level Security
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nlc_accounts
DROP POLICY IF EXISTS "Users can view their own account" ON nlc_accounts;
CREATE POLICY "Users can view their own account" ON nlc_accounts
    FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own account" ON nlc_accounts;
CREATE POLICY "Users can update their own account" ON nlc_accounts
    FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all accounts" ON nlc_accounts;
CREATE POLICY "Admins can view all accounts" ON nlc_accounts
    FOR SELECT USING (account_role = 'admin' OR account_role = 'quan_ly');

DROP POLICY IF EXISTS "Users can insert their account" ON nlc_accounts;
CREATE POLICY "Users can insert their account" ON nlc_accounts
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for nlc_user_files
DROP POLICY IF EXISTS "Users can view their own files" ON nlc_user_files;
CREATE POLICY "Users can view their own files" ON nlc_user_files
    FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view public files" ON nlc_user_files;
CREATE POLICY "Anyone can view public files" ON nlc_user_files
    FOR SELECT USING (is_public = TRUE);

DROP POLICY IF EXISTS "Users can upload files" ON nlc_user_files;
CREATE POLICY "Users can upload files" ON nlc_user_files
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their files" ON nlc_user_files;
CREATE POLICY "Users can update their files" ON nlc_user_files
    FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their files" ON nlc_user_files;
CREATE POLICY "Users can delete their files" ON nlc_user_files
    FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies for nlc_enrollments
DROP POLICY IF EXISTS "Users can view their enrollments" ON nlc_enrollments;
CREATE POLICY "Users can view their enrollments" ON nlc_enrollments
    FOR SELECT USING (student_user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can enroll in courses" ON nlc_enrollments;
CREATE POLICY "Users can enroll in courses" ON nlc_enrollments
    FOR INSERT WITH CHECK (student_user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their enrollments" ON nlc_enrollments;
CREATE POLICY "Users can update their enrollments" ON nlc_enrollments
    FOR UPDATE USING (student_user_id = auth.uid()::text);

-- RLS Policies for nlc_managers
DROP POLICY IF EXISTS "Managers can view manager data" ON nlc_managers;
CREATE POLICY "Managers can view manager data" ON nlc_managers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage managers" ON nlc_managers;
CREATE POLICY "Only admins can manage managers" ON nlc_managers
    FOR ALL USING (EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE user_id = auth.uid()::text
        AND account_role = 'admin'
    ));

-- RLS Policies for nlc_user_approvals
DROP POLICY IF EXISTS "Users can view their approvals" ON nlc_user_approvals;
CREATE POLICY "Users can view their approvals" ON nlc_user_approvals
    FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Managers can view all approvals" ON nlc_user_approvals;
CREATE POLICY "Managers can view all approvals" ON nlc_user_approvals
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM nlc_accounts
        WHERE user_id = auth.uid()::text
        AND (account_role = 'admin' OR account_role = 'quan_ly')
    ));

DROP POLICY IF EXISTS "Users can create approval requests" ON nlc_user_approvals;
CREATE POLICY "Users can create approval requests" ON nlc_user_approvals
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for nlc_activity_log
DROP POLICY IF EXISTS "Users can view their activity" ON nlc_activity_log;
CREATE POLICY "Users can view their activity" ON nlc_activity_log
    FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can log activity" ON nlc_activity_log;
CREATE POLICY "Anyone can log activity" ON nlc_activity_log
    FOR INSERT WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All missing tables created successfully!';
    RAISE NOTICE '✅ Indexes created for performance optimization';
    RAISE NOTICE '✅ Triggers enabled for automatic timestamp updates';
    RAISE NOTICE '✅ Row Level Security (RLS) policies applied';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Run: node scripts/apply-schema.js';
    RAISE NOTICE '2. Test the application';
    RAISE NOTICE '3. Check if 404 errors are resolved';
END $$;
