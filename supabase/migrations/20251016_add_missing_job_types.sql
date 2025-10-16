-- Add missing job types to the job_type CHECK constraint
-- This migration expands the allowed job types to match the frontend UI options
-- Drop the existing CHECK constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;
-- Add the new CHECK constraint with all job types
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_job_type_check CHECK (
    job_type IN (
      'full-time',
      'part-time',
      'permanent',
      'fixed-term',
      'subcontract',
      'casual',
      'temp-to-perm',
      'contract',
      'volunteer',
      'internship',
      'graduate'
    )
  );