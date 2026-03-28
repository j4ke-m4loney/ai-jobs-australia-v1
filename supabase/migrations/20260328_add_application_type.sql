-- Add application_type column to track external/email apply clicks
-- alongside internal applications in the job_applications table.

-- 1. Add application_type column (existing rows default to 'internal')
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS application_type TEXT NOT NULL DEFAULT 'internal';

ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_application_type_check
  CHECK (application_type IN ('internal', 'external', 'email'));

-- 2. Expand status enum to include 'applied' (for external/email clicks)
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check
  CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn', 'applied'));

-- 3. Index for efficient filtering by application_type in employer queries
CREATE INDEX IF NOT EXISTS idx_job_applications_type
  ON job_applications(job_id, application_type);

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
