-- Create newsletter_sponsors table for managing email sponsors
CREATE TABLE IF NOT EXISTS public.newsletter_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  tagline TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_newsletter_sponsors_active ON public.newsletter_sponsors(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_sponsors_default ON public.newsletter_sponsors(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_sponsors_display_order ON public.newsletter_sponsors(display_order);

-- Enable Row Level Security
ALTER TABLE public.newsletter_sponsors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read active sponsors
DROP POLICY IF EXISTS "Anyone can read active sponsors" ON public.newsletter_sponsors;
CREATE POLICY "Anyone can read active sponsors"
  ON public.newsletter_sponsors FOR SELECT
  USING (is_active = true);

-- RLS Policy: Admins can manage all sponsors
DROP POLICY IF EXISTS "Admins can manage sponsors" ON public.newsletter_sponsors;
CREATE POLICY "Admins can manage sponsors"
  ON public.newsletter_sponsors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_newsletter_sponsors_updated_at ON public.newsletter_sponsors;
CREATE TRIGGER update_newsletter_sponsors_updated_at
  BEFORE UPDATE ON public.newsletter_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default sponsor at a time
CREATE OR REPLACE FUNCTION ensure_single_default_sponsor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Set all other sponsors' is_default to false
    UPDATE public.newsletter_sponsors
    SET is_default = false
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce single default sponsor
DROP TRIGGER IF EXISTS ensure_single_default_sponsor_trigger ON public.newsletter_sponsors;
CREATE TRIGGER ensure_single_default_sponsor_trigger
  BEFORE INSERT OR UPDATE ON public.newsletter_sponsors
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_sponsor();

-- Add comments for documentation
COMMENT ON TABLE public.newsletter_sponsors IS 'Sponsors for newsletter campaigns';
COMMENT ON COLUMN public.newsletter_sponsors.name IS 'Sponsor company name';
COMMENT ON COLUMN public.newsletter_sponsors.logo_url IS 'URL to sponsor logo image';
COMMENT ON COLUMN public.newsletter_sponsors.destination_url IS 'Click destination URL';
COMMENT ON COLUMN public.newsletter_sponsors.tagline IS 'Optional tagline or description';
COMMENT ON COLUMN public.newsletter_sponsors.is_active IS 'Enable/disable sponsor without deleting';
COMMENT ON COLUMN public.newsletter_sponsors.is_default IS 'If true, this sponsor will be used when no sponsor is explicitly selected';
COMMENT ON COLUMN public.newsletter_sponsors.display_order IS 'For future multi-sponsor features';
COMMENT ON COLUMN public.newsletter_sponsors.metadata IS 'Additional sponsor data (e.g., campaign tracking, notes)';
