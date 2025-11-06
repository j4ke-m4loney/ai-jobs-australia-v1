-- Create newsletter_campaigns table to track sent newsletters
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipient_count INTEGER NOT NULL DEFAULT 0,
    jobs_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'scheduled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on sent_at for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at
ON public.newsletter_campaigns(sent_at DESC);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status
ON public.newsletter_campaigns(status);

-- Add RLS policies
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin can view all campaigns
CREATE POLICY "Admins can view all newsletter campaigns"
ON public.newsletter_campaigns
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Admin can insert campaigns
CREATE POLICY "Admins can insert newsletter campaigns"
ON public.newsletter_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_type = 'admin'
    )
);

-- Comment on table
COMMENT ON TABLE public.newsletter_campaigns IS 'Tracks newsletter campaigns sent via Resend';
