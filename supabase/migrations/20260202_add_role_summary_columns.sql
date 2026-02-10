-- Add Role Summary columns to jobs table
-- This is part of the AJA Intelligence premium feature

ALTER TABLE public.jobs
ADD COLUMN role_summary_one_liner TEXT CHECK (char_length(role_summary_one_liner) <= 160),
ADD COLUMN role_summary_plain_english TEXT CHECK (char_length(role_summary_plain_english) <= 500),
ADD COLUMN role_summary_confidence TEXT CHECK (role_summary_confidence IN ('high', 'medium', 'low')),
ADD COLUMN role_summary_analysed_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.role_summary_one_liner IS 'A catchy, clear tagline summarising the role (max 160 chars)';
COMMENT ON COLUMN public.jobs.role_summary_plain_english IS 'Plain English explanation of what someone in this role actually does (max 500 chars)';
COMMENT ON COLUMN public.jobs.role_summary_confidence IS 'Confidence level of the analysis: high, medium, or low';
COMMENT ON COLUMN public.jobs.role_summary_analysed_at IS 'Timestamp when the role summary was analysed';
