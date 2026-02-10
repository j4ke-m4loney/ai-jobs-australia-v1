-- Add interview difficulty columns to jobs table
ALTER TABLE public.jobs
ADD COLUMN interview_difficulty_level TEXT CHECK (interview_difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
ADD COLUMN interview_difficulty_rationale TEXT CHECK (char_length(interview_difficulty_rationale) <= 350),
ADD COLUMN interview_difficulty_confidence TEXT CHECK (interview_difficulty_confidence IN ('high', 'medium', 'low')),
ADD COLUMN interview_difficulty_analysed_at TIMESTAMP WITH TIME ZONE;

-- Add index for filtering by interview difficulty
CREATE INDEX IF NOT EXISTS idx_jobs_interview_difficulty_level ON public.jobs(interview_difficulty_level);

COMMENT ON COLUMN public.jobs.interview_difficulty_level IS 'Predicted interview difficulty: easy, medium, hard, or very_hard';
COMMENT ON COLUMN public.jobs.interview_difficulty_rationale IS 'Brief explanation of the difficulty prediction (max 350 chars)';
COMMENT ON COLUMN public.jobs.interview_difficulty_confidence IS 'Confidence level of the analysis: high, medium, or low';
COMMENT ON COLUMN public.jobs.interview_difficulty_analysed_at IS 'Timestamp when the interview difficulty was analysed';
