-- Feature usage tracking for monthly caps
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('match_score', 'cover_letter')),
  month TEXT NOT NULL, -- '2026-03' format
  call_count INTEGER NOT NULL DEFAULT 0,
  last_called_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, feature, month)
);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON feature_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_month
  ON feature_usage(user_id, feature, month);

-- Atomic increment function to prevent race conditions
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_month TEXT,
  p_limit INTEGER
)
RETURNS TABLE(current_count INTEGER, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Upsert and increment atomically
  INSERT INTO feature_usage (user_id, feature, month, call_count, last_called_at)
  VALUES (p_user_id, p_feature, p_month, 1, now())
  ON CONFLICT (user_id, feature, month)
  DO UPDATE SET
    call_count = feature_usage.call_count + 1,
    last_called_at = now()
  RETURNING feature_usage.call_count INTO v_count;

  RETURN QUERY SELECT v_count, v_count <= p_limit;
END;
$$;

-- Cover letter caching and per-job generation cap
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_document_id UUID REFERENCES user_documents(id) ON DELETE SET NULL,
  generation_number INTEGER NOT NULL CHECK (generation_number >= 1 AND generation_number <= 3),
  cover_letter TEXT NOT NULL,
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id, resume_document_id, generation_number)
);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cover letters"
  ON cover_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover letters"
  ON cover_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_job
  ON cover_letters(user_id, job_id, resume_document_id);

NOTIFY pgrst, 'reload schema';
