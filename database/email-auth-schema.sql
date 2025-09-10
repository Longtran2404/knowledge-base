-- Email Authentication System Schema
-- This schema replaces Supabase Auth with custom email verification system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    token_type TEXT CHECK (token_type IN ('verification', 'password_reset', 'login')) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON public.email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON public.email_verification_tokens(expires_at);

-- User sessions table for JWT token management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON public.user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_name TEXT,
    status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'bounced')) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);

-- Update users table to remove dependency on auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Make id a regular UUID instead of referencing auth.users
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Update other tables to remove auth.users dependency
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.account_nam_long_center DROP CONSTRAINT IF EXISTS account_nam_long_center_user_id_fkey;
ALTER TABLE public.account_nam_long_center ADD CONSTRAINT account_nam_long_center_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.manager_approvals DROP CONSTRAINT IF EXISTS manager_approvals_user_id_fkey;
ALTER TABLE public.manager_approvals ADD CONSTRAINT manager_approvals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.manager_approvals DROP CONSTRAINT IF EXISTS manager_approvals_reviewed_by_fkey;
ALTER TABLE public.manager_approvals ADD CONSTRAINT manager_approvals_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_verification_tokens
CREATE POLICY "Users can view own verification tokens" ON public.email_verification_tokens
    FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE email = email_verification_tokens.email));

CREATE POLICY "System can insert verification tokens" ON public.email_verification_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update verification tokens" ON public.email_verification_tokens
    FOR UPDATE USING (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE id = user_sessions.user_id));

CREATE POLICY "System can manage sessions" ON public.user_sessions
    FOR ALL USING (true);

-- RLS Policies for email_logs
CREATE POLICY "Users can view own email logs" ON public.email_logs
    FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE email = email_logs.to_email));

CREATE POLICY "System can manage email logs" ON public.email_logs
    FOR ALL USING (true);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.email_verification_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION public.generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create email verification token
CREATE OR REPLACE FUNCTION public.create_email_verification_token(
    p_email TEXT,
    p_token_type TEXT DEFAULT 'verification',
    p_expires_in_hours INTEGER DEFAULT 24
)
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
    v_user_id UUID;
BEGIN
    -- Generate secure token
    v_token := public.generate_secure_token(64);
    
    -- Get user_id if user exists
    SELECT id INTO v_user_id FROM public.users WHERE email = p_email;
    
    -- Insert token
    INSERT INTO public.email_verification_tokens (
        email, token, token_type, expires_at, user_id
    ) VALUES (
        p_email, v_token, p_token_type, NOW() + (p_expires_in_hours || ' hours')::INTERVAL, v_user_id
    );
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Function to verify email token
CREATE OR REPLACE FUNCTION public.verify_email_token(
    p_token TEXT,
    p_token_type TEXT DEFAULT 'verification'
)
RETURNS TABLE(
    is_valid BOOLEAN,
    email TEXT,
    user_id UUID,
    message TEXT
) AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Get token record
    SELECT * INTO v_record 
    FROM public.email_verification_tokens 
    WHERE token = p_token AND token_type = p_token_type;
    
    -- Check if token exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, ''::TEXT, NULL::UUID, 'Token không tồn tại'::TEXT;
        RETURN;
    END IF;
    
    -- Check if token is expired
    IF v_record.expires_at < NOW() THEN
        RETURN QUERY SELECT false, v_record.email, v_record.user_id, 'Token đã hết hạn'::TEXT;
        RETURN;
    END IF;
    
    -- Check if token is already used
    IF v_record.used_at IS NOT NULL THEN
        RETURN QUERY SELECT false, v_record.email, v_record.user_id, 'Token đã được sử dụng'::TEXT;
        RETURN;
    END IF;
    
    -- Mark token as used
    UPDATE public.email_verification_tokens 
    SET used_at = NOW() 
    WHERE id = v_record.id;
    
    RETURN QUERY SELECT true, v_record.email, v_record.user_id, 'Token hợp lệ'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
    session_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ
) AS $$
DECLARE
    v_session_token TEXT;
    v_refresh_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Generate tokens
    v_session_token := public.generate_secure_token(64);
    v_refresh_token := public.generate_secure_token(64);
    v_expires_at := NOW() + INTERVAL '7 days';
    
    -- Insert session
    INSERT INTO public.user_sessions (
        user_id, session_token, refresh_token, expires_at, ip_address, user_agent
    ) VALUES (
        p_user_id, v_session_token, v_refresh_token, v_expires_at, p_ip_address, p_user_agent
    );
    
    -- Update user last login
    UPDATE public.users 
    SET last_login_at = NOW(), login_count = login_count + 1
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT v_session_token, v_refresh_token, v_expires_at;
END;
$$ LANGUAGE plpgsql;

-- Function to validate session
CREATE OR REPLACE FUNCTION public.validate_session(p_session_token TEXT)
RETURNS TABLE(
    is_valid BOOLEAN,
    user_id UUID,
    user_data JSONB
) AS $$
DECLARE
    v_session RECORD;
    v_user RECORD;
BEGIN
    -- Get session
    SELECT * INTO v_session 
    FROM public.user_sessions 
    WHERE session_token = p_session_token AND is_active = true;
    
    -- Check if session exists and is not expired
    IF NOT FOUND OR v_session.expires_at < NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB;
        RETURN;
    END IF;
    
    -- Get user data
    SELECT * INTO v_user FROM public.users WHERE id = v_session.user_id;
    
    -- Update last accessed
    UPDATE public.user_sessions 
    SET last_accessed_at = NOW() 
    WHERE id = v_session.id;
    
    -- Return user data
    RETURN QUERY SELECT 
        true, 
        v_user.id, 
        to_jsonb(v_user);
END;
$$ LANGUAGE plpgsql;

-- Function to logout user (invalidate session)
CREATE OR REPLACE FUNCTION public.logout_user(p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_sessions 
    SET is_active = false 
    WHERE session_token = p_session_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup job (run this periodically)
-- You can set up a cron job to run: SELECT public.cleanup_expired_tokens();
