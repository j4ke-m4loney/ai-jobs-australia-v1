-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Ensure other fields exist (they should already be there but just in case)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skills TEXT[];

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience_level TEXT 
CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- Ensure user_documents table has proper indexes
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_document_type ON public.user_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_user_documents_is_default ON public.user_documents(is_default);