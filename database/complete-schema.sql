-- Nam Long Center - Complete Database Schema
-- This schema includes all tables needed for the application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (independent of auth.users for better control)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    level TEXT CHECK (level IN ('Cơ bản', 'Trung cấp', 'Nâng cao')) DEFAULT 'Cơ bản',
    duration TEXT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_courses table (enrollment tracking)
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_nam_long_center table for account management
CREATE TABLE IF NOT EXISTS public.account_nam_long_center (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('sinh_vien','doanh_nghiep','quan_ly','admin')) DEFAULT 'sinh_vien',
    plan TEXT CHECK (plan IN ('free','student_299','business')) DEFAULT 'free',
    provider TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('pending','active','rejected')) DEFAULT 'pending',
    requested_role TEXT CHECK (requested_role IN ('sinh_vien','doanh_nghiep','quan_ly','admin')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create managers table
CREATE TABLE IF NOT EXISTS public.managers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE,
    user_id UUID UNIQUE REFERENCES auth.users(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create manager_approvals table
CREATE TABLE IF NOT EXISTS public.manager_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    requested_role TEXT CHECK (requested_role IN ('quan_ly')) NOT NULL,
    status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create manager_notifications table
CREATE TABLE IF NOT EXISTS public.manager_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    approval_id UUID REFERENCES public.manager_approvals(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('approved','rejected')) NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_user_courses_user ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course ON public.user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON public.purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_account_nam_long_center_user ON public.account_nam_long_center(user_id);
CREATE INDEX IF NOT EXISTS idx_account_nam_long_center_email ON public.account_nam_long_center(email);
CREATE INDEX IF NOT EXISTS idx_manager_approvals_status ON public.manager_approvals(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_nam_long_center ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can create user profile" ON public.users
    FOR INSERT WITH CHECK (true);

-- RLS Policies for courses table
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage their courses" ON public.courses
    FOR ALL USING (auth.uid()::text = instructor_id::text);

CREATE POLICY "Admins can manage all courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- RLS Policies for blog_posts table
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can manage their posts" ON public.blog_posts
    FOR ALL USING (auth.uid()::text = author_id::text);

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- RLS Policies for user_courses table
CREATE POLICY "Users can view own enrollments" ON public.user_courses
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own enrollments" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own enrollments" ON public.user_courses
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for purchases table
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for account_nam_long_center table
CREATE POLICY "Users can view own account" ON public.account_nam_long_center
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account" ON public.account_nam_long_center
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account" ON public.account_nam_long_center
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for managers table
CREATE POLICY "Anyone authenticated can view managers" ON public.managers
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for manager_approvals table
CREATE POLICY "Users can view own approvals" ON public.manager_approvals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all approvals" ON public.manager_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.managers 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own approvals" ON public.manager_approvals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for manager_notifications table
CREATE POLICY "Managers can view notifications" ON public.manager_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.managers 
            WHERE user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_nam_long_center_updated_at
    BEFORE UPDATE ON public.account_nam_long_center
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync user from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.users (id, email, full_name, role, email_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@namlongcenter.com', 'Admin User', 'admin', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'instructor@namlongcenter.com', 'Instructor User', 'instructor', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'student@namlongcenter.com', 'Student User', 'student', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (title, description, price, instructor_id, category, level, duration, is_published) VALUES
    ('React Cơ Bản', 'Học React từ đầu với các khái niệm cơ bản', 299000, '550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'Cơ bản', '4 tuần', true),
    ('JavaScript Nâng Cao', 'Nâng cao kỹ năng JavaScript với ES6+', 499000, '550e8400-e29b-41d4-a716-446655440002', 'Web Development', 'Nâng cao', '6 tuần', true),
    ('Node.js Backend', 'Xây dựng API với Node.js và Express', 399000, '550e8400-e29b-41d4-a716-446655440002', 'Backend Development', 'Trung cấp', '5 tuần', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.blog_posts (title, content, excerpt, author_id, category, tags, is_published) VALUES
    ('Hướng dẫn học React cho người mới bắt đầu', 'React là một thư viện JavaScript phổ biến...', 'Bài viết hướng dẫn học React từ cơ bản đến nâng cao', '550e8400-e29b-41d4-a716-446655440002', 'Tutorial', ARRAY['react', 'javascript', 'frontend'], true),
    ('10 mẹo lập trình JavaScript hiệu quả', 'JavaScript là ngôn ngữ lập trình phổ biến nhất...', 'Những mẹo và thủ thuật để viết JavaScript tốt hơn', '550e8400-e29b-41d4-a716-446655440002', 'Tips', ARRAY['javascript', 'programming', 'tips'], true)
ON CONFLICT DO NOTHING;

-- Insert sample manager
INSERT INTO public.managers (email, full_name) VALUES
    ('admin@namlongcenter.com', 'Admin Manager')
ON CONFLICT (email) DO NOTHING;
