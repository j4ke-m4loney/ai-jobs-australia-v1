-- Add promotion likelihood columns to jobs table
-- This helps job seekers understand career progression potential

ALTER TABLE public.jobs
ADD COLUMN promotion_likelihood_signal TEXT CHECK (promotion_likelihood_signal IN ('low', 'medium', 'high')),
ADD COLUMN promotion_likelihood_rationale TEXT CHECK (char_length(promotion_likelihood_rationale) <= 1000),
ADD COLUMN promotion_likelihood_confidence TEXT CHECK (promotion_likelihood_confidence IN ('high', 'medium', 'low')),
ADD COLUMN promotion_likelihood_analysed_at TIMESTAMP WITH TIME ZONE;
