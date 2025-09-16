-- Migration: User Type Management and Automatic Profile Creation
-- This migration ensures data consistency between auth.users and profiles table

-- 1. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    user_type,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'job_seeker'),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Migrate existing users who don't have profiles
INSERT INTO public.profiles (
  user_id,
  first_name,
  user_type,
  created_at,
  updated_at
)
SELECT 
  id,
  raw_user_meta_data->>'first_name',
  COALESCE(raw_user_meta_data->>'user_type', 'job_seeker'),
  COALESCE((raw_user_meta_data->>'created_at')::timestamptz, created_at, now()),
  now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Update any existing profiles that have NULL user_type
UPDATE public.profiles p
SET user_type = COALESCE(
  (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = p.user_id),
  'job_seeker'
)
WHERE user_type IS NULL;

-- 5. Drop existing policies for profiles to recreate them
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 6. Create new policy that prevents user_type changes
CREATE POLICY "Users can update their own profile except user_type" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  (OLD.user_type = NEW.user_type OR OLD.user_type IS NULL)
);

-- 7. Recreate insert policy (rarely needed due to trigger, but kept for manual cases)
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Add check constraint to ensure user_type is valid
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('job_seeker', 'employer', 'admin'));

-- 9. Make user_type NOT NULL now that all records have been populated
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;

-- 10. Create index for better performance on user_type queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 11. Add comment for documentation
COMMENT ON COLUMN public.profiles.user_type IS 'User role - set at signup and immutable. Determines access to employer vs job seeker features.';