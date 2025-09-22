-- Add admin-related columns to jobs table
-- These columns are needed for the admin dashboard functionality

-- Add rejection_reason column if not exists
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add admin_notes column for internal use
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add reviewed_at timestamp
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by to track which admin reviewed
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_reviewed_at ON public.jobs(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_reviewed_by ON public.jobs(reviewed_by);