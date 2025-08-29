-- Create analytics tracking tables for employer dashboard
-- Track job views for analytics
CREATE TABLE public.job_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  user_id UUID,
  viewer_ip TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT
);
-- Enable RLS on job_views
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
-- Employers can view analytics for their own jobs
CREATE POLICY "Employers can view job analytics" ON public.job_views FOR
SELECT USING (
    job_id IN (
      SELECT id
      FROM jobs
      WHERE employer_id = auth.uid()
    )
  );
-- Anyone can track job views (for analytics)
CREATE POLICY "Anyone can track job views" ON public.job_views FOR
INSERT WITH CHECK (true);
-- Track application events for detailed analytics
CREATE TABLE public.application_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  -- 'submitted', 'viewed', 'shortlisted', 'rejected', 'accepted'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);
-- Enable RLS on application_events
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
-- Employers can view events for applications to their jobs
CREATE POLICY "Employers can view application events" ON public.application_events FOR
SELECT USING (
    application_id IN (
      SELECT ja.id
      FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
      WHERE j.employer_id = auth.uid()
    )
  );
-- System can create application events
CREATE POLICY "System can create application events" ON public.application_events FOR
INSERT WITH CHECK (true);
-- Add indexes for better performance
CREATE INDEX idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX idx_job_views_viewed_at ON public.job_views(viewed_at);
CREATE INDEX idx_application_events_application_id ON public.application_events(application_id);
CREATE INDEX idx_application_events_event_type ON public.application_events(event_type);
CREATE INDEX idx_application_events_created_at ON public.application_events(created_at);