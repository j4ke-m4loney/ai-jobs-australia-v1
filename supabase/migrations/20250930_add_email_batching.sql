-- Add email batching system for application notifications
-- This prevents inbox flooding while maintaining responsiveness

-- Step 1: Create email notification queue for batching multiple applications
CREATE TABLE IF NOT EXISTS public.email_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_ids UUID[] NOT NULL DEFAULT '{}',
  applicant_names TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  processed BOOLEAN DEFAULT false,

  CONSTRAINT unique_unprocessed_job_queue UNIQUE(job_id, processed) DEFERRABLE INITIALLY DEFERRED
);

-- Step 2: Create job email tracking to implement 1-hour batching rule
CREATE TABLE IF NOT EXISTS public.job_email_tracking (
  job_id UUID PRIMARY KEY REFERENCES public.jobs(id) ON DELETE CASCADE,
  last_email_sent TIMESTAMPTZ DEFAULT NOW(),
  application_count_since_last INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS on new tables
ALTER TABLE public.email_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_email_tracking ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for email_notification_queue
CREATE POLICY "Service role can manage email queue"
ON public.email_notification_queue
FOR ALL
TO service_role
USING (true);

-- Step 5: Create policies for job_email_tracking
CREATE POLICY "Service role can manage email tracking"
ON public.job_email_tracking
FOR ALL
TO service_role
USING (true);

-- Step 6: Create indexes for performance
CREATE INDEX idx_email_queue_job_id ON public.email_notification_queue(job_id);
CREATE INDEX idx_email_queue_scheduled_processed ON public.email_notification_queue(scheduled_for, processed);
CREATE INDEX idx_email_queue_employer_id ON public.email_notification_queue(employer_id);
CREATE INDEX idx_job_email_tracking_last_sent ON public.job_email_tracking(last_email_sent);

-- Step 7: Create trigger to update updated_at on job_email_tracking
CREATE OR REPLACE FUNCTION public.update_job_email_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_email_tracking_updated_at
BEFORE UPDATE ON public.job_email_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_job_email_tracking_updated_at();

-- Step 8: Add helpful comments
COMMENT ON TABLE public.email_notification_queue IS 'Queue for batching application notification emails to prevent inbox flooding';
COMMENT ON TABLE public.job_email_tracking IS 'Tracks when emails were last sent for each job to implement batching rules';
COMMENT ON COLUMN public.email_notification_queue.application_ids IS 'Array of application IDs included in this batch';
COMMENT ON COLUMN public.email_notification_queue.applicant_names IS 'Array of applicant names for quick email template access';
COMMENT ON COLUMN public.email_notification_queue.scheduled_for IS 'When this batch should be sent (1 hour from creation or when threshold reached)';
COMMENT ON COLUMN public.job_email_tracking.application_count_since_last IS 'Number of applications received since last email was sent';