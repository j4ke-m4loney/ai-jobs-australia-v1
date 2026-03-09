-- Create a storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for company logos
-- Allow anyone to read company logos (public bucket)
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Allow authenticated users to upload company logos
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- Allow admins to update company logos
CREATE POLICY "Admins can update company logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Allow admins to delete company logos
CREATE POLICY "Admins can delete company logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);
