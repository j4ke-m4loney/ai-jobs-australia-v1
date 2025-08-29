-- Check constraint status and remove employer_id foreign key if it exists
DO $$ BEGIN -- Try to drop the employer_id foreign key constraint
IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'jobs_employer_id_fkey'
    AND conrelid = 'jobs'::regclass
) THEN
ALTER TABLE jobs DROP CONSTRAINT jobs_employer_id_fkey;
END IF;
END $$;
-- Now insert mock jobs
INSERT INTO jobs (
    title,
    description,
    location,
    salary_min,
    salary_max,
    employer_id,
    status,
    application_email
  )
VALUES (
    'Senior Machine Learning Engineer',
    'Join our AI team to develop cutting-edge machine learning models.',
    'Sydney, NSW',
    120000,
    180000,
    gen_random_uuid(),
    'approved',
    'careers@example.com'
  ),
  (
    'Data Scientist',
    'Drive data-driven decisions through advanced analytics.',
    'Melbourne, VIC',
    95000,
    140000,
    gen_random_uuid(),
    'approved',
    'jobs@example.com'
  ),
  (
    'AI Research Scientist',
    'Lead groundbreaking research in deep learning.',
    'Brisbane, QLD',
    140000,
    200000,
    gen_random_uuid(),
    'approved',
    'research@example.com'
  ),
  (
    'DevOps Engineer',
    'Build and maintain cloud infrastructure.',
    'Perth, WA',
    105000,
    155000,
    gen_random_uuid(),
    'approved',
    'devops@example.com'
  ),
  (
    'Quantum Developer',
    'Shape the future of computing with quantum algorithms.',
    'Adelaide, SA',
    130000,
    190000,
    gen_random_uuid(),
    'approved',
    'quantum@example.com'
  );