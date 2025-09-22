-- Fix RLS policies for admin job management
-- This ensures admins can actually update job statuses

-- First, check and list existing policies (for debugging)
-- Run this separately to see current state:
-- SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;

-- Create a comprehensive admin policy that allows all operations
CREATE POLICY "Admin full access to jobs" ON public.jobs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Keep existing view policies for regular users
CREATE POLICY IF NOT EXISTS "Anyone can view approved jobs" ON public.jobs
FOR SELECT
USING (status = 'approved' OR auth.uid() = employer_id);

-- Allow employers to update their own jobs (but not if admin already handled)
CREATE POLICY IF NOT EXISTS "Employers can update own jobs" ON public.jobs
FOR UPDATE
TO authenticated
USING (
  auth.uid() = employer_id
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
)
WITH CHECK (auth.uid() = employer_id);

-- Verify the policies are active
-- Run this query after applying policies to confirm:
-- SELECT * FROM pg_policies WHERE tablename = 'jobs' ORDER BY policyname;