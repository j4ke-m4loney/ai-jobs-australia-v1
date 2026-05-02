-- Backfill profile rows for CONFIRMED auth.users that have no matching profile.
--
-- Why "confirmed only": unconfirmed signups (email_confirmed_at IS NULL) are
-- abandoned accounts — users who never clicked the verification link, or bot/
-- typo signups. Creating profiles for them would inflate stats and pollute the
-- newsletter sync (which fires on every profile insert).
--
-- Mirrors the handle_new_user() trigger logic, but uses each auth user's
-- original created_at so the chart reflects them on the right date.
--
-- Run in three steps in Supabase SQL Editor. Review the preview before committing.

-- ============================================================
-- STEP 1 — Preview the confirmed orphans that will be backfilled
-- ============================================================
SELECT
  au.id AS user_id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'first_name' AS first_name,
  COALESCE(au.raw_user_meta_data->>'user_type', 'job_seeker') AS user_type,
  au.raw_app_meta_data->>'provider' AS provider
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at;

-- ============================================================
-- STEP 2 — Backfill profiles + notification preferences
-- Idempotent: ON CONFLICT DO NOTHING means safe to re-run.
-- Only touches confirmed orphans.
-- ============================================================
INSERT INTO public.profiles (user_id, first_name, user_type, created_at, updated_at)
SELECT
  au.id,
  au.raw_user_meta_data->>'first_name',
  COALESCE(au.raw_user_meta_data->>'user_type', 'job_seeker'),
  au.created_at,  -- preserve original signup time, not now()
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

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
SELECT
  au.id,
  true,   -- email_applications
  false,  -- email_job_views
  false,  -- email_weekly_reports
  true,   -- email_new_jobs
  false,  -- email_similar_jobs
  true,   -- email_application_updates
  false   -- email_promotions
FROM auth.users au
LEFT JOIN public.user_notification_preferences np ON np.user_id = au.id
WHERE np.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- STEP 3 — Verify zero remaining CONFIRMED orphans
-- (Unconfirmed orphans will still show; that's expected.)
-- ============================================================
SELECT
  (SELECT count(*) FROM auth.users) AS total_auth_users,
  (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) AS confirmed_auth_users,
  (SELECT count(*) FROM public.profiles) AS total_profiles,
  (SELECT count(*) FROM auth.users au
     LEFT JOIN public.profiles p ON p.user_id = au.id
     WHERE p.user_id IS NULL
       AND au.email_confirmed_at IS NOT NULL) AS confirmed_orphans_remaining,
  (SELECT count(*) FROM auth.users au
     LEFT JOIN public.profiles p ON p.user_id = au.id
     WHERE p.user_id IS NULL
       AND au.email_confirmed_at IS NULL) AS unconfirmed_orphans_ignored;
