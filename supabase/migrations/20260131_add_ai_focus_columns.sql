-- Add AI Focus columns to jobs table for AJA Intelligence feature
-- These columns store the AI-generated analysis of how AI/ML-focused each job is

ALTER TABLE public.jobs
ADD COLUMN ai_focus_percentage INTEGER CHECK (ai_focus_percentage >= 0 AND ai_focus_percentage <= 100),
ADD COLUMN ai_focus_rationale TEXT CHECK (char_length(ai_focus_rationale) <= 350),
ADD COLUMN ai_focus_confidence TEXT CHECK (ai_focus_confidence IN ('high', 'medium', 'low')),
ADD COLUMN ai_focus_analysed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient filtering by AI focus score
CREATE INDEX idx_jobs_ai_focus_percentage ON public.jobs(ai_focus_percentage);

-- Add comments for documentation
COMMENT ON COLUMN public.jobs.ai_focus_percentage IS 'AI Focus score from 0-100 indicating how AI/ML-focused the role is';
COMMENT ON COLUMN public.jobs.ai_focus_rationale IS 'Brief explanation of the AI Focus score (max 350 chars)';
COMMENT ON COLUMN public.jobs.ai_focus_confidence IS 'Confidence level of the AI analysis: high, medium, or low';
COMMENT ON COLUMN public.jobs.ai_focus_analysed_at IS 'Timestamp when the AI Focus analysis was performed';
