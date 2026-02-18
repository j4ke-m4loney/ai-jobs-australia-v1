-- Convert job_type from TEXT to TEXT[] (array) to support multiple job types per listing
-- e.g. a job can be both "part-time" and "internship"

-- Step 1: Drop existing CHECK constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;

-- Step 2: Drop existing default (TEXT default can't auto-cast to TEXT[])
ALTER TABLE public.jobs ALTER COLUMN job_type DROP DEFAULT;

-- Step 3: Convert column from TEXT to TEXT[] using existing value as single-element array
ALTER TABLE public.jobs
  ALTER COLUMN job_type TYPE TEXT[]
  USING ARRAY[job_type];

-- Step 4: Set default to a single-element array
ALTER TABLE public.jobs
  ALTER COLUMN job_type SET DEFAULT ARRAY['full-time']::TEXT[];

-- Step 5: Add new CHECK constraint validating each array element
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_job_type_check CHECK (
  job_type <@ ARRAY[
    'full-time',
    'part-time',
    'permanent',
    'fixed-term',
    'subcontract',
    'casual',
    'temp-to-perm',
    'contract',
    'volunteer',
    'internship',
    'graduate'
  ]::TEXT[]
);
