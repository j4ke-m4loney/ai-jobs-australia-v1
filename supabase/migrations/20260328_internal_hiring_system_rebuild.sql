-- Internal Hiring System Rebuild Migration
-- Covers: status enum unification, pagination index, viewed_at,
-- application_notes, notification frequency, application_method,
-- question_answers, status_history

-- ============================================================
-- 1. Unify application status enum
-- ============================================================

-- First drop existing CHECK constraint if it exists
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Update any legacy 'viewed' status to 'reviewing'
UPDATE job_applications SET status = 'reviewing' WHERE status = 'viewed';

-- Add new CHECK constraint with canonical status set
ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check
  CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'));

-- ============================================================
-- 2. Pagination index for employer dashboard
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_job_applications_job_status_created
  ON job_applications(job_id, status, created_at DESC);

-- ============================================================
-- 3. viewed_at column for new/unread indicator
-- ============================================================

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- 4. status_history column for tracking status transitions
-- ============================================================

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN job_applications.status_history IS 'Array of {status, timestamp, note} objects tracking status transitions';

-- ============================================================
-- 6. application_notes table for employer private notes
-- ============================================================

CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_notes_app_id ON application_notes(application_id);

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- Employers can view notes on applications for their jobs
CREATE POLICY "Employers can view their application notes" ON application_notes
  FOR SELECT USING (
    employer_id = auth.uid()
  );

-- Employers can create notes on applications for their jobs
CREATE POLICY "Employers can create application notes" ON application_notes
  FOR INSERT WITH CHECK (
    employer_id = auth.uid()
    AND application_id IN (
      SELECT ja.id FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE j.employer_id = auth.uid()
    )
  );

-- Employers can update their own notes
CREATE POLICY "Employers can update their application notes" ON application_notes
  FOR UPDATE USING (
    employer_id = auth.uid()
  );

-- ============================================================
-- 7. Notification frequency preference
-- ============================================================

ALTER TABLE user_notification_preferences
  ADD COLUMN IF NOT EXISTS application_notification_frequency TEXT
    DEFAULT 'immediate';

-- Add CHECK constraint (drop first if exists for idempotency)
DO $$
BEGIN
  ALTER TABLE user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_frequency_check
    CHECK (application_notification_frequency IN ('immediate', 'hourly', 'daily', 'off'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 8. Update application_method to include 'internal'
-- ============================================================

-- Drop existing constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_application_method_check;

-- Add updated constraint
ALTER TABLE jobs ADD CONSTRAINT jobs_application_method_check
  CHECK (application_method IN ('external', 'email', 'internal'));

-- Migrate any existing 'indeed' values to 'internal'
UPDATE jobs SET application_method = 'internal' WHERE application_method = 'indeed';

-- ============================================================
-- 9. Reload PostgREST schema cache
-- ============================================================

NOTIFY pgrst, 'reload schema';
