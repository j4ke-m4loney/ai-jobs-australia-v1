-- Add foreign key relationship between jobs and companies tables
-- This enables automatic joins via PostgREST

-- First, let's check if the constraint already exists and drop it if it does
-- (in case this migration is run multiple times)
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS fk_jobs_company;

-- Add the foreign key constraint
-- This creates the relationship that PostgREST needs to perform automatic joins
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_company 
FOREIGN KEY (company_id) 
REFERENCES companies(id)
ON DELETE SET NULL  -- If a company is deleted, set the job's company_id to NULL
ON UPDATE CASCADE;  -- If a company's ID changes, update the job's company_id

-- Add an index on company_id for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);

-- Grant necessary permissions (if not already granted)
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON companies TO anon;

-- Add a comment to document the relationship
COMMENT ON CONSTRAINT fk_jobs_company ON jobs IS 'Links jobs to their associated company';