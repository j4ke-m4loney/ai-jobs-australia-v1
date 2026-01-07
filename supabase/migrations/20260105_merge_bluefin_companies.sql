-- Merge BlueFin duplicate companies and rename
-- Keep: "BlueFin" with ID starting "623d337c" (will be renamed to "BlueFin Resources")
-- Delete: "Bluefin Company Limited" with ID starting "629d2405"

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
    WHERE id::text LIKE '623d337c%'
    LIMIT 1;

    SELECT id, name INTO delete_company_id, delete_company_name
    FROM companies
    WHERE id::text LIKE '629d2405%'
    LIMIT 1;

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "623d337c" not found';
    END IF;

    IF delete_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "629d2405" not found';
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

    -- Rename the kept company to "BlueFin Resources"
    UPDATE companies
    SET name = 'BlueFin Resources'
    WHERE id = keep_company_id;

    RAISE NOTICE 'Renamed "%" to "BlueFin Resources"', keep_company_name;
    RAISE NOTICE 'Migration complete! Kept company with ID: % (now named "BlueFin Resources")', keep_company_id;
END $$;
