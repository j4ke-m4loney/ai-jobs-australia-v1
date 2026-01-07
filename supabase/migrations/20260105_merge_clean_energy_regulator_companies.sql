-- Merge Clean Energy Regulator duplicate companies
-- Keep: Company with ID starting "79c5bedf"
-- Delete: Company with ID starting "2a3dc986"

DO $$
DECLARE
    keep_company_id UUID;
    delete_company_id UUID;
    jobs_count INT;
    keep_company_name TEXT;
    delete_company_name TEXT;
BEGIN
    -- Get the company IDs by prefix
    SELECT id, name INTO keep_company_id, keep_company_name
    FROM companies
    WHERE id::text LIKE '79c5bedf%'
    LIMIT 1;

    SELECT id, name INTO delete_company_id, delete_company_name
    FROM companies
    WHERE id::text LIKE '2a3dc986%'
    LIMIT 1;

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "79c5bedf" not found';
    END IF;

    IF delete_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "2a3dc986" not found';
    END IF;

    -- Count jobs for the duplicate
    SELECT COUNT(*) INTO jobs_count FROM jobs WHERE company_id = delete_company_id;

    RAISE NOTICE 'Found duplicate "%" (ID: %) with % jobs', delete_company_name, delete_company_id, jobs_count;
    RAISE NOTICE 'Keeping "%" (ID: %)', keep_company_name, keep_company_id;

    -- Update jobs to point to the kept company
    UPDATE jobs
    SET company_id = keep_company_id
    WHERE company_id = delete_company_id;

    RAISE NOTICE 'Updated % jobs from duplicate to kept company', jobs_count;

    -- Delete the duplicate company
    DELETE FROM companies WHERE id = delete_company_id;

    RAISE NOTICE 'Deleted duplicate company "%"', delete_company_name;
    RAISE NOTICE 'Migration complete! Kept company with ID: %', keep_company_id;
END $$;
