-- Add suburb and state columns to jobs table for better location handling

-- Add new columns for structured location data
ALTER TABLE public.jobs 
ADD COLUMN suburb TEXT,
ADD COLUMN state TEXT;

-- Add index on state for efficient filtering
CREATE INDEX IF NOT EXISTS idx_jobs_state ON public.jobs(state);

-- Add index on suburb for search performance  
CREATE INDEX IF NOT EXISTS idx_jobs_suburb ON public.jobs(suburb);

-- Add a computed column that combines suburb and state for display
-- This will be used as fallback and for consistent formatting
ALTER TABLE public.jobs 
ADD COLUMN location_display TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN suburb IS NOT NULL AND state IS NOT NULL THEN suburb || ', ' || state
    WHEN suburb IS NOT NULL THEN suburb
    WHEN state IS NOT NULL THEN state
    ELSE location
  END
) STORED;

-- Update existing records to parse location where possible
-- This is a best-effort attempt to extract suburb and state from existing location strings
UPDATE public.jobs 
SET 
  suburb = CASE 
    WHEN location ~ '^[^,]+,\s*[A-Z]{2,3}$' THEN TRIM(SPLIT_PART(location, ',', 1))
    ELSE NULL
  END,
  state = CASE 
    WHEN location ~ '^[^,]+,\s*[A-Z]{2,3}$' THEN TRIM(SPLIT_PART(location, ',', 2))
    ELSE NULL
  END
WHERE location IS NOT NULL;

-- Add comment to document the new structure
COMMENT ON COLUMN public.jobs.suburb IS 'Suburb/city name extracted from location';
COMMENT ON COLUMN public.jobs.state IS 'State abbreviation (e.g., VIC, NSW, QLD)';
COMMENT ON COLUMN public.jobs.location_display IS 'Computed column showing suburb, state format for display';