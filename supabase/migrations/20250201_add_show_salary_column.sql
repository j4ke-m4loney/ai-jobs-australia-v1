-- Add show_salary column to jobs table
-- This allows employers to provide salary data for filtering while controlling public display

ALTER TABLE public.jobs
ADD COLUMN show_salary boolean NOT NULL DEFAULT true;

-- Add index for potential filtering by show_salary
CREATE INDEX IF NOT EXISTS idx_jobs_show_salary
ON public.jobs USING btree (show_salary)
TABLESPACE pg_default;

-- Add comment to explain the column
COMMENT ON COLUMN public.jobs.show_salary IS 'Controls whether salary is publicly displayed. Salary data is always stored for filtering purposes.';
