-- =====================================================
-- WORKFLOW MARKETPLACE DATABASE SCHEMA
-- n8n Workflow Marketplace với thanh toán QR Code
-- =====================================================

-- BẢNG 1: NLC_WORKFLOWS - Lưu trữ workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS nlc_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Thông tin workflow
    workflow_name TEXT NOT NULL,
    workflow_slug TEXT UNIQUE NOT NULL,
    workflow_description TEXT NOT NULL,
    workflow_category TEXT NOT NULL DEFAULT 'Automation',
    workflow_thumbnail TEXT,
    workflow_preview_images TEXT[], -- Array ảnh preview

    -- Files
    workflow_file_url TEXT NOT NULL, -- n8n JSON file URL
    workflow_file_size BIGINT DEFAULT 0, -- bytes
    documentation_files JSONB DEFAULT '[]', -- [{name, url, type, size}]

    -- Creator info
    creator_id TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    creator_email TEXT NOT NULL,
    creator_type TEXT NOT NULL DEFAULT 'admin', -- admin, partner, instructor

    -- Pricing
    workflow_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    discount_percent INTEGER DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,

    -- Status & visibility
    workflow_status TEXT NOT NULL DEFAULT 'draft', -- draft, pending, published, rejected
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Stats
    download_count INTEGER NOT NULL DEFAULT 0,
    purchase_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    avg_rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_level TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    node_count INTEGER DEFAULT 0,
    estimated_setup_time TEXT, -- "30 minutes", "1-2 hours"
    requirements TEXT[], -- ["n8n version 1.0+", "Webhook URL", etc]
    use_cases TEXT[], -- Array use cases

    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],

    -- Admin notes
    rejection_reason TEXT,
    admin_notes TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BẢNG 2: NLC_WORKFLOW_ORDERS - Đơn hàng workflow
-- =====================================================
CREATE TABLE IF NOT EXISTS nlc_workflow_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Order info
    order_code TEXT UNIQUE NOT NULL, -- WF-20241015-ABC123

    -- Buyer info
    buyer_user_id TEXT,
    buyer_email TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT,
    buyer_notes TEXT,

    -- Workflow info
    workflow_id UUID NOT NULL REFERENCES nlc_workflows(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_price DECIMAL(10,2) NOT NULL,

    -- Payment info
    payment_method TEXT NOT NULL DEFAULT 'qr_vnpay', -- qr_vnpay, bank_transfer, card
    payment_qr_image TEXT, -- URL ảnh QR code static
    payment_phone TEXT DEFAULT '0703189963',
    payment_bank_info TEXT DEFAULT 'VNPay - 0703189963',
    payment_content TEXT, -- Nội dung chuyển khoản

    -- Payment verification
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, verifying, confirmed, rejected, cancelled
    payment_proof_image TEXT, -- Ảnh chứng từ do user upload
    payment_proof_uploaded_at TIMESTAMPTZ,

    -- Admin verification
    verified_by_admin_id TEXT,
    verified_by_admin_name TEXT,
    verified_at TIMESTAMPTZ,
    admin_notes TEXT,
    rejection_reason TEXT,

    -- Order status
    order_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled, expired

    -- File delivery
    files_sent BOOLEAN NOT NULL DEFAULT FALSE,
    files_sent_at TIMESTAMPTZ,
    download_links JSONB, -- {workflow: url, docs: [urls]}
    download_links_expire_at TIMESTAMPTZ, -- Links expire sau 7 ngày

    -- Auto-cancel
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,

    -- Tracking
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BẢNG 3: NLC_WORKFLOW_REVIEWS - Đánh giá workflow
-- =====================================================
CREATE TABLE IF NOT EXISTS nlc_workflow_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    workflow_id UUID NOT NULL REFERENCES nlc_workflows(id) ON DELETE CASCADE,

    -- Reviewer info
    reviewer_user_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_email TEXT NOT NULL,
    reviewer_avatar TEXT,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title TEXT,
    review_text TEXT NOT NULL,

    -- Review metadata
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    not_helpful_count INTEGER NOT NULL DEFAULT 0,

    -- Status
    review_status TEXT NOT NULL DEFAULT 'published', -- published, pending, rejected
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    -- Admin moderation
    moderated_by TEXT,
    moderated_at TIMESTAMPTZ,
    moderation_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(workflow_id, reviewer_user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- nlc_workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_slug ON nlc_workflows(workflow_slug);
CREATE INDEX IF NOT EXISTS idx_workflows_creator ON nlc_workflows(creator_id);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON nlc_workflows(workflow_category);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON nlc_workflows(workflow_status);
CREATE INDEX IF NOT EXISTS idx_workflows_featured ON nlc_workflows(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflows_free ON nlc_workflows(is_free) WHERE is_free = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflows_price ON nlc_workflows(workflow_price);
CREATE INDEX IF NOT EXISTS idx_workflows_rating ON nlc_workflows(avg_rating);

-- nlc_workflow_orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_code ON nlc_workflow_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON nlc_workflow_orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_user ON nlc_workflow_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_workflow ON nlc_workflow_orders(workflow_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON nlc_workflow_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON nlc_workflow_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON nlc_workflow_orders(created_at DESC);

-- nlc_workflow_reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_workflow ON nlc_workflow_reviews(workflow_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON nlc_workflow_reviews(reviewer_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON nlc_workflow_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON nlc_workflow_reviews(review_status);

-- =====================================================
-- FUNCTION: AUTO UPDATE TIMESTAMPS
-- =====================================================

-- Create or replace function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION nlc_update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTO TIMESTAMPS
-- =====================================================

CREATE TRIGGER tr_workflows_update
    BEFORE UPDATE ON nlc_workflows
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_workflow_orders_update
    BEFORE UPDATE ON nlc_workflow_orders
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

CREATE TRIGGER tr_workflow_reviews_update
    BEFORE UPDATE ON nlc_workflow_reviews
    FOR EACH ROW EXECUTE FUNCTION nlc_update_timestamps();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE nlc_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_workflow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlc_workflow_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nlc_workflows
CREATE POLICY "Anyone can view published workflows" ON nlc_workflows
    FOR SELECT USING (workflow_status = 'published' AND is_active = TRUE);

CREATE POLICY "Creators can view their own workflows" ON nlc_workflows
    FOR SELECT USING (creator_id = auth.uid()::text);

CREATE POLICY "Authenticated users can insert workflows" ON nlc_workflows
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        creator_id = auth.uid()::text
    );

CREATE POLICY "Creators can update their workflows" ON nlc_workflows
    FOR UPDATE USING (creator_id = auth.uid()::text);

CREATE POLICY "Creators can delete their workflows" ON nlc_workflows
    FOR DELETE USING (creator_id = auth.uid()::text);

-- RLS Policies for nlc_workflow_orders
CREATE POLICY "Buyers can view their orders" ON nlc_workflow_orders
    FOR SELECT USING (
        buyer_user_id = auth.uid()::text
    );

CREATE POLICY "Anyone can create orders" ON nlc_workflow_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Buyers can update their orders" ON nlc_workflow_orders
    FOR UPDATE USING (
        buyer_user_id = auth.uid()::text
    );

-- RLS Policies for nlc_workflow_reviews
CREATE POLICY "Anyone can view published reviews" ON nlc_workflow_reviews
    FOR SELECT USING (review_status = 'published');

CREATE POLICY "Users can create reviews" ON nlc_workflow_reviews
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        reviewer_user_id = auth.uid()::text
    );

CREATE POLICY "Reviewers can update their reviews" ON nlc_workflow_reviews
    FOR UPDATE USING (reviewer_user_id = auth.uid()::text);

CREATE POLICY "Reviewers can delete their reviews" ON nlc_workflow_reviews
    FOR DELETE USING (reviewer_user_id = auth.uid()::text);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample workflows
INSERT INTO nlc_workflows (
    workflow_name, workflow_slug, workflow_description, workflow_category,
    workflow_thumbnail, workflow_file_url, creator_id, creator_name, creator_email,
    workflow_price, is_free, workflow_status, is_featured, tags, difficulty_level,
    node_count, estimated_setup_time, use_cases
) VALUES
(
    'E-commerce Order Automation',
    'ecommerce-order-automation',
    'Tự động hóa xử lý đơn hàng từ Shopify/WooCommerce, gửi thông báo email, cập nhật inventory và tạo shipping labels.',
    'E-commerce',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
    'https://example.com/workflow-1.json',
    'admin-super-user-001',
    'Trần Minh Long',
    'tranminhlong2404@gmail.com',
    299000,
    FALSE,
    'published',
    TRUE,
    ARRAY['automation', 'ecommerce', 'shopify', 'email'],
    'Intermediate',
    15,
    '30-45 minutes',
    ARRAY['Xử lý đơn hàng tự động', 'Gửi email xác nhận', 'Cập nhật kho hàng', 'Tạo vận đơn']
),
(
    'Social Media Content Scheduler',
    'social-media-scheduler',
    'Lên lịch và đăng content tự động lên Facebook, Instagram, Twitter. Hỗ trợ bulk upload và analytics.',
    'Marketing',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
    'https://example.com/workflow-2.json',
    'admin-super-user-001',
    'Trần Minh Long',
    'tranminhlong2404@gmail.com',
    199000,
    FALSE,
    'published',
    TRUE,
    ARRAY['social media', 'marketing', 'scheduler', 'automation'],
    'Beginner',
    10,
    '20 minutes',
    ARRAY['Đăng bài tự động', 'Quản lý nhiều kênh', 'Thống kê engagement']
),
(
    'Data Scraping & Analysis Workflow',
    'data-scraping-analysis',
    'Scrape dữ liệu từ websites, clean data, phân tích và xuất báo cáo Excel/Google Sheets.',
    'Data Processing',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
    'https://example.com/workflow-3.json',
    'admin-super-user-001',
    'Trần Minh Long',
    'tranminhlong2404@gmail.com',
    0,
    TRUE,
    'published',
    FALSE,
    ARRAY['scraping', 'data', 'analysis', 'excel'],
    'Advanced',
    20,
    '1-2 hours',
    ARRAY['Thu thập dữ liệu', 'Phân tích thị trường', 'Báo cáo tự động']
);

-- Success message
SELECT
    '✅ WORKFLOW MARKETPLACE DATABASE CREATED!' as status,
    (SELECT COUNT(*) FROM nlc_workflows) as sample_workflows,
    '3 tables created: nlc_workflows, nlc_workflow_orders, nlc_workflow_reviews' as tables;
