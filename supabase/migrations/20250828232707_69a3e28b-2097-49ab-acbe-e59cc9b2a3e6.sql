-- Add employer questions to jobs table
ALTER TABLE public.jobs
ADD COLUMN employer_questions jsonb DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.jobs.employer_questions IS 'Array of questions that employers want to ask applicants';