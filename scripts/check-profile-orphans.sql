-- Quick health check for the handle_new_user() trigger.
-- Run periodically (or save as a Supabase saved query) to detect
-- silent trigger failures before they pile up.
--
-- Counts only CONFIRMED auth users without a profile. Unconfirmed signups are
-- abandoned/bot signups and intentionally have no profile row — ignoring them
-- here means this check stays at 0 in steady state.
--
-- Expected output: confirmed_orphan_count = 0. Anything > 0 means the trigger
-- is failing for confirmed signups — investigate immediately.

SELECT
  (SELECT count(*) FROM auth.users) AS total_auth_users,
  (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) AS confirmed_auth_users,
  (SELECT count(*) FROM public.profiles) AS total_profiles,
  (SELECT count(*) FROM auth.users au
     LEFT JOIN public.profiles p ON p.user_id = au.id
     WHERE p.user_id IS NULL
       AND au.email_confirmed_at IS NOT NULL) AS confirmed_orphan_count;

-- If confirmed_orphan_count > 0, the query below shows which users are affected
-- and when they signed up — useful for narrowing down what schema or
-- code change broke the trigger.
SELECT
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'user_type' AS user_type,
  au.raw_app_meta_data->>'provider' AS provider
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC
LIMIT 50;
