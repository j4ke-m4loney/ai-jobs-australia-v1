-- Fix job editing database errors
-- 1. Add missing company columns to jobs table
-- 2. Update status constraint to include pending_approval

-- Add missing company columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Update jobs status constraint to include pending_approval
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN ('draft', 'pending_payment', 'pending_approval', 'approved', 'rejected', 'expired', 'paused'));

-- Add comments to document the new columns
COMMENT ON COLUMN public.jobs.company_name IS 'Company name for job posting display';
COMMENT ON COLUMN public.jobs.company_description IS 'Company description for job posting display';
COMMENT ON COLUMN public.jobs.company_website IS 'Company website URL for job posting display';