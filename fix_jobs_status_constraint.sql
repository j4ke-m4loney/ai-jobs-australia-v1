-- Fix jobs status constraint to include pending_approval
-- This ensures that job editing can transition approved jobs back to pending_approval

ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN ('draft', 'pending_payment', 'pending_approval', 'approved', 'rejected', 'expired', 'paused'));