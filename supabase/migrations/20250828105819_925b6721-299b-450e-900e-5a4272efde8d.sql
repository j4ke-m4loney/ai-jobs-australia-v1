-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
-- RLS Policies - Only job seekers can save jobs
CREATE POLICY "Job seekers can save jobs" ON public.saved_jobs FOR
INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type = 'job_seeker'
    )
  );
CREATE POLICY "Job seekers can view their saved jobs" ON public.saved_jobs FOR
SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type = 'job_seeker'
    )
  );
CREATE POLICY "Job seekers can unsave jobs" ON public.saved_jobs FOR DELETE USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND user_type = 'job_seeker'
  )
);
-- Create index for better performance
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);