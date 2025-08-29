-- Drop all foreign key constraints temporarily for testing
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_company_id_fkey;
-- Insert 5 simple mock jobs for testing
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
    'Join our AI team to develop cutting-edge machine learning models. Work on computer vision, NLP, and reinforcement learning projects.',
    'Sydney, NSW',
    120000,
    180000,
    gen_random_uuid(),
    'approved',
    'careers@techflow-ai.com'
  ),
  (
    'Data Scientist - Analytics',
    'Drive data-driven decisions through advanced analytics. Build predictive models and create actionable business intelligence dashboards.',
    'Melbourne, VIC',
    95000,
    140000,
    gen_random_uuid(),
    'approved',
    'jobs@datasync.io'
  ),
  (
    'AI Research Scientist',
    'Lead groundbreaking research in deep learning and neural networks. Opportunity to publish work and collaborate with top universities.',
    'Brisbane, QLD',
    140000,
    200000,
    gen_random_uuid(),
    'approved',
    'research@neuralnetworks.com'
  ),
  (
    'DevOps Engineer - Cloud',
    'Build and maintain cloud infrastructure that powers AI applications. Work with Kubernetes, Docker, and modern CI/CD pipelines.',
    'Perth, WA',
    105000,
    155000,
    gen_random_uuid(),
    'approved',
    'devops@cloudfirst.tech'
  ),
  (
    'Quantum Algorithm Developer',
    'Shape the future of computing by developing quantum algorithms for machine learning applications. Work with cutting-edge quantum hardware.',
    'Adelaide, SA',
    130000,
    190000,
    gen_random_uuid(),
    'approved',
    'quantum@quantumlabs.org'
  );