-- Merge PwC duplicate companies
-- Keep: "PwC" with ID starting "b14c2020"
-- Delete: "Pwc" with ID starting "f9506a97"
-- Delete: "PwC Australia" with ID starting "087939a1"

DO $$
DECLARE
    keep_company_id UUID;
    delete_company1_id UUID;
    delete_company2_id UUID;
    jobs_count_1 INT;
    jobs_count_2 INT;
    keep_company_name TEXT;
    delete_company1_name TEXT;
    delete_company2_name TEXT;
BEGIN
    -- Get the company IDs by prefix
    SELECT id, name INTO keep_company_id, keep_company_name
    FROM companies
    WHERE id::text LIKE 'b14c2020%'
    LIMIT 1;

    SELECT id, name INTO delete_company1_id, delete_company1_name
    FROM companies
    WHERE id::text LIKE 'f9506a97%'
    LIMIT 1;

    SELECT id, name INTO delete_company2_id, delete_company2_name
    FROM companies
    WHERE id::text LIKE '087939a1%'
    LIMIT 1;

    -- Check if kept company exists
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company with ID starting "b14c2020" not found';
    END IF;

    RAISE NOTICE 'Keeping "%" (ID: %)', keep_company_name, keep_company_id;

    -- Handle first duplicate (Pwc)
    IF delete_company1_id IS NOT NULL THEN
        -- Count jobs for the duplicate
        SELECT COUNT(*) INTO jobs_count_1 FROM jobs WHERE company_id = delete_company1_id;

        RAISE NOTICE 'Found duplicate "%" (ID: %) with % jobs', delete_company1_name, delete_company1_id, jobs_count_1;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company1_id;

        RAISE NOTICE 'Updated % jobs from "%" to "PwC"', jobs_count_1, delete_company1_name;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company1_id;

        RAISE NOTICE 'Deleted duplicate company "%"', delete_company1_name;
    ELSE
        RAISE NOTICE 'Company with ID starting "f9506a97" not found - skipping';
    END IF;

    -- Handle second duplicate (PwC Australia)
    IF delete_company2_id IS NOT NULL THEN
        -- Count jobs for the duplicate
        SELECT COUNT(*) INTO jobs_count_2 FROM jobs WHERE company_id = delete_company2_id;

        RAISE NOTICE 'Found duplicate "%" (ID: %) with % jobs', delete_company2_name, delete_company2_id, jobs_count_2;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company2_id;

        RAISE NOTICE 'Updated % jobs from "%" to "PwC"', jobs_count_2, delete_company2_name;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company2_id;

        RAISE NOTICE 'Deleted duplicate company "%"', delete_company2_name;
    ELSE
        RAISE NOTICE 'Company with ID starting "087939a1" not found - skipping';
    END IF;

    RAISE NOTICE 'Migration complete! Kept "PwC" (ID: %)', keep_company_id;
END $$;
