-- Add newsletter_unsubscribe_token to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_unsubscribe_token
ON public.profiles(newsletter_unsubscribe_token);

-- Create function to generate token for existing users
CREATE OR REPLACE FUNCTION generate_missing_unsubscribe_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.profiles
    SET newsletter_unsubscribe_token = gen_random_uuid()
    WHERE newsletter_unsubscribe_token IS NULL;
END;
$$;

-- Generate tokens for all existing users
SELECT generate_missing_unsubscribe_tokens();

-- Create trigger to auto-generate token on new profile creation
CREATE OR REPLACE FUNCTION auto_generate_unsubscribe_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.newsletter_unsubscribe_token IS NULL THEN
        NEW.newsletter_unsubscribe_token = gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_unsubscribe_token
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_unsubscribe_token();

-- Comment on column
COMMENT ON COLUMN public.profiles.newsletter_unsubscribe_token IS 'Unique token for one-click newsletter unsubscribe';
