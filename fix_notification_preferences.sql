-- Fix/Complete Email Notification Preferences Table
-- This script is safe to run multiple times and will handle partial migrations

-- Step 1: Drop existing components safely
DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON public.user_notification_preferences;
DROP INDEX IF EXISTS idx_user_notification_preferences_user_id;

-- Drop existing policies safely
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.user_notification_preferences;

-- Step 2: Create or recreate the table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Employer notifications
  email_applications BOOLEAN DEFAULT true,
  email_job_views BOOLEAN DEFAULT false,
  email_weekly_reports BOOLEAN DEFAULT false,

  -- Job seeker notifications
  email_new_jobs BOOLEAN DEFAULT true,
  email_similar_jobs BOOLEAN DEFAULT false,
  email_application_updates BOOLEAN DEFAULT true,
  email_promotions BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Ensure one preference row per user
  UNIQUE(user_id)
);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Step 4: Create all policies
CREATE POLICY "Users can view their own notification preferences"
ON public.user_notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.user_notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON public.user_notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create the updated_at trigger
CREATE TRIGGER update_user_notification_preferences_updated_at
BEFORE UPDATE ON public.user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 6: Create indexes for performance
CREATE INDEX idx_user_notification_preferences_user_id
ON public.user_notification_preferences(user_id);

-- Step 7: Insert default preferences for all existing users
-- This is safe to run multiple times due to ON CONFLICT
INSERT INTO public.user_notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Step 8: Verify the setup
-- This will show how many users now have notification preferences
SELECT
  'Notification preferences setup complete' as status,
  COUNT(*) as users_with_preferences
FROM public.user_notification_preferences;