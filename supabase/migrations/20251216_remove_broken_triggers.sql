-- Remove broken trigger-based Resend sync (doesn't work with Vault secrets)
-- We're replacing this with Database Webhooks + Edge Functions

-- Drop the triggers
DROP TRIGGER IF EXISTS trigger_sync_resend_audience ON public.profiles;
DROP TRIGGER IF EXISTS trigger_sync_resend_resubscribe ON public.profiles;

-- Drop the functions
DROP FUNCTION IF EXISTS public.sync_subscriber_to_resend();
DROP FUNCTION IF EXISTS public.sync_subscriber_update_to_resend();

-- Add comment explaining the new approach
COMMENT ON TABLE public.profiles IS 'User profiles table. Newsletter subscribers are automatically synced to Resend Audience via Database Webhooks calling Edge Functions.';
