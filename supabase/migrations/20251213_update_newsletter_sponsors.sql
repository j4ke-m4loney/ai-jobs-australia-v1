-- Add rich content fields for enhanced sponsor display
-- This enables multi-placement sponsor showcase (header, main card, footer)

ALTER TABLE public.newsletter_sponsors
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Learn More',
ADD COLUMN IF NOT EXISTS cta_color TEXT DEFAULT '#009306';

-- Update comments for documentation
COMMENT ON COLUMN public.newsletter_sponsors.hero_image_url IS 'Large hero/product image for main sponsor card (recommended: 1200x600px)';
COMMENT ON COLUMN public.newsletter_sponsors.headline IS 'Bold headline for main sponsor card (e.g., "Create Decks That Impress")';
COMMENT ON COLUMN public.newsletter_sponsors.description IS 'Rich description text, can include multiple paragraphs';
COMMENT ON COLUMN public.newsletter_sponsors.cta_text IS 'Call-to-action button text (e.g., "Try for Free!")';
COMMENT ON COLUMN public.newsletter_sponsors.cta_color IS 'Hex color for CTA button (e.g., #009306)';
