-- Fix RLS policies for saved_jobs table to allow any authenticated user to save jobs
-- This removes the restrictive user_type check that was causing 403 errors

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Job seekers can save jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Job seekers can view their saved jobs" ON public.saved_jobs;
DROP POLICY IF EXISTS "Job seekers can unsave jobs" ON public.saved_jobs;

-- Create new simplified policies that only check authentication
CREATE POLICY "Authenticated users can save jobs" 
ON public.saved_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved jobs" 
ON public.saved_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs" 
ON public.saved_jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add a policy for UPDATE if needed in future
CREATE POLICY "Users can update their own saved jobs" 
ON public.saved_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);