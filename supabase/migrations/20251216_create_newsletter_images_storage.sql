-- Create newsletter images storage bucket
-- Stores sponsor logos, hero images, and other newsletter-related images
-- Organized in folders: sponsor-logos/, sponsor-heroes/

INSERT INTO storage.buckets (id, name, public)
VALUES ('newsletter-images', 'newsletter-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Anyone can view newsletter images (public bucket)
CREATE POLICY "Anyone can view newsletter images"
ON storage.objects FOR SELECT
USING (bucket_id = 'newsletter-images');

-- RLS Policy: Authenticated users can upload newsletter images
CREATE POLICY "Authenticated users can upload newsletter images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'newsletter-images'
  AND auth.role() = 'authenticated'
);

-- RLS Policy: Admins can update newsletter images
CREATE POLICY "Admins can update newsletter images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'newsletter-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- RLS Policy: Admins can delete newsletter images
CREATE POLICY "Admins can delete newsletter images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'newsletter-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);
