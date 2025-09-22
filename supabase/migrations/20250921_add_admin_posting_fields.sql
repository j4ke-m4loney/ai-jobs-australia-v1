-- Add fields to track admin-posted jobs
-- These columns help differentiate between regular user posts and admin posts

-- Add posted_by_admin field
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS posted_by_admin BOOLEAN DEFAULT false;

-- Add benefits and highlights as JSON arrays
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';

-- Add hiring timeline
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS hiring_timeline TEXT
CHECK (hiring_timeline IN ('immediately', 'within-1-week', 'within-1-month', 'flexible'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by_admin ON public.jobs(posted_by_admin);
CREATE INDEX IF NOT EXISTS idx_jobs_hiring_timeline ON public.jobs(hiring_timeline);

-- Update RLS policies to ensure admin-posted jobs are visible
-- (This ensures admin-posted jobs show up properly in searches)

-- Comment for documentation
COMMENT ON COLUMN public.jobs.posted_by_admin IS 'Indicates if this job was posted by an admin user';
COMMENT ON COLUMN public.jobs.benefits IS 'Array of job benefits';
COMMENT ON COLUMN public.jobs.highlights IS 'Array of job highlights';
COMMENT ON COLUMN public.jobs.hiring_timeline IS 'Expected hiring timeline for this position';