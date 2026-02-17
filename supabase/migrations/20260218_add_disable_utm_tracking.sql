ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS disable_utm_tracking BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.jobs.disable_utm_tracking IS 'When true, UTM tracking params are not appended to the application URL';
