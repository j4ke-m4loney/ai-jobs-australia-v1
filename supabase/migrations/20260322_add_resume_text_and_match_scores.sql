-- Add resume_text column to user_documents for caching extracted PDF text
ALTER TABLE user_documents
ADD COLUMN IF NOT EXISTS resume_text TEXT;

-- Create job_match_scores table for personalised CV-to-job matching
CREATE TABLE IF NOT EXISTS job_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_percentage INTEGER CHECK (match_percentage >= 0 AND match_percentage <= 100),
  matched_skills TEXT[],
  missing_skills TEXT[],
  keywords_to_add TEXT[],
  experience_fit TEXT CHECK (experience_fit IN ('strong', 'moderate', 'stretch')),
  summary TEXT CHECK (char_length(summary) <= 500),
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  resume_document_id UUID REFERENCES user_documents(id) ON DELETE SET NULL,
  analysed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id, resume_document_id)
);

-- Enable RLS
ALTER TABLE job_match_scores ENABLE ROW LEVEL SECURITY;

-- Users can only read their own match scores
CREATE POLICY "Users can view own match scores"
  ON job_match_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own match scores
CREATE POLICY "Users can insert own match scores"
  ON job_match_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own match scores
CREATE POLICY "Users can update own match scores"
  ON job_match_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_job_match_scores_user_job
  ON job_match_scores(user_id, job_id);

NOTIFY pgrst, 'reload schema';
