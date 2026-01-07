-- Merge iCare duplicate companies
-- Keep: "iCare" with ID starting "701c97c5"
-- Delete: "iCare External"

DO $$
DECLARE
    keep_company_id UUID;
    delete_company_id UUID;
    jobs_count INT;
    keep_company_name TEXT;
    delete_company_name TEXT;
BEGIN
    -- Get the company IDs by prefix/name
    SELECT id, name INTO keep_company_id, keep_company_name
    FROM companies
    WHERE id::text LIKE '701c97c5%'
    LIMIT 1;

    SELECT id, name INTO delete_company_id, delete_company_name
    FROM companies
    WHERE name = 'iCare External'
    LIMIT 1;

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "701c97c5" not found';
    END IF;

    IF delete_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "iCare External" not found';
    END IF;

    -- Count jobs for the duplicate
    SELECT COUNT(*) INTO jobs_count FROM jobs WHERE company_id = delete_company_id;

    RAISE NOTICE 'Found duplicate "%" (ID: %) with % jobs', delete_company_name, delete_company_id, jobs_count;
    RAISE NOTICE 'Keeping "%" (ID: %)', keep_company_name, keep_company_id;

    -- Update jobs to point to the kept company
    UPDATE jobs
    SET company_id = keep_company_id
    WHERE company_id = delete_company_id;

    RAISE NOTICE 'Updated % jobs from "%" to "%"', jobs_count, delete_company_name, keep_company_name;

    -- Delete the duplicate company
    DELETE FROM companies WHERE id = delete_company_id;

    RAISE NOTICE 'Deleted duplicate company "%"', delete_company_name;
    RAISE NOTICE 'Migration complete! Kept company with ID: %', keep_company_id;
END $$;
