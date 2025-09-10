-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    category_id UUID REFERENCES public.categories(id),
    instructor_name TEXT NOT NULL,
    instructor_avatar TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration_hours INTEGER DEFAULT 0,
    lessons_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    what_you_learn TEXT[],
    requirements TEXT[],
    course_content JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published courses
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = TRUE);

-- Purchases table
CREATE TABLE public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    payment_method TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS on purchases table
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own purchases
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own purchases
CREATE POLICY "Users can insert own purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User course progress table
CREATE TABLE public.user_course_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_lessons INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS on user_course_progress table
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own progress
CREATE POLICY "Users can view own progress" ON public.user_course_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own progress
CREATE POLICY "Users can update own progress" ON public.user_course_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to insert their own progress
CREATE POLICY "Users can insert own progress" ON public.user_course_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course reviews table
CREATE TABLE public.course_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS on course_reviews table
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to reviews
CREATE POLICY "Anyone can view reviews" ON public.course_reviews
    FOR SELECT USING (TRUE);

-- Create policy for users to insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.course_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own reviews
CREATE POLICY "Users can update own reviews" ON public.course_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.course_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- User certificates table
CREATE TABLE public.user_certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_number TEXT UNIQUE,
    UNIQUE(user_id, course_id)
);

-- Enable RLS on user_certificates table
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own certificates
CREATE POLICY "Users can view own certificates" ON public.user_certificates
    FOR SELECT USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
    BEFORE UPDATE ON public.user_course_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON public.course_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Subscriptions table for monthly plans
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan TEXT CHECK (plan IN ('student_299','business')) NOT NULL,
    status TEXT CHECK (status IN ('active','past_due','canceled','incomplete')) DEFAULT 'incomplete',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    external_customer_id TEXT,
    external_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Accounts table for Nam Long Center and manager approval flow
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

ALTER TABLE public.account_nam_long_center ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own account" ON public.account_nam_long_center
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own account" ON public.account_nam_long_center
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own account" ON public.account_nam_long_center
    FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_account_nam_long_center_updated_at
    BEFORE UPDATE ON public.account_nam_long_center
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Managers list
CREATE TABLE IF NOT EXISTS public.managers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone authenticated can view managers" ON public.managers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seed default manager email
INSERT INTO public.managers (email, full_name)
VALUES ('tranminhlong2404@gmail.com', 'Default Manager')
ON CONFLICT (email) DO NOTHING;

-- Manager approval requests
CREATE TABLE IF NOT EXISTS public.manager_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  requested_role TEXT CHECK (requested_role IN ('quan_ly')) NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  note TEXT
);

ALTER TABLE public.manager_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own manager approval" ON public.manager_approvals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Managers can view approvals" ON public.manager_approvals
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.managers m WHERE m.user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "Managers can update approvals" ON public.manager_approvals
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.managers m WHERE m.user_id = auth.uid()));

-- Notification outbox for MCP email processing
CREATE TABLE IF NOT EXISTS public.manager_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  approval_id UUID REFERENCES public.manager_approvals(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('request','approved','rejected')) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.manager_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "App can insert notifications" ON public.manager_notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.emit_manager_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.manager_notifications (approval_id, type, payload)
  VALUES (NEW.id, 'request', jsonb_build_object(
    'user_id', NEW.user_id,
    'email', NEW.email,
    'full_name', NEW.full_name
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_emit_manager_request ON public.manager_approvals;
CREATE TRIGGER trg_emit_manager_request
AFTER INSERT ON public.manager_approvals
FOR EACH ROW EXECUTE FUNCTION public.emit_manager_request_notification();