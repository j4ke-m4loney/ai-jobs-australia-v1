-- Add automatic Resend Audience sync for new subscribers
-- This migration enables automatic syncing of new newsletter subscribers to Resend Audiences

-- Step 1: Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Create function to sync subscriber to Resend Audience
CREATE OR REPLACE FUNCTION public.sync_subscriber_to_resend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resend_api_key TEXT;
  resend_audience_id TEXT;
  request_id BIGINT;
BEGIN
  -- Only sync if user is subscribed to newsletter and has an email
  IF NEW.newsletter_subscribed = true AND NEW.email IS NOT NULL THEN

    -- Get Resend API credentials from Supabase Vault
    SELECT decrypted_secret INTO resend_api_key
    FROM vault.decrypted_secrets
    WHERE name = 'app.settings.resend_api_key';

    SELECT decrypted_secret INTO resend_audience_id
    FROM vault.decrypted_secrets
    WHERE name = 'app.settings.resend_audience_id';

    -- Only proceed if credentials are configured
    IF resend_api_key IS NOT NULL AND resend_audience_id IS NOT NULL THEN

      -- Make async HTTP POST to Resend API to create contact
      SELECT INTO request_id net.http_post(
        url := 'https://api.resend.com/audiences/' || resend_audience_id || '/contacts',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || resend_api_key
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'first_name', COALESCE(NEW.first_name, ''),
          'unsubscribed', false
        )
      );

      -- Log the sync attempt (optional, for debugging)
      RAISE NOTICE 'Syncing subscriber to Resend: % (request_id: %)', NEW.email, request_id;

    ELSE
      RAISE WARNING 'Resend credentials not configured - skipping audience sync';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Step 3: Create trigger to sync new subscribers to Resend
-- This fires AFTER the profile is inserted, so email is already synced
DROP TRIGGER IF EXISTS trigger_sync_resend_audience ON public.profiles;

CREATE TRIGGER trigger_sync_resend_audience
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_subscriber_to_resend();

-- Step 4: Also handle updates to newsletter_subscribed
-- If user resubscribes, sync them back to Resend
CREATE OR REPLACE FUNCTION public.sync_subscriber_update_to_resend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resend_api_key TEXT;
  resend_audience_id TEXT;
  request_id BIGINT;
BEGIN
  -- Only sync if newsletter_subscribed changed from false to true (resubscribe)
  IF OLD.newsletter_subscribed = false AND NEW.newsletter_subscribed = true AND NEW.email IS NOT NULL THEN

    -- Get Resend API credentials from Supabase Vault
    SELECT decrypted_secret INTO resend_api_key
    FROM vault.decrypted_secrets
    WHERE name = 'app.settings.resend_api_key';

    SELECT decrypted_secret INTO resend_audience_id
    FROM vault.decrypted_secrets
    WHERE name = 'app.settings.resend_audience_id';

    -- Only proceed if credentials are configured
    IF resend_api_key IS NOT NULL AND resend_audience_id IS NOT NULL THEN

      -- Make async HTTP POST to Resend API to create/update contact
      SELECT INTO request_id net.http_post(
        url := 'https://api.resend.com/audiences/' || resend_audience_id || '/contacts',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || resend_api_key
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'first_name', COALESCE(NEW.first_name, ''),
          'unsubscribed', false
        )
      );

      RAISE NOTICE 'Re-syncing subscriber to Resend: % (request_id: %)', NEW.email, request_id;

    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Step 5: Create trigger for resubscribes
DROP TRIGGER IF EXISTS trigger_sync_resend_resubscribe ON public.profiles;

CREATE TRIGGER trigger_sync_resend_resubscribe
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.newsletter_subscribed IS DISTINCT FROM NEW.newsletter_subscribed)
EXECUTE FUNCTION sync_subscriber_update_to_resend();

-- Step 6: Add helpful comments
COMMENT ON FUNCTION public.sync_subscriber_to_resend() IS 'Automatically syncs new newsletter subscribers to Resend Audience using pg_net HTTP requests';
COMMENT ON FUNCTION public.sync_subscriber_update_to_resend() IS 'Automatically syncs resubscribed users back to Resend Audience';
