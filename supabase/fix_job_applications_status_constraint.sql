-- Fix job_applications status constraint to include reviewing and shortlisted
-- The current constraint only allows: 'submitted', 'viewed', 'rejected', 'accepted'
-- But the frontend needs: 'submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'

-- Drop the existing constraint
ALTER TABLE public.job_applications
DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Add the updated constraint with the new status values
ALTER TABLE public.job_applications
ADD CONSTRAINT job_applications_status_check
CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'));

-- Add comment to document the status values
COMMENT ON COLUMN public.job_applications.status IS 'Application status: submitted (initial), reviewing (being evaluated), shortlisted (selected for interview), rejected (not selected), accepted (offer made)';