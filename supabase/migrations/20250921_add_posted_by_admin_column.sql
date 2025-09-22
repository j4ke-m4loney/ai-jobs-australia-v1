-- Add posted_by_admin column to track admin-posted jobs
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS posted_by_admin BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by_admin ON public.jobs(posted_by_admin);

-- Comment for documentation
COMMENT ON COLUMN public.jobs.posted_by_admin IS 'Indicates if this job was posted by an admin user (bypassing payment)';