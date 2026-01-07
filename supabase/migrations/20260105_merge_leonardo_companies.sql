-- Merge Leonardo.AI duplicate companies
-- Keep: "Leonardo.AI" (capital I)
-- Delete: "Leonardo.Ai" (lowercase i)

DO $$
DECLARE
    keep_company_id UUID;
    delete_company_id UUID;
    jobs_count INT;
BEGIN
    -- Get the company IDs - exact match for capital I
    SELECT id INTO keep_company_id FROM companies WHERE name = 'Leonardo.AI';

    -- Get the duplicate with lowercase i
    SELECT id INTO delete_company_id FROM companies WHERE name = 'Leonardo.Ai';

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "Leonardo.AI" (capital I) not found';
    END IF;

    IF delete_company_id IS NOT NULL THEN
        -- Count jobs for the duplicate
        SELECT COUNT(*) INTO jobs_count FROM jobs WHERE company_id = delete_company_id;

        RAISE NOTICE 'Found "Leonardo.Ai" (lowercase i) (ID: %) with % jobs', delete_company_id, jobs_count;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company_id;

        RAISE NOTICE 'Updated % jobs from "Leonardo.Ai" to "Leonardo.AI"', jobs_count;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company_id;

        RAISE NOTICE 'Deleted company "Leonardo.Ai" (lowercase i)';
    ELSE
        RAISE NOTICE 'Company "Leonardo.Ai" (lowercase i) not found - skipping';
    END IF;

    RAISE NOTICE 'Migration complete! Kept "Leonardo.AI" (capital I) (ID: %)', keep_company_id;
END $$;
