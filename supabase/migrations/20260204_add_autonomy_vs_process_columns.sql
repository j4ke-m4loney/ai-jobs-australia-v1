-- Add Autonomy vs Process columns for AJA Intelligence feature
-- This helps "builders" understand how much autonomy vs bureaucratic process a role involves

ALTER TABLE public.jobs
ADD COLUMN autonomy_level TEXT CHECK (autonomy_level IN ('low', 'medium', 'high')),
ADD COLUMN process_load TEXT CHECK (process_load IN ('low', 'medium', 'high')),
ADD COLUMN autonomy_vs_process_rationale TEXT CHECK (char_length(autonomy_vs_process_rationale) <= 1000),
ADD COLUMN autonomy_vs_process_confidence TEXT CHECK (autonomy_vs_process_confidence IN ('high', 'medium', 'low')),
ADD COLUMN autonomy_vs_process_analysed_at TIMESTAMP WITH TIME ZONE;
