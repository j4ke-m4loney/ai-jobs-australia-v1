-- Add highlights column to jobs table
-- This will store up to 3 job highlight bullet points as a TEXT array
ALTER TABLE public.jobs 
ADD COLUMN highlights TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.highlights IS 'Array of up to 3 job highlight bullet points (10-12 words each)';

-- Create index for highlights to improve search performance if needed in future
CREATE INDEX idx_jobs_highlights ON public.jobs USING gin(highlights);