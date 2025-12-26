-- Add sponsor tracking to newsletter_campaigns table
-- Note: With multi-placement design, the same sponsor appears in 3 locations (header, main card, footer)
-- so we only need to track which sponsor was used, not the placement
ALTER TABLE public.newsletter_campaigns
ADD COLUMN sponsor_id UUID REFERENCES public.newsletter_sponsors(id) ON DELETE SET NULL;

-- Create index for analytics and filtering
CREATE INDEX idx_newsletter_campaigns_sponsor ON public.newsletter_campaigns(sponsor_id);

-- Add comments for documentation
COMMENT ON COLUMN public.newsletter_campaigns.sponsor_id IS 'The sponsor shown in this campaign (NULL if none). Sponsor appears in 3 placements: header, main card, and footer.';
