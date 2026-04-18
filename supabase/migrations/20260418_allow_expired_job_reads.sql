-- Allow public/anon readers to SELECT expired jobs so their detail pages can
-- stay indexable on Google. Previously the read policy restricted access to
-- `status = 'approved'`, which meant expired job URLs returned empty from
-- Supabase and the /jobs/[id] route 404'd — causing Google to de-index the
-- pages and costing referral traffic.
--
-- Only 'approved' and 'expired' are public. 'pending', 'rejected', and
-- 'needs_review' stay hidden from anonymous readers (admins and the job's
-- own employer keep their separate full-access policies).

-- Drop any of the overlapping "approved-only" read policies created across
-- earlier migrations. IF EXISTS makes this idempotent.
DROP POLICY IF EXISTS "Approved jobs are viewable by everyone"        ON public.jobs;
DROP POLICY IF EXISTS "Approved jobs are viewable by authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can view approved jobs"                 ON public.jobs;

-- Single replacement policy covering anon + authenticated for the two
-- public statuses, plus the employer-owns-this-row escape hatch that the
-- previous policy already included.
CREATE POLICY "Public jobs are viewable by everyone" ON public.jobs
FOR SELECT
USING (
  status IN ('approved', 'expired')
  OR auth.uid() = employer_id
);

-- Refresh PostgREST's schema cache so the new policy takes effect immediately.
NOTIFY pgrst, 'reload schema';
