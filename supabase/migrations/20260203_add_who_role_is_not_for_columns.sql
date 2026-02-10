-- Add "Who Role Is NOT For" columns to the jobs table
-- This is part of the AJA Intelligence premium feature set

ALTER TABLE public.jobs
ADD COLUMN who_role_is_not_for_bullets TEXT[] CHECK (array_length(who_role_is_not_for_bullets, 1) <= 3),
ADD COLUMN who_role_is_not_for_confidence TEXT CHECK (who_role_is_not_for_confidence IN ('high', 'medium', 'low')),
ADD COLUMN who_role_is_not_for_analysed_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.who_role_is_not_for_bullets IS 'Array of 3 bullet points describing who this role is NOT for';
COMMENT ON COLUMN public.jobs.who_role_is_not_for_confidence IS 'Confidence level of the analysis: high, medium, or low';
COMMENT ON COLUMN public.jobs.who_role_is_not_for_analysed_at IS 'Timestamp when the analysis was performed';
