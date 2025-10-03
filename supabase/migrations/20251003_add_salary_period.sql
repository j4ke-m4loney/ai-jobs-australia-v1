-- Add salary_period column to jobs table
ALTER TABLE public.jobs
ADD COLUMN salary_period TEXT
CHECK (salary_period IN ('hour', 'day', 'week', 'month', 'year'))
DEFAULT 'year';

-- Set existing jobs to 'year' as they were converted to annual salaries
UPDATE public.jobs SET salary_period = 'year' WHERE salary_period IS NULL;
