-- Admin functions and policies for job management

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = $1
    AND profiles.user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_jobs', COUNT(*),
    'pending_approval', COUNT(*) FILTER (WHERE status = 'pending_approval'),
    'approved', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'featured', COUNT(*) FILTER (WHERE is_featured = true),
    'expired', COUNT(*) FILTER (WHERE status = 'expired'),
    'total_companies', (SELECT COUNT(DISTINCT company_id) FROM public.jobs WHERE company_id IS NOT NULL),
    'total_users', (SELECT COUNT(*) FROM auth.users)
  ) INTO stats
  FROM public.jobs;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to bulk update job status
CREATE OR REPLACE FUNCTION public.admin_update_job_status(
  job_ids UUID[],
  new_status TEXT,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Validate status
  IF new_status NOT IN ('pending_approval', 'approved', 'rejected', 'expired', 'paused') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  -- Update jobs
  UPDATE public.jobs
  SET
    status = new_status,
    updated_at = now(),
    rejection_reason = CASE
      WHEN new_status = 'rejected' THEN rejection_reason
      ELSE NULL
    END
  WHERE id = ANY(job_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add rejection_reason column to jobs table if not exists
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add admin_notes column for internal use
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add reviewed_at timestamp
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by to track which admin reviewed
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Create admin_actions audit table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_job', 'reject_job', 'delete_job', 'update_job', 'bulk_action')),
  target_type TEXT NOT NULL CHECK (target_type IN ('job', 'user', 'company')),
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_actions
CREATE POLICY "Only admins can view admin actions" ON public.admin_actions
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert admin actions" ON public.admin_actions
FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Create additional RLS policies for jobs table for admin operations
CREATE POLICY "Admins can update any job" ON public.jobs
FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any job" ON public.jobs
FOR DELETE USING (public.is_admin(auth.uid()));

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    auth.uid(),
    action_type,
    target_type,
    target_id,
    details
  ) RETURNING id INTO action_id;

  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark job as duplicate
CREATE OR REPLACE FUNCTION public.admin_mark_duplicate(
  duplicate_job_id UUID,
  original_job_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update the duplicate job
  UPDATE public.jobs
  SET
    status = 'rejected',
    rejection_reason = 'Duplicate of job: ' || original_job_id::TEXT,
    admin_notes = COALESCE(admin_notes, '') || E'\nMarked as duplicate of: ' || original_job_id::TEXT,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = duplicate_job_id;

  -- Log the action
  PERFORM public.log_admin_action(
    'reject_job',
    'job',
    duplicate_job_id,
    jsonb_build_object('reason', 'duplicate', 'original_job_id', original_job_id)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_reviewed_at ON public.jobs(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_reviewed_by ON public.jobs(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_type, target_id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_job_status(UUID[], TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_duplicate(UUID, UUID) TO authenticated;