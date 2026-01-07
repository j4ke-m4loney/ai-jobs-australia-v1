-- Merge Amazon Web Services duplicate companies
-- Keep: "Amazon Web Services"
-- Delete: "Amazon Web Services Australia Pty Ltd"

DO $$
DECLARE
    keep_company_id UUID;
    delete_company_id UUID;
    jobs_count INT;
BEGIN
    -- Get the company IDs - exact match
    SELECT id INTO keep_company_id FROM companies WHERE name = 'Amazon Web Services';

    -- Get the duplicate
    SELECT id INTO delete_company_id FROM companies WHERE name = 'Amazon Web Services Australia Pty Ltd';

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "Amazon Web Services" not found';
    END IF;

    IF delete_company_id IS NOT NULL THEN
        -- Count jobs for the duplicate
        SELECT COUNT(*) INTO jobs_count FROM jobs WHERE company_id = delete_company_id;

        RAISE NOTICE 'Found "Amazon Web Services Australia Pty Ltd" (ID: %) with % jobs', delete_company_id, jobs_count;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company_id;

        RAISE NOTICE 'Updated % jobs from "Amazon Web Services Australia Pty Ltd" to "Amazon Web Services"', jobs_count;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company_id;

        RAISE NOTICE 'Deleted company "Amazon Web Services Australia Pty Ltd"';
    ELSE
        RAISE NOTICE 'Company "Amazon Web Services Australia Pty Ltd" not found - skipping';
    END IF;

    RAISE NOTICE 'Migration complete! Kept "Amazon Web Services" (ID: %)', keep_company_id;
END $$;
