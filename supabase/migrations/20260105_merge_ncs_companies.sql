-- Merge NCS duplicate companies
-- Keep: "NCS Group Australia"
-- Delete: "NCS Australia", "NCS Australia Group"

-- First, let's see what we're working with (for verification)
DO $$
DECLARE
    keep_company_id UUID;
    delete_company1_id UUID;
    delete_company2_id UUID;
    jobs_count_1 INT;
    jobs_count_2 INT;
BEGIN
    -- Get the company IDs
    SELECT id INTO keep_company_id FROM companies WHERE name = 'NCS Group Australia';
    SELECT id INTO delete_company1_id FROM companies WHERE name = 'NCS Australia';
    SELECT id INTO delete_company2_id FROM companies WHERE name = 'NCS Australia Group';

    -- Check if companies exist
    IF keep_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "NCS Group Australia" not found';
    END IF;

    IF delete_company1_id IS NOT NULL THEN
        -- Count jobs for NCS Australia
        SELECT COUNT(*) INTO jobs_count_1 FROM jobs WHERE company_id = delete_company1_id;

        RAISE NOTICE 'Found "NCS Australia" (ID: %) with % jobs', delete_company1_id, jobs_count_1;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company1_id;

        RAISE NOTICE 'Updated % jobs from "NCS Australia" to "NCS Group Australia"', jobs_count_1;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company1_id;

        RAISE NOTICE 'Deleted company "NCS Australia"';
    ELSE
        RAISE NOTICE 'Company "NCS Australia" not found - skipping';
    END IF;

    IF delete_company2_id IS NOT NULL THEN
        -- Count jobs for NCS Australia Group
        SELECT COUNT(*) INTO jobs_count_2 FROM jobs WHERE company_id = delete_company2_id;

        RAISE NOTICE 'Found "NCS Australia Group" (ID: %) with % jobs', delete_company2_id, jobs_count_2;

        -- Update jobs to point to the kept company
        UPDATE jobs
        SET company_id = keep_company_id
        WHERE company_id = delete_company2_id;

        RAISE NOTICE 'Updated % jobs from "NCS Australia Group" to "NCS Group Australia"', jobs_count_2;

        -- Delete the duplicate company
        DELETE FROM companies WHERE id = delete_company2_id;

        RAISE NOTICE 'Deleted company "NCS Australia Group"';
    ELSE
        RAISE NOTICE 'Company "NCS Australia Group" not found - skipping';
    END IF;

    RAISE NOTICE 'Migration complete! Kept "NCS Group Australia" (ID: %)', keep_company_id;
END $$;
