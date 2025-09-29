-- Add automatic creation of default notification preferences for new users
-- This extends the existing handle_new_user() function

-- 1. Update the handle_new_user function to also create notification preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile (existing functionality)
  INSERT INTO public.profiles (
    user_id,
    first_name,
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'job_seeker'),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default notification preferences (new functionality)
  INSERT INTO public.user_notification_preferences (
    user_id,
    email_applications,
    email_job_views,
    email_weekly_reports,
    email_new_jobs,
    email_similar_jobs,
    email_application_updates,
    email_promotions
  )
  VALUES (
    new.id,
    true,   -- email_applications (default true for employers)
    false,  -- email_job_views
    false,  -- email_weekly_reports
    true,   -- email_new_jobs (default true for job seekers)
    false,  -- email_similar_jobs
    true,   -- email_application_updates (default true for job seekers)
    false   -- email_promotions
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create default notification preferences for any existing users who don't have them
INSERT INTO public.user_notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and notification preferences for new users on signup';