-- Insert mock jobs using gen_random_uuid() for employer_id to avoid foreign key issues
INSERT INTO jobs (
    id,
    title,
    description,
    requirements,
    location,
    salary_min,
    salary_max,
    employer_id,
    company_id,
    status,
    job_type,
    location_type,
    category,
    application_method,
    application_email,
    expires_at
  )
VALUES (
    gen_random_uuid(),
    'Senior Machine Learning Engineer',
    'Join our AI team to develop cutting-edge machine learning models for autonomous systems. You''ll work on computer vision, natural language processing, and reinforcement learning projects that directly impact millions of users.

Key Responsibilities:
• Design and implement scalable ML pipelines
• Optimize model performance and deployment strategies
• Collaborate with cross-functional teams on AI initiatives
• Research and implement state-of-the-art algorithms
• Mentor junior engineers and contribute to technical decisions',
    'Requirements:
• 5+ years of experience in machine learning and data science
• Strong proficiency in Python, TensorFlow, PyTorch
• Experience with cloud platforms (AWS, GCP, Azure)
• PhD in Computer Science, Statistics, or related field preferred
• Publications in top-tier ML conferences (NIPS, ICML, etc.)
• Strong understanding of deep learning architectures
• Experience with MLOps and model deployment at scale',
    'Sydney, NSW',
    120000,
    180000,
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'approved',
    'full-time',
    'hybrid',
    'ai',
    'external',
    'careers@techflow-ai.com',
    now() + interval '25 days'
  ),
  (
    gen_random_uuid(),
    'Data Scientist - Real-time Analytics',
    'Drive data-driven decision making through advanced analytics and real-time insights. You''ll work with petabytes of data to build predictive models and create actionable business intelligence dashboards for our enterprise clients.

What you''ll do:
• Build and maintain real-time data processing pipelines
• Develop predictive models for business forecasting
• Create interactive dashboards and visualizations
• Work closely with product teams to identify opportunities
• Present findings to C-level executives and stakeholders',
    'What we''re looking for:
• 3+ years in data science or analytics roles
• Expert-level SQL and Python/R programming
• Experience with big data technologies (Spark, Kafka, Hadoop)
• Strong statistical analysis and A/B testing experience
• Business acumen and excellent communication skills
• Experience with Tableau, Power BI, or similar BI tools
• Knowledge of financial markets preferred',
    'Melbourne, VIC',
    95000,
    140000,
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002',
    'approved',
    'full-time',
    'onsite',
    'ai',
    'external',
    'jobs@datasync.io',
    now() + interval '20 days'
  ),
  (
    gen_random_uuid(),
    'AI Research Scientist',
    'Lead groundbreaking research in deep learning and neural networks. You''ll have the opportunity to publish your work, collaborate with top universities, and see your research translated into real-world applications that save lives in healthcare.

Research Areas:
• Medical imaging and diagnostic AI
• Natural language processing for clinical notes
• Federated learning for privacy-preserving AI
• Explainable AI for healthcare applications
• Multi-modal learning combining text, image, and sensor data',
    'Required Qualifications:
• PhD in Machine Learning, Computer Science, or related field
• 10+ publications in top-tier venues (Nature, Science, NIPS, etc.)
• 3+ years of industry or academic research experience
• Deep expertise in PyTorch, TensorFlow, and research methodologies
• Experience with medical data and regulatory requirements (FDA, TGA)
• Strong mathematical background in optimization and statistics
• Proven track record of innovation and technical leadership',
    'Brisbane, QLD',
    140000,
    200000,
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440003',
    'approved',
    'full-time',
    'remote',
    'ai',
    'external',
    'research@neuralnetworks.com',
    now() + interval '30 days'
  ),
  (
    gen_random_uuid(),
    'DevOps Engineer - Cloud Infrastructure',
    'Build and maintain the cloud infrastructure that powers our AI applications. You''ll work with Kubernetes, Docker, and modern CI/CD pipelines to ensure our systems can scale to millions of users while maintaining 99.99% uptime.

Day-to-day responsibilities:
• Design and implement scalable cloud architecture
• Automate deployment and monitoring systems
• Optimize infrastructure costs and performance
• Implement security best practices and compliance
• Collaborate with development teams on system design',
    'Technical Requirements:
• 4+ years of DevOps/SRE experience
• Expert knowledge of AWS/GCP and container orchestration
• Proficiency in Infrastructure as Code (Terraform, CloudFormation)
• Experience with monitoring tools (Datadog, New Relic, Grafana)
• Strong scripting skills (Python, Bash, Go)
• Knowledge of security best practices and compliance frameworks
• Experience with machine learning infrastructure preferred',
    'Perth, WA',
    105000,
    155000,
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440004',
    'approved',
    'full-time',
    'hybrid',
    'ai',
    'external',
    'devops@cloudfirst.tech',
    now() + interval '15 days'
  ),
  (
    gen_random_uuid(),
    'Quantum Algorithm Developer',
    'Shape the future of computing by developing quantum algorithms for machine learning applications. This is a unique opportunity to work at the intersection of quantum physics and artificial intelligence, solving problems that are impossible with classical computers.

What makes this role special:
• Access to cutting-edge quantum hardware
• Collaboration with Nobel Prize-winning physicists
• Opportunity to publish in top scientific journals
• Work on problems with real-world impact
• Shape the direction of quantum AI research',
    'We''re looking for:
• PhD in Quantum Computing, Physics, or Computer Science
• Experience with quantum programming languages (Qiskit, Cirq)
• Strong background in linear algebra and quantum mechanics
• Knowledge of machine learning and optimization algorithms
• Experience with classical HPC and distributed computing
• 2+ years of quantum algorithm development
• Publications in quantum computing or related fields strongly preferred',
    'Adelaide, SA',
    130000,
    190000,
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440005',
    'approved',
    'full-time',
    'onsite',
    'ai',
    'external',
    'quantum-careers@quantumlabs.org',
    now() + interval '40 days'
  );