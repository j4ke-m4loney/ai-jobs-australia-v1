-- Fix job_applications RLS policies and status constraint

-- First, update the status constraint to include 'reviewing' and 'shortlisted'
ALTER TABLE public.job_applications
DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE public.job_applications
ADD CONSTRAINT job_applications_status_check
CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'));

-- Add comment to document the status values
COMMENT ON COLUMN public.job_applications.status IS 'Application status: submitted (initial), reviewing (being evaluated), shortlisted (selected for interview), rejected (not selected), accepted (offer made)';

-- Create RLS UPDATE policy to allow employers to update applications for their jobs
CREATE POLICY "Employers can update applications for their jobs" ON public.job_applications FOR UPDATE
USING (
  auth.uid() IN (
    SELECT employer_id
    FROM public.jobs
    WHERE id = job_id
  )
);

-- Also ensure SELECT policy exists for employers to view applications
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;
CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications FOR SELECT
USING (
  auth.uid() IN (
    SELECT employer_id
    FROM public.jobs
    WHERE id = job_id
  )
  OR auth.uid() = applicant_id
);