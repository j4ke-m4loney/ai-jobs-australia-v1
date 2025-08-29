-- Remove all foreign key constraints for testing purposes
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_company_id_fkey;
-- Insert simple mock jobs for testing
INSERT INTO jobs (
    title,
    description,
    location,
    salary_min,
    salary_max,
    employer_id,
    status,
    category,
    application_method,
    application_email
  )
VALUES (
    'Senior Machine Learning Engineer',
    'Join our AI team to develop cutting-edge machine learning models for autonomous systems.',
    'Sydney, NSW',
    120000,
    180000,
    gen_random_uuid(),
    'approved',
    'ai',
    'external',
    'careers@techflow-ai.com'
  ),
  (
    'Data Scientist - Real-time Analytics',
    'Drive data-driven decision making through advanced analytics and real-time insights.',
    'Melbourne, VIC',
    95000,
    140000,
    gen_random_uuid(),
    'approved',
    'ai',
    'external',
    'jobs@datasync.io'
  ),
  (
    'AI Research Scientist',
    'Lead groundbreaking research in deep learning and neural networks.',
    'Brisbane, QLD',
    140000,
    200000,
    gen_random_uuid(),
    'approved',
    'ai',
    'external',
    'research@neuralnetworks.com'
  ),
  (
    'DevOps Engineer - Cloud Infrastructure',
    'Build and maintain the cloud infrastructure that powers our AI applications.',
    'Perth, WA',
    105000,
    155000,
    gen_random_uuid(),
    'approved',
    'ai',
    'external',
    'devops@cloudfirst.tech'
  ),
  (
    'Quantum Algorithm Developer',
    'Shape the future of computing by developing quantum algorithms for machine learning applications.',
    'Adelaide, SA',
    130000,
    190000,
    gen_random_uuid(),
    'approved',
    'ai',
    'external',
    'quantum-careers@quantumlabs.org'
  );