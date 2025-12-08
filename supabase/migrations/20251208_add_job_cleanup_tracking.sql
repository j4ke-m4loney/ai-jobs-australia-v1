-- Add 'needs_review' status to jobs table
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN ('draft', 'pending_payment', 'pending_approval', 'approved', 'rejected', 'expired', 'paused', 'needs_review'));

-- Add tracking fields for cleanup process
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS check_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS expired_evidence TEXT,
ADD COLUMN IF NOT EXISTS check_method TEXT;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_jobs_last_checked ON public.jobs(last_checked_at) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_jobs_needs_review ON public.jobs(status) WHERE status = 'needs_review';

-- Create job_check_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.job_check_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  check_method TEXT NOT NULL,
  status_code INTEGER,
  evidence_found TEXT[],
  decision TEXT NOT NULL,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_check_logs_job_id ON public.job_check_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_check_logs_created_at ON public.job_check_logs(created_at);

-- Enable RLS
ALTER TABLE public.job_check_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all check logs
CREATE POLICY "Admins can view all check logs" ON public.job_check_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Employers can view logs for their jobs
CREATE POLICY "Employers can view their job check logs" ON public.job_check_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_check_logs.job_id
    AND jobs.employer_id = auth.uid()
  )
);
