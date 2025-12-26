-- Add broadcast_id column to newsletter_campaigns table
-- This stores the Resend Broadcast ID for tracking analytics

ALTER TABLE public.newsletter_campaigns
ADD COLUMN IF NOT EXISTS broadcast_id TEXT;

COMMENT ON COLUMN public.newsletter_campaigns.broadcast_id
IS 'Resend Broadcast ID for tracking analytics and campaign performance';

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_broadcast_id
ON public.newsletter_campaigns(broadcast_id);
