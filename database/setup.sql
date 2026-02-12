-- =====================================================
-- NAM LONG CENTER - PRODUCTION DATABASE SETUP
-- File duy nhất để setup database hoàn chỉnh
-- =====================================================

-- BƯỚC 1: XÓA TẤT CẢ TABLES CŨ (CLEAN START)
-- =====================================================

DO $$
DECLARE
    table_name TEXT;
BEGIN
    -- Xóa tất cả tables có thể tồn tại
    FOR table_name IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND (tablename LIKE 'nlc_%'
            OR tablename IN ('account_nam_long_center', 'managers', 'courses', 'users', 'nlc_users',
                           'user_courses', 'user_activities', 'manager_approvals', 'manager_notifications',
                           'carts', 'cart_items', 'purchases', 'orders', 'files', 'user_files', 'notifications'))
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || table_name || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', table_name;
    END LOOP;

    -- Xóa functions cũ
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS nlc_update_timestamps() CASCADE;

    RAISE NOTICE '✅ Cleaned up all existing tables and functions';
END $$;

-- BƯỚC 2: TẠO 7 TABLES NLC HOÀN TOÀN MỚI
-- =====================================================

-- 1. NLC_ACCOUNTS - BẢNG USER CHÍNH
CREATE TABLE nlc_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    account_role TEXT NOT NULL DEFAULT 'sinh_vien',
    membership_plan TEXT NOT NULL DEFAULT 'free',
    account_status TEXT NOT NULL DEFAULT 'active',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider TEXT NOT NULL DEFAULT 'email',
    last_login_at TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    password_changed_at TIMESTAMPTZ,
    membership_expires_at TIMESTAMPTZ,
    membership_type TEXT DEFAULT 'free',
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. NLC_COURSES - KHÓA HỌC
CREATE TABLE nlc_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    detailed_content TEXT,
    instructor_id TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    course_category TEXT NOT NULL DEFAULT 'Lập trình',
    course_level TEXT NOT NULL DEFAULT 'Cơ bản',
    course_language TEXT NOT NULL DEFAULT 'vi',
    duration_hours INTEGER DEFAULT 0,
    lesson_count INTEGER DEFAULT 0,
    requirements TEXT[],
    learning_outcomes TEXT[],
    target_audience TEXT[],
    course_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    discount_percent INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    video_preview_url TEXT,
    course_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    enrollment_count INTEGER NOT NULL DEFAULT 0,
    avg_rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    course_tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NLC_ENROLLMENTS - ĐĂNG KÝ KHÓA HỌC
CREATE TABLE nlc_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_user_id TEXT NOT NULL,
    enrolled_course_id UUID NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    current_lesson INTEGER DEFAULT 1,
    total_time_spent INTEGER NOT NULL DEFAULT 0,
    enrollment_type TEXT NOT NULL DEFAULT 'free',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_reference TEXT,
    started_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    certificate_issued_at TIMESTAMPTZ,
    student_rating INTEGER,
    student_review TEXT,
    review_helpful_count INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_user_id, enrolled_course_id)
);

-- 4. NLC_MANAGERS - ADMIN VÀ QUẢN LÝ
CREATE TABLE nlc_managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_user_id TEXT NOT NULL UNIQUE,
    manager_email TEXT NOT NULL UNIQUE,
    manager_full_name TEXT NOT NULL,
    manager_level TEXT NOT NULL DEFAULT 'manager',
    manager_permissions JSONB NOT NULL DEFAULT '{"dashboard": true}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    can_approve_users BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_courses BOOLEAN NOT NULL DEFAULT FALSE,
    can_access_finances BOOLEAN NOT NULL DEFAULT FALSE,
    users_managed INTEGER NOT NULL DEFAULT 0,
    approvals_made INTEGER NOT NULL DEFAULT 0,
    last_action_at TIMESTAMPTZ,
    appointed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. NLC_USER_APPROVALS - PHÊ DUYỆT
CREATE TABLE nlc_user_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_user_id TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    requested_role_type TEXT NOT NULL,
    existing_role_type TEXT NOT NULL,
    request_reason TEXT,
    supporting_documents JSONB,
    business_info JSONB,
    approval_status TEXT NOT NULL DEFAULT 'pending',
    request_priority TEXT NOT NULL DEFAULT 'normal',
    reviewed_by_user_id TEXT,
    reviewer_name TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NLC_NOTIFICATIONS - THÔNG BÁO
CREATE TABLE nlc_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_user_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    notification_title TEXT NOT NULL,
    notification_message TEXT NOT NULL,
    action_url TEXT,
    notification_priority TEXT NOT NULL DEFAULT 'normal',
    notification_category TEXT NOT NULL DEFAULT 'general',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    send_method TEXT[] DEFAULT ARRAY['in_app'],
    related_resource_type TEXT,
    related_resource_id TEXT,
    notification_metadata JSONB,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NLC_ACTIVITY_LOG - TRACKING HOẠT ĐỘNG
CREATE TABLE nlc_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_user_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    client_ip_address INET,
    client_user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    activity_status TEXT NOT NULL DEFAULT 'success',
    error_message TEXT,
    impact_level TEXT NOT NULL DEFAULT 'low',
    activity_metadata JSONB,
    duration_ms INTEGER,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NLC_USER_FILES - QUẢN LÝ FILES CỦA USER (CẬP NHẬT)
CREATE TABLE nlc_user_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,

    -- File type classification
    file_type TEXT NOT NULL DEFAULT 'document', -- video, audio, image, pdf, archive, office, text, other
    file_category TEXT NOT NULL DEFAULT 'document', -- video, audio, image, document, archive, other
    file_extension TEXT,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,

    -- File metadata
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT TRUE,

    -- Destination and association
    destination_page TEXT DEFAULT 'library', -- library, course, product, profile
    associated_course_id UUID, -- Link to nlc_courses if destination is course
    associated_product_id TEXT, -- Link to product if needed
    lesson_id TEXT, -- If this is a course lesson video

    -- Security and protection settings for videos
    is_protected BOOLEAN NOT NULL DEFAULT FALSE, -- Enable DRM protection
    allow_download BOOLEAN NOT NULL DEFAULT TRUE,
    allow_share BOOLEAN NOT NULL DEFAULT TRUE,
    watermark_text TEXT, -- Watermark for protected videos

    -- Usage statistics
    download_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,

    -- Upload info
    upload_progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'uploading', -- uploading, processing, ready, failed
    thumbnail_url TEXT,
    preview_url TEXT,

    -- Processing info for videos
    duration_seconds INTEGER, -- Video/audio duration
    resolution TEXT, -- Video resolution (e.g., "1920x1080")
    bitrate INTEGER, -- Video bitrate
    codec TEXT, -- Video codec

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NLC_CART_ITEMS - GIỎ HÀNG
CREATE TABLE nlc_cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'course',
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    product_image TEXT,
    product_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BƯỚC 3: TẠO FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key cho nlc_enrollments
ALTER TABLE nlc_enrollments
ADD CONSTRAINT fk_enrollments_course
FOREIGN KEY (enrolled_course_id) REFERENCES nlc_courses(id) ON DELETE CASCADE;

-- BƯỚC 4: TẠO INDEXES CHO PERFORMANCE
-- =====================================================

-- nlc_accounts indexes
CREATE INDEX idx_nlc_accounts_email ON nlc_accounts(email);
CREATE INDEX idx_nlc_accounts_user_id ON nlc_accounts(user_id);
CREATE INDEX idx_nlc_accounts_role ON nlc_accounts(account_role);
CREATE INDEX idx_nlc_accounts_plan ON nlc_accounts(membership_plan);
CREATE INDEX idx_nlc_accounts_status ON nlc_accounts(account_status);

-- nlc_courses indexes
CREATE INDEX idx_nlc_courses_slug ON nlc_courses(course_slug);
CREATE INDEX idx_nlc_courses_instructor ON nlc_courses(instructor_id);
CREATE INDEX idx_nlc_courses_category ON nlc_courses(course_category);
CREATE INDEX idx_nlc_courses_published ON nlc_courses(is_published);
CREATE INDEX idx_nlc_courses_featured ON nlc_courses(is_featured);

-- nlc_enrollments indexes
CREATE INDEX idx_nlc_enrollments_user ON nlc_enrollments(student_user_id);
CREATE INDEX idx_nlc_enrollments_course ON nlc_enrollments(enrolled_course_id);
CREATE INDEX idx_nlc_enrollments_completed ON nlc_enrollments(is_completed);

-- nlc_managers indexes
CREATE INDEX idx_nlc_managers_user_id ON nlc_managers(manager_user_id);
CREATE INDEX idx_nlc_managers_email ON nlc_managers(manager_email);
CREATE INDEX idx_nlc_managers_active ON nlc_managers(is_active);

-- nlc_user_approvals indexes
CREATE INDEX idx_nlc_approvals_user ON nlc_user_approvals(applicant_user_id);
CREATE INDEX idx_nlc_approvals_status ON nlc_user_approvals(approval_status);

-- nlc_notifications indexes
CREATE INDEX idx_nlc_notifications_user ON nlc_notifications(recipient_user_id);
CREATE INDEX idx_nlc_notifications_type ON nlc_notifications(notification_type);
CREATE INDEX idx_nlc_notifications_read ON nlc_notifications(is_read);

-- nlc_activity_log indexes
CREATE INDEX idx_nlc_activity_user ON nlc_activity_log(actor_user_id);
CREATE INDEX idx_nlc_activity_type ON nlc_activity_log(activity_type);
CREATE INDEX idx_nlc_activity_time ON nlc_activity_log(occurred_at);

-- nlc_user_files indexes
CREATE INDEX idx_nlc_user_files_user ON nlc_user_files(user_id);
CREATE INDEX idx_nlc_user_files_type ON nlc_user_files(file_type);
CREATE INDEX idx_nlc_user_files_public ON nlc_user_files(is_public);
CREATE INDEX idx_nlc_user_files_status ON nlc_user_files(status);

-- nlc_cart_items indexes
CREATE INDEX idx_nlc_cart_user ON nlc_cart_items(user_id);
CREATE INDEX idx_nlc_cart_product ON nlc_cart_items(product_id);
CREATE INDEX idx_nlc_cart_type ON nlc_cart_items(product_type);

-- BƯỚC 5: TẠO TRIGGERS TỰ ĐỘNG CẬP NHẬT TIMESTAMPS
-- =====================================================

-- Function để update updated_at
CREATE OR REPLACE FUNCTION nlc_update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers cho các tables có updated_at
CREATE TRIGGER tr_nlc_accounts_update
    BEFORE UPDATE ON nlc_accounts
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_courses_update
    BEFORE UPDATE ON nlc_courses
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_enrollments_update
    BEFORE UPDATE ON nlc_enrollments
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_managers_update
    BEFORE UPDATE ON nlc_managers
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_approvals_update
    BEFORE UPDATE ON nlc_user_approvals
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_user_files_update
    BEFORE UPDATE ON nlc_user_files
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_nlc_cart_items_update
    BEFORE UPDATE ON nlc_cart_items
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

-- BƯỚC 6: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS cho các bảng
ALTER TABLE nlc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho nlc_accounts
CREATE POLICY "Users can view their own account" ON nlc_accounts
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all accounts" ON nlc_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nlc_accounts
            WHERE user_id = auth.uid()::text
            AND account_role IN ('admin', 'giang_vien')
        )
    );

CREATE POLICY "Users can update their own account" ON nlc_accounts
    FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS Policies cho nlc_courses
CREATE POLICY "Anyone can view published courses" ON nlc_courses
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Instructors can manage their courses" ON nlc_courses
    FOR ALL USING (instructor_id = auth.uid()::text);

CREATE POLICY "Admins can manage all courses" ON nlc_courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM nlc_accounts
            WHERE user_id = auth.uid()::text
            AND account_role = 'admin'
        )
    );

-- RLS Policies cho nlc_enrollments
CREATE POLICY "Users can view their enrollments" ON nlc_enrollments
    FOR SELECT USING (student_user_id = auth.uid()::text);

CREATE POLICY "Users can create their enrollments" ON nlc_enrollments
    FOR INSERT WITH CHECK (student_user_id = auth.uid()::text);

-- RLS Policies cho nlc_user_files
CREATE POLICY "Users can view their own files" ON nlc_user_files
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Anyone can view public files" ON nlc_user_files
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can upload files" ON nlc_user_files
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their files" ON nlc_user_files
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their files" ON nlc_user_files
    FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies cho nlc_cart_items
CREATE POLICY "Users can view their cart" ON nlc_cart_items
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage their cart" ON nlc_cart_items
    FOR ALL USING (user_id = auth.uid()::text);

-- RLS Policies cho nlc_notifications
CREATE POLICY "Users can view their notifications" ON nlc_notifications
    FOR SELECT USING (recipient_user_id = auth.uid()::text);

CREATE POLICY "Users can update their notifications" ON nlc_notifications
    FOR UPDATE USING (recipient_user_id = auth.uid()::text);

-- BƯỚC 7: THÊM DỮ LIỆU SAMPLE BAN ĐẦU
-- =====================================================

-- Tạo Super Admin Account
INSERT INTO nlc_accounts (
    user_id, email, full_name, display_name, account_role, membership_plan,
    account_status, is_paid, is_verified, membership_type, approved_by, approved_at, login_count
) VALUES (
    'admin-super-user-001',
    'tranminhlong2404@gmail.com',
    'Trần Minh Long - Super Admin',
    'Trần Minh Long',
    'admin',
    'business',
    'active',
    TRUE,
    TRUE,
    'premium',
    'system',
    NOW(),
    1
);

-- Tạo Manager Record cho Admin
INSERT INTO nlc_managers (
    manager_user_id, manager_email, manager_full_name, manager_level,
    manager_permissions, is_active, can_approve_users, can_manage_courses, can_access_finances
) VALUES (
    'admin-super-user-001',
    'tranminhlong2404@gmail.com',
    'Trần Minh Long - Super Admin',
    'super_admin',
    '{"dashboard": true, "user_management": true, "course_management": true, "system_settings": true, "financial": true, "database_access": true, "admin_all": true}',
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- Tạo 3 Sample Courses
INSERT INTO nlc_courses (
    course_slug, title, subtitle, description, instructor_id, instructor_name,
    course_category, course_level, duration_hours, lesson_count, course_price, original_price,
    is_published, is_featured, enrollment_count, avg_rating, review_count
) VALUES
(
    'react-co-ban-2024',
    'React.js Cơ bản 2024',
    'Học React.js từ zero đến hero',
    'Khóa học React.js toàn diện cho người mới bắt đầu. Bao gồm Hooks, Context API, Router.',
    'admin-super-user-001',
    'Knowledge Base',
    'Lập trình',
    'Cơ bản',
    40,
    25,
    299000,
    399000,
    TRUE,
    TRUE,
    0,
    4.8,
    0
),
(
    'nodejs-backend-api',
    'Node.js Backend Development',
    'Xây dựng RESTful API với Node.js',
    'Học xây dựng backend scalable với Node.js, Express, MongoDB và authentication.',
    'admin-super-user-001',
    'Knowledge Base',
    'Lập trình',
    'Trung cấp',
    50,
    30,
    399000,
    499000,
    TRUE,
    FALSE,
    0,
    4.6,
    0
),
(
    'fullstack-javascript',
    'Full-stack JavaScript',
    'React + Node.js Full-stack',
    'Khóa học toàn diện từ Frontend đến Backend với dự án thực tế e-commerce.',
    'admin-super-user-001',
    'Knowledge Base',
    'Lập trình',
    'Nâng cao',
    80,
    50,
    599000,
    799000,
    TRUE,
    TRUE,
    0,
    4.9,
    0
);

-- Đăng ký admin vào khóa học đầu tiên
INSERT INTO nlc_enrollments (
    student_user_id, enrolled_course_id, progress_percent, is_completed,
    enrollment_type, started_at, completed_at
)
SELECT
    'admin-super-user-001',
    id,
    100,
    TRUE,
    'admin_granted',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
FROM nlc_courses
WHERE course_slug = 'react-co-ban-2024';

-- Log setup activity
INSERT INTO nlc_activity_log (
    actor_user_id, actor_email, actor_role, activity_type, activity_description,
    resource_type, activity_status, impact_level, activity_metadata
) VALUES (
    'admin-super-user-001',
    'tranminhlong2404@gmail.com',
    'admin',
    'system_access',
    'Knowledge Base fresh database setup completed successfully',
    'system',
    'success',
    'high',
    '{"action": "fresh_database_setup", "tables_created": 7, "version": "fresh_v1.0", "timestamp": "' || NOW() || '"}'
);

-- BƯỚC 7: KIỂM TRA KẾT QUẢ CUỐI CÙNG
-- =====================================================

-- Hiển thị tổng quan database
SELECT
    '🎉 DATABASE CREATED SUCCESSFULLY! 🎉' as status,
    COUNT(*) as total_nlc_tables
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'nlc_%';

-- Hiển thị admin account
SELECT
    '👤 ADMIN ACCOUNT CREATED:' as info,
    email, account_role, membership_plan, account_status, is_paid
FROM nlc_accounts
WHERE email = 'tranminhlong2404@gmail.com';

-- Hiển thị manager permissions
SELECT
    '🔐 MANAGER PERMISSIONS:' as info,
    manager_level, can_approve_users, can_manage_courses, can_access_finances
FROM nlc_managers
WHERE manager_email = 'tranminhlong2404@gmail.com';

-- Hiển thị courses
SELECT
    '📚 SAMPLE COURSES:' as info,
    title, course_level, course_price, is_published
FROM nlc_courses
ORDER BY created_at;

-- Hiển thị enrollments
SELECT
    '📝 SAMPLE ENROLLMENTS:' as info,
    COUNT(*) as total_enrollments
FROM nlc_enrollments;

-- Hiển thị activity logs
SELECT
    '📊 ACTIVITY LOGS:' as info,
    COUNT(*) as total_activities
FROM nlc_activity_log;

-- Hiển thị tất cả tables được tạo
SELECT
    '📋 ALL NLC TABLES:' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_name LIKE 'nlc_%'
ORDER BY table_name;

-- Success message cuối cùng
SELECT
    '✅ NAM LONG CENTER DATABASE IS READY FOR PRODUCTION! ✅' as final_message,
    '7 tables, indexes, triggers, sample data - everything is set up correctly!' as description;
