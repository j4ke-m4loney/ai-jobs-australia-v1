-- Update RLS policy to allow public viewing of approved jobs
DROP POLICY IF EXISTS "Approved jobs are viewable by authenticated users" ON public.jobs;
CREATE POLICY "Approved jobs are viewable by everyone" ON public.jobs FOR
SELECT USING (status = 'approved'::text);