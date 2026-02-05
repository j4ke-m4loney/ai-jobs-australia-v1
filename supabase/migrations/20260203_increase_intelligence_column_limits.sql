-- Increase character limits for AJA Intelligence columns
-- The previous limits (350-500 chars) were too restrictive and caused truncation

-- Drop existing CHECK constraints and add new ones with higher limits

-- Role Summary columns
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_role_summary_one_liner_check,
DROP CONSTRAINT IF EXISTS jobs_role_summary_plain_english_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_role_summary_one_liner_check CHECK (char_length(role_summary_one_liner) <= 300),
ADD CONSTRAINT jobs_role_summary_plain_english_check CHECK (char_length(role_summary_plain_english) <= 1000);

-- AI Focus columns
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_ai_focus_rationale_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_ai_focus_rationale_check CHECK (char_length(ai_focus_rationale) <= 1000);

-- Interview Difficulty columns
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_interview_difficulty_rationale_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_interview_difficulty_rationale_check CHECK (char_length(interview_difficulty_rationale) <= 1000);

-- Update comments to reflect new limits
COMMENT ON COLUMN public.jobs.role_summary_one_liner IS 'A catchy, clear tagline summarising the role (max 300 chars)';
COMMENT ON COLUMN public.jobs.role_summary_plain_english IS 'Plain English explanation of what someone in this role actually does (max 1000 chars)';
COMMENT ON COLUMN public.jobs.ai_focus_rationale IS 'Brief explanation of the AI Focus score (max 1000 chars)';
COMMENT ON COLUMN public.jobs.interview_difficulty_rationale IS 'Brief explanation of the difficulty prediction (max 1000 chars)';
