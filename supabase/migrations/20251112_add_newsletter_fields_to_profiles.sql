-- Add email and newsletter_subscribed columns to profiles table
-- This migration enables newsletter functionality for all users

-- Step 1: Add email column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Add newsletter_subscribed column (default true for opt-out model)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT true;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_subscribed
ON public.profiles(newsletter_subscribed)
WHERE newsletter_subscribed = true;

-- Step 4: Backfill email addresses from auth.users for existing users
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND profiles.email IS NULL;

-- Step 5: Set all existing users to subscribed (per requirements)
UPDATE public.profiles
SET newsletter_subscribed = true
WHERE newsletter_subscribed IS NULL;

-- Step 6: Create function to auto-sync email on profile insert/update
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Get email from auth.users
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- If newsletter_subscribed is not set, default to true
    IF NEW.newsletter_subscribed IS NULL THEN
        NEW.newsletter_subscribed := true;
    END IF;

    RETURN NEW;
END;
$$;

-- Step 7: Create trigger to auto-sync email on profile insert
DROP TRIGGER IF EXISTS trigger_sync_profile_email ON public.profiles;

CREATE TRIGGER trigger_sync_profile_email
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_email();

-- Step 8: Add comment for documentation
COMMENT ON COLUMN public.profiles.email IS 'User email address synced from auth.users. Used for newsletter delivery.';
COMMENT ON COLUMN public.profiles.newsletter_subscribed IS 'Whether user is subscribed to weekly newsletter (opt-out model, defaults to true).';
