-- Create newsletter_test_users table for MVP testing
CREATE TABLE IF NOT EXISTS public.newsletter_test_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_test_users_email
ON public.newsletter_test_users(email);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_newsletter_test_users_active
ON public.newsletter_test_users(active) WHERE active = true;

-- Add RLS policies
ALTER TABLE public.newsletter_test_users ENABLE ROW LEVEL SECURITY;

-- Admin can view all test users
CREATE POLICY "Admins can view all newsletter test users"
ON public.newsletter_test_users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Admin can insert test users
CREATE POLICY "Admins can insert newsletter test users"
ON public.newsletter_test_users
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Admin can update test users
CREATE POLICY "Admins can update newsletter test users"
ON public.newsletter_test_users
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Admin can delete test users
CREATE POLICY "Admins can delete newsletter test users"
ON public.newsletter_test_users
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Insert initial test users (including your email)
INSERT INTO public.newsletter_test_users (email, first_name, active)
VALUES
    ('jake@aijobsaustralia.com.au', 'Jake', true)
ON CONFLICT (email) DO NOTHING;

-- Comment on table
COMMENT ON TABLE public.newsletter_test_users IS 'Test recipients for newsletter MVP - will expand to all users later';
