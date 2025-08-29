-- Create storage buckets for resumes and cover letters
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false),
  ('cover-letters', 'cover-letters', false);
-- Create table for managing user documents
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'cover_letter')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
-- Create policies for user documents
CREATE POLICY "Users can view their own documents" ON public.user_documents FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.user_documents FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.user_documents FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.user_documents FOR DELETE USING (auth.uid() = user_id);
-- Create storage policies for resumes
CREATE POLICY "Users can view their own resumes" ON storage.objects FOR
SELECT USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can upload their own resumes" ON storage.objects FOR
INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can update their own resumes" ON storage.objects FOR
UPDATE USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can delete their own resumes" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- Create storage policies for cover letters
CREATE POLICY "Users can view their own cover letters" ON storage.objects FOR
SELECT USING (
    bucket_id = 'cover-letters'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can upload their own cover letters" ON storage.objects FOR
INSERT WITH CHECK (
    bucket_id = 'cover-letters'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can update their own cover letters" ON storage.objects FOR
UPDATE USING (
    bucket_id = 'cover-letters'
    AND auth.uid()::text = (storage.foldername(name)) [1]
  );
CREATE POLICY "Users can delete their own cover letters" ON storage.objects FOR DELETE USING (
  bucket_id = 'cover-letters'
  AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_documents_updated_at BEFORE
UPDATE ON public.user_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();