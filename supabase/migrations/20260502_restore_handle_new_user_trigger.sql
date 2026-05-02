-- Restore the handle_new_user() trigger that was supposed to be applied by
-- 20250916_user_type_management.sql + 20250930_add_notification_preferences_auto_creation.sql.
-- It is missing from the live database, so confirmed signups that don't return
-- to the dashboard become profile orphans (7 confirmed users between Jan and Apr 2026).
--
-- Important design choice: this trigger fires on email *confirmation*, not on
-- raw insert into auth.users. That means abandoned signups (users who never
-- clicked the confirmation email) do not get a profile row — they are not real
-- users and shouldn't pollute stats or newsletter syncs. OAuth signups confirm
-- at insert time, so they are caught by the INSERT branch of the trigger.
--
-- The client-side fallback in contexts/ProfileContext.tsx auto-creates a profile
-- the first time a logged-in user lands on a ProfileProvider-wrapped page; that
-- stays in place as defense-in-depth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Profile row. Only user_id and user_type are required; all other columns
  -- have defaults (welcome_email_sent, newsletter_unsubscribe_token, etc.).
  INSERT INTO public.profiles (
    user_id,
    first_name,
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker'),
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Notification preferences. application_notification_frequency has DEFAULT
  -- 'immediate' (added in 20260328), so we don't set it here.
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
    NEW.id,
    true,
    false,
    false,
    true,
    false,
    true,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates a profile and notification preferences row when an auth.users row becomes confirmed (email_confirmed_at IS NOT NULL). Restored 2026-05-02.';

-- Single trigger covering both confirmation paths:
--   * OAuth signup -> INSERT with email_confirmed_at already set
--   * Email signup -> UPDATE that sets email_confirmed_at from NULL to a timestamp
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

NOTIFY pgrst, 'reload schema';
