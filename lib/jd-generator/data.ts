// AI/ML Job Description Generator Data

export type AIMLRole =
  | 'Machine Learning Engineer'
  | 'Data Scientist'
  | 'AI/ML Researcher'
  | 'MLOps Engineer'
  | 'Data Engineer'
  | 'NLP Engineer'
  | 'Computer Vision Engineer'
  | 'AI Product Manager'
  | 'Head of AI/ML'
  | 'AI Solutions Architect';

export const AIML_ROLES: AIMLRole[] = [
  'Machine Learning Engineer',
  'Data Scientist',
  'AI/ML Researcher',
  'MLOps Engineer',
  'Data Engineer',
  'NLP Engineer',
  'Computer Vision Engineer',
  'AI Product Manager',
  'Head of AI/ML',
  'AI Solutions Architect',
];

export type SeniorityLevel =
  | 'Junior'
  | 'Mid-Level'
  | 'Senior'
  | 'Lead'
  | 'Principal'
  | 'Head of / Director';

export const SENIORITY_LEVELS: SeniorityLevel[] = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Principal',
  'Head of / Director',
];

export type CompanySize =
  | 'Startup (1-50)'
  | 'Scale-up (51-200)'
  | 'Mid-size (201-1000)'
  | 'Enterprise (1000+)';

export const COMPANY_SIZES: CompanySize[] = [
  'Startup (1-50)',
  'Scale-up (51-200)',
  'Mid-size (201-1000)',
  'Enterprise (1000+)',
];

export type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote' | 'Flexible';

export const WORK_ARRANGEMENTS: WorkArrangement[] = [
  'On-site',
  'Hybrid',
  'Remote',
  'Flexible',
];

export const AUSTRALIAN_CITIES = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Canberra',
  'Hobart',
  'Darwin',
  'Gold Coast',
  'Newcastle',
];

export interface TechOption {
  name: string;
  category: string;
}

export const TECH_OPTIONS: TechOption[] = [
  // Languages
  { name: 'Python', category: 'Languages' },
  { name: 'R', category: 'Languages' },
  { name: 'SQL', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'Scala', category: 'Languages' },
  { name: 'Go', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  // ML Frameworks
  { name: 'PyTorch', category: 'ML Frameworks' },
  { name: 'TensorFlow', category: 'ML Frameworks' },
  { name: 'scikit-learn', category: 'ML Frameworks' },
  { name: 'Keras', category: 'ML Frameworks' },
  { name: 'Hugging Face', category: 'ML Frameworks' },
  { name: 'LangChain', category: 'ML Frameworks' },
  { name: 'JAX', category: 'ML Frameworks' },
  { name: 'XGBoost', category: 'ML Frameworks' },
  // Cloud
  { name: 'AWS', category: 'Cloud' },
  { name: 'Azure', category: 'Cloud' },
  { name: 'GCP', category: 'Cloud' },
  // Data & MLOps
  { name: 'Spark', category: 'Data & MLOps' },
  { name: 'Airflow', category: 'Data & MLOps' },
  { name: 'dbt', category: 'Data & MLOps' },
  { name: 'Databricks', category: 'Data & MLOps' },
  { name: 'Snowflake', category: 'Data & MLOps' },
  { name: 'MLflow', category: 'Data & MLOps' },
  { name: 'Kubeflow', category: 'Data & MLOps' },
  { name: 'Docker', category: 'Data & MLOps' },
  { name: 'Kubernetes', category: 'Data & MLOps' },
  // Databases
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'Redis', category: 'Databases' },
  { name: 'Pinecone', category: 'Databases' },
  { name: 'Elasticsearch', category: 'Databases' },
  { name: 'BigQuery', category: 'Databases' },
];

// Experience years by seniority
export const SENIORITY_EXPERIENCE: Record<SeniorityLevel, { min: number; max: number }> = {
  'Junior': { min: 0, max: 2 },
  'Mid-Level': { min: 2, max: 5 },
  'Senior': { min: 5, max: 8 },
  'Lead': { min: 7, max: 10 },
  'Principal': { min: 10, max: 15 },
  'Head of / Director': { min: 10, max: 20 },
};

// Role-specific responsibilities templates
export const ROLE_RESPONSIBILITIES: Record<AIMLRole, string[]> = {
  'Machine Learning Engineer': [
    'Design, develop, and deploy production-grade machine learning models and pipelines',
    'Collaborate with data scientists to translate research prototypes into scalable, production-ready solutions',
    'Build and maintain feature engineering pipelines and model training infrastructure',
    'Optimise model performance, latency, and resource utilisation for production workloads',
    'Implement monitoring and alerting for model performance, data drift, and system health',
    'Write clean, well-tested code with comprehensive documentation',
    'Participate in code reviews, architecture discussions, and technical planning',
    'Stay current with ML research and evaluate new techniques for practical application',
  ],
  'Data Scientist': [
    'Analyse complex datasets to identify patterns, trends, and actionable insights',
    'Design and conduct experiments, including A/B tests, to measure business impact',
    'Build predictive models and statistical analyses to support business decision-making',
    'Communicate findings and recommendations to technical and non-technical stakeholders',
    'Collaborate with engineering teams to deploy models and integrate insights into products',
    'Develop dashboards and visualisations to make data accessible across the organisation',
    'Define metrics and KPIs to measure the success of data-driven initiatives',
    'Mentor junior team members and contribute to a culture of data-driven decision-making',
  ],
  'AI/ML Researcher': [
    'Conduct original research in machine learning, deep learning, or related fields',
    'Develop novel algorithms and approaches to solve complex technical challenges',
    'Publish research findings in top-tier conferences and journals',
    'Prototype and validate new ideas through rigorous experimentation and benchmarking',
    'Collaborate with engineering teams to translate research breakthroughs into products',
    'Stay at the forefront of AI/ML research through literature review and conference participation',
    'Contribute to the broader research community through open-source projects and publications',
    'Mentor research interns and junior researchers',
  ],
  'MLOps Engineer': [
    'Design and build CI/CD pipelines for machine learning model training and deployment',
    'Develop and maintain infrastructure for model serving, monitoring, and retraining',
    'Implement automated testing, validation, and quality assurance for ML pipelines',
    'Manage cloud infrastructure and optimise costs for ML workloads',
    'Build tooling and platforms to improve data scientist and ML engineer productivity',
    'Establish best practices for model versioning, experiment tracking, and reproducibility',
    'Monitor production models for performance degradation, data drift, and anomalies',
    'Collaborate with security and governance teams to ensure compliance and data protection',
  ],
  'Data Engineer': [
    'Design and build scalable data pipelines to ingest, transform, and store data',
    'Develop and maintain data warehouse and data lake architectures',
    'Ensure data quality, reliability, and accessibility across the organisation',
    'Optimise data processing for performance, cost, and scalability',
    'Build real-time and batch data processing systems to support analytics and ML workloads',
    'Implement data governance practices including cataloguing, lineage, and access controls',
    'Collaborate with data scientists and analysts to understand data requirements',
    'Monitor and troubleshoot data pipeline failures and performance issues',
  ],
  'NLP Engineer': [
    'Design and develop natural language processing systems and applications',
    'Build and fine-tune language models for tasks such as classification, extraction, and generation',
    'Develop text processing pipelines including tokenisation, embedding, and feature extraction',
    'Evaluate and benchmark NLP models using appropriate metrics and test sets',
    'Integrate LLM capabilities into products through prompt engineering, RAG, and fine-tuning',
    'Collaborate with product teams to define NLP requirements and success metrics',
    'Stay current with advances in NLP, transformers, and large language models',
    'Build and maintain evaluation frameworks for model quality and safety',
  ],
  'Computer Vision Engineer': [
    'Design and develop computer vision systems for image and video analysis',
    'Build and train deep learning models for detection, segmentation, and classification tasks',
    'Develop image processing pipelines for data augmentation, preprocessing, and inference',
    'Optimise models for edge deployment, real-time inference, and resource constraints',
    'Evaluate model performance using appropriate metrics and benchmark datasets',
    'Collaborate with product and hardware teams to define vision system requirements',
    'Build and maintain annotation pipelines and data collection processes',
    'Stay current with advances in computer vision research and techniques',
  ],
  'AI Product Manager': [
    'Define product strategy and roadmap for AI/ML-powered features and products',
    'Translate business requirements into technical specifications for AI/ML teams',
    'Prioritise features and experiments based on business impact and technical feasibility',
    'Work closely with data scientists and engineers to scope, plan, and deliver AI initiatives',
    'Define success metrics and run experiments to measure the impact of AI features',
    'Communicate AI capabilities, limitations, and risks to stakeholders and leadership',
    'Ensure AI products meet ethical, legal, and regulatory requirements',
    'Conduct market research and competitive analysis in the AI/ML space',
  ],
  'Head of AI/ML': [
    'Set the strategic vision and roadmap for AI/ML capabilities across the organisation',
    'Build, lead, and mentor a high-performing team of data scientists, ML engineers, and researchers',
    'Partner with business leaders to identify and prioritise high-impact AI opportunities',
    'Establish technical standards, best practices, and governance frameworks for AI development',
    'Oversee the end-to-end ML lifecycle from research and experimentation to production deployment',
    'Manage budgets, vendor relationships, and cloud infrastructure costs',
    'Represent the organisation in the AI community through talks, publications, and partnerships',
    'Ensure responsible AI practices including fairness, transparency, and privacy',
  ],
  'AI Solutions Architect': [
    'Design end-to-end AI/ML solution architectures aligned with business requirements',
    'Evaluate and recommend AI/ML technologies, platforms, and vendors',
    'Create technical blueprints and reference architectures for AI/ML deployments',
    'Guide engineering teams on best practices for ML system design and implementation',
    'Conduct proof-of-concept projects to validate technical approaches and feasibility',
    'Ensure solutions meet security, compliance, scalability, and performance requirements',
    'Bridge the gap between business stakeholders and technical teams',
    'Stay current with cloud AI services and emerging AI/ML technologies',
  ],
};

// Role-specific required skills
export const ROLE_REQUIRED_SKILLS: Record<AIMLRole, string[]> = {
  'Machine Learning Engineer': [
    'Strong programming skills in Python',
    'Experience with ML frameworks such as PyTorch or TensorFlow',
    'Understanding of ML fundamentals including supervised, unsupervised, and reinforcement learning',
    'Experience deploying ML models to production environments',
    'Familiarity with cloud platforms (AWS, GCP, or Azure)',
    'Strong software engineering practices including testing, CI/CD, and version control',
  ],
  'Data Scientist': [
    'Strong proficiency in Python and SQL',
    'Experience with statistical modelling and machine learning techniques',
    'Proficiency in data visualisation tools and libraries',
    'Strong analytical and problem-solving skills',
    'Experience with experiment design and A/B testing',
    'Ability to communicate complex findings to non-technical audiences',
  ],
  'AI/ML Researcher': [
    'PhD or equivalent research experience in ML, AI, or related field',
    'Strong publication record in top-tier venues (NeurIPS, ICML, ICLR, ACL, CVPR)',
    'Deep expertise in one or more ML specialisations',
    'Strong programming skills in Python with ML framework experience',
    'Experience designing and running rigorous experiments',
    'Ability to identify impactful research problems and propose novel solutions',
  ],
  'MLOps Engineer': [
    'Strong experience with cloud infrastructure (AWS, GCP, or Azure)',
    'Proficiency in containerisation and orchestration (Docker, Kubernetes)',
    'Experience building CI/CD pipelines for ML workflows',
    'Familiarity with ML frameworks and model serving solutions',
    'Strong programming skills in Python and/or Go',
    'Experience with infrastructure-as-code tools (Terraform, CloudFormation)',
  ],
  'Data Engineer': [
    'Strong SQL skills and experience with data warehousing',
    'Proficiency in Python, Scala, or Java',
    'Experience with distributed data processing frameworks (Spark, Flink)',
    'Knowledge of data modelling, ETL, and data pipeline design',
    'Familiarity with cloud data services and architectures',
    'Understanding of data governance and quality practices',
  ],
  'NLP Engineer': [
    'Strong programming skills in Python',
    'Experience with NLP libraries and frameworks (Hugging Face, spaCy)',
    'Understanding of transformer architectures and language models',
    'Experience with text processing, tokenisation, and embedding techniques',
    'Familiarity with LLM integration patterns (RAG, fine-tuning, prompt engineering)',
    'Experience evaluating NLP model performance',
  ],
  'Computer Vision Engineer': [
    'Strong programming skills in Python and C++',
    'Experience with deep learning frameworks (PyTorch, TensorFlow)',
    'Knowledge of CNN architectures and object detection/segmentation models',
    'Experience with image processing libraries (OpenCV, PIL)',
    'Understanding of model optimisation for inference',
    'Experience with annotation tools and data collection pipelines',
  ],
  'AI Product Manager': [
    'Experience managing AI/ML product features or data-driven products',
    'Understanding of ML capabilities, limitations, and development lifecycle',
    'Strong analytical skills with experience defining and tracking metrics',
    'Excellent communication skills for translating between technical and business audiences',
    'Experience with agile development methodologies',
    'Ability to prioritise and make trade-offs with incomplete information',
  ],
  'Head of AI/ML': [
    'Extensive experience leading AI/ML teams in a technical leadership capacity',
    'Deep technical understanding of the ML lifecycle from research to production',
    'Track record of delivering AI/ML solutions that drive measurable business impact',
    'Experience building and scaling high-performing technical teams',
    'Strong stakeholder management and executive communication skills',
    'Understanding of responsible AI practices, governance, and compliance',
  ],
  'AI Solutions Architect': [
    'Broad experience across the AI/ML technology landscape',
    'Experience designing distributed systems and cloud architectures',
    'Strong understanding of ML model training, serving, and monitoring patterns',
    'Excellent communication and technical writing skills',
    'Experience with cloud AI/ML services across major providers',
    'Ability to translate business requirements into technical architecture decisions',
  ],
};

// Nice-to-have skills by role
export const ROLE_NICE_TO_HAVES: Record<AIMLRole, string[]> = {
  'Machine Learning Engineer': [
    'Experience with LLMs and generative AI',
    'Contributions to open-source ML projects',
    'Experience with real-time ML inference systems',
    'Knowledge of distributed training techniques',
  ],
  'Data Scientist': [
    'Experience with deep learning or NLP',
    'Familiarity with causal inference methods',
    'Experience in the Australian market or industry',
    'Knowledge of data privacy regulations',
  ],
  'AI/ML Researcher': [
    'Industry research experience',
    'Experience transitioning research to production',
    'Open-source contributions',
    'Experience mentoring researchers',
  ],
  'MLOps Engineer': [
    'Experience with ML-specific platforms (Databricks, SageMaker, Vertex AI)',
    'Knowledge of model monitoring and drift detection',
    'Experience with GPU cluster management',
    'Familiarity with feature store technologies',
  ],
  'Data Engineer': [
    'Experience with streaming data (Kafka, Kinesis)',
    'Knowledge of data mesh or data fabric architectures',
    'Experience with ML feature pipelines',
    'Familiarity with data privacy and compliance requirements',
  ],
  'NLP Engineer': [
    'Experience building conversational AI or chatbot systems',
    'Knowledge of multilingual NLP',
    'Experience with speech recognition or synthesis',
    'Contributions to NLP open-source projects',
  ],
  'Computer Vision Engineer': [
    'Experience with 3D vision or point cloud processing',
    'Knowledge of edge deployment (TensorRT, ONNX)',
    'Experience with video understanding and tracking',
    'Publications in computer vision venues',
  ],
  'AI Product Manager': [
    'Technical background in data science or engineering',
    'Experience with AI ethics and responsible AI practices',
    'Knowledge of the Australian regulatory landscape for AI',
    'Experience with AI product go-to-market strategies',
  ],
  'Head of AI/ML': [
    'PhD in a quantitative field',
    'Experience with AI governance and regulatory compliance',
    'Public speaking or thought leadership in AI',
    'Experience with AI strategy at board level',
  ],
  'AI Solutions Architect': [
    'Relevant cloud certifications (AWS, GCP, Azure)',
    'Experience with enterprise AI governance frameworks',
    'Knowledge of edge AI and IoT deployments',
    'Experience in consulting or pre-sales technical roles',
  ],
};

// Biased/exclusionary language patterns
export interface BiasPattern {
  pattern: RegExp;
  type: 'gendered' | 'ageist' | 'exclusionary' | 'aggressive' | 'ableist';
  original: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export const BIAS_PATTERNS: BiasPattern[] = [
  // Gendered language
  {
    pattern: /\bninja\b/i,
    type: 'gendered',
    original: 'ninja',
    suggestion: 'expert or specialist',
    severity: 'medium',
  },
  {
    pattern: /\brockstar\b/i,
    type: 'gendered',
    original: 'rockstar',
    suggestion: 'high-performing or experienced',
    severity: 'medium',
  },
  {
    pattern: /\bguru\b/i,
    type: 'gendered',
    original: 'guru',
    suggestion: 'expert or specialist',
    severity: 'medium',
  },
  {
    pattern: /\bhacker\b/i,
    type: 'gendered',
    original: 'hacker',
    suggestion: 'developer or engineer',
    severity: 'low',
  },
  {
    pattern: /\bdominant\b/i,
    type: 'aggressive',
    original: 'dominant',
    suggestion: 'leading or prominent',
    severity: 'medium',
  },
  {
    pattern: /\baggressive\b/i,
    type: 'aggressive',
    original: 'aggressive',
    suggestion: 'ambitious or driven',
    severity: 'medium',
  },
  {
    pattern: /\bcrush\s+it\b/i,
    type: 'aggressive',
    original: 'crush it',
    suggestion: 'excel or deliver results',
    severity: 'low',
  },
  {
    pattern: /\bman\s*hours?\b/i,
    type: 'gendered',
    original: 'man hours',
    suggestion: 'person hours or work hours',
    severity: 'high',
  },
  {
    pattern: /\bmanpower\b/i,
    type: 'gendered',
    original: 'manpower',
    suggestion: 'workforce or team capacity',
    severity: 'high',
  },
  // Ageist language
  {
    pattern: /\byoung\s+(and\s+)?(?:dynamic|energetic|hungry)\b/i,
    type: 'ageist',
    original: 'young and dynamic',
    suggestion: 'motivated and enthusiastic',
    severity: 'high',
  },
  {
    pattern: /\bdigital\s+native\b/i,
    type: 'ageist',
    original: 'digital native',
    suggestion: 'digitally fluent or tech-savvy',
    severity: 'medium',
  },
  {
    pattern: /\brecent\s+graduate\b/i,
    type: 'ageist',
    original: 'recent graduate',
    suggestion: 'early-career professional or entry-level candidate',
    severity: 'low',
  },
  // Exclusionary
  {
    pattern: /\bnative\s+(?:english\s+)?speaker\b/i,
    type: 'exclusionary',
    original: 'native speaker',
    suggestion: 'fluent or proficient in English',
    severity: 'high',
  },
  {
    pattern: /\bcultur(?:e|al)\s+fit\b/i,
    type: 'exclusionary',
    original: 'culture fit',
    suggestion: 'values-aligned or culture add',
    severity: 'medium',
  },
  // Ableist
  {
    pattern: /\bstand-up\b(?!\s*meeting|\s*comedy)/i,
    type: 'ableist',
    original: 'stand-up',
    suggestion: 'daily sync or team check-in',
    severity: 'low',
  },
];

// "Unicorn" requirement patterns - unrealistic combos
export interface UnicornPattern {
  skills: string[];
  message: string;
}

export const UNICORN_PATTERNS: UnicornPattern[] = [
  {
    skills: ['PhD', '10+ years', 'hands-on coding'],
    message: 'Requiring a PhD, 10+ years experience, AND hands-on coding narrows the pool significantly. Consider which is truly essential.',
  },
  {
    skills: ['full-stack', 'machine learning', 'devops'],
    message: 'Expecting full-stack, ML, and DevOps expertise from one person is a unicorn requirement. Consider splitting into separate roles.',
  },
];

// Salary ranges by role and seniority (AUD)
export const SALARY_RANGES: Record<string, Record<SeniorityLevel, { min: number; max: number }>> = {
  'Machine Learning Engineer': {
    'Junior': { min: 80000, max: 110000 },
    'Mid-Level': { min: 120000, max: 160000 },
    'Senior': { min: 160000, max: 210000 },
    'Lead': { min: 200000, max: 260000 },
    'Principal': { min: 240000, max: 320000 },
    'Head of / Director': { min: 280000, max: 400000 },
  },
  'Data Scientist': {
    'Junior': { min: 75000, max: 100000 },
    'Mid-Level': { min: 110000, max: 150000 },
    'Senior': { min: 150000, max: 200000 },
    'Lead': { min: 190000, max: 250000 },
    'Principal': { min: 230000, max: 300000 },
    'Head of / Director': { min: 260000, max: 380000 },
  },
  'AI/ML Researcher': {
    'Junior': { min: 90000, max: 120000 },
    'Mid-Level': { min: 130000, max: 170000 },
    'Senior': { min: 170000, max: 230000 },
    'Lead': { min: 220000, max: 280000 },
    'Principal': { min: 260000, max: 350000 },
    'Head of / Director': { min: 300000, max: 420000 },
  },
  'MLOps Engineer': {
    'Junior': { min: 80000, max: 105000 },
    'Mid-Level': { min: 115000, max: 150000 },
    'Senior': { min: 150000, max: 200000 },
    'Lead': { min: 190000, max: 250000 },
    'Principal': { min: 230000, max: 300000 },
    'Head of / Director': { min: 260000, max: 370000 },
  },
  'Data Engineer': {
    'Junior': { min: 75000, max: 100000 },
    'Mid-Level': { min: 110000, max: 145000 },
    'Senior': { min: 145000, max: 195000 },
    'Lead': { min: 185000, max: 240000 },
    'Principal': { min: 220000, max: 290000 },
    'Head of / Director': { min: 250000, max: 360000 },
  },
  'NLP Engineer': {
    'Junior': { min: 85000, max: 110000 },
    'Mid-Level': { min: 125000, max: 160000 },
    'Senior': { min: 160000, max: 215000 },
    'Lead': { min: 205000, max: 265000 },
    'Principal': { min: 245000, max: 325000 },
    'Head of / Director': { min: 285000, max: 400000 },
  },
  'Computer Vision Engineer': {
    'Junior': { min: 85000, max: 110000 },
    'Mid-Level': { min: 120000, max: 155000 },
    'Senior': { min: 155000, max: 210000 },
    'Lead': { min: 200000, max: 260000 },
    'Principal': { min: 240000, max: 320000 },
    'Head of / Director': { min: 280000, max: 400000 },
  },
  'AI Product Manager': {
    'Junior': { min: 80000, max: 105000 },
    'Mid-Level': { min: 120000, max: 155000 },
    'Senior': { min: 155000, max: 200000 },
    'Lead': { min: 195000, max: 250000 },
    'Principal': { min: 235000, max: 300000 },
    'Head of / Director': { min: 270000, max: 380000 },
  },
  'Head of AI/ML': {
    'Junior': { min: 120000, max: 160000 },
    'Mid-Level': { min: 160000, max: 220000 },
    'Senior': { min: 220000, max: 300000 },
    'Lead': { min: 280000, max: 360000 },
    'Principal': { min: 320000, max: 420000 },
    'Head of / Director': { min: 350000, max: 500000 },
  },
  'AI Solutions Architect': {
    'Junior': { min: 90000, max: 115000 },
    'Mid-Level': { min: 130000, max: 165000 },
    'Senior': { min: 165000, max: 220000 },
    'Lead': { min: 210000, max: 270000 },
    'Principal': { min: 250000, max: 330000 },
    'Head of / Director': { min: 290000, max: 400000 },
  },
};

// Benefits templates by company size
export const BENEFITS_BY_SIZE: Record<CompanySize, string[]> = {
  'Startup (1-50)': [
    'Equity/stock options in a growing company',
    'Flexible working hours and remote-friendly culture',
    'Direct impact on product and company direction',
    'Learning budget for conferences and courses',
    'Small, collaborative team environment',
  ],
  'Scale-up (51-200)': [
    'Competitive salary with equity component',
    'Flexible hybrid working arrangements',
    'Professional development budget',
    'Modern tech stack and tooling',
    'Career growth opportunities in a scaling organisation',
    'Team offsites and social events',
  ],
  'Mid-size (201-1000)': [
    'Competitive salary and bonus structure',
    'Flexible working arrangements',
    'Generous professional development budget',
    'Health and wellbeing programmes',
    'Paid parental leave',
    'Modern office with collaboration spaces',
    'Regular team events and hackathons',
  ],
  'Enterprise (1000+)': [
    'Competitive salary and comprehensive benefits package',
    'Flexible and hybrid working options',
    'Extensive learning and development programmes',
    'Health insurance and wellbeing support',
    'Generous paid parental leave',
    'Employee assistance programme',
    'Career progression pathways and internal mobility',
    'Access to cutting-edge infrastructure and compute resources',
  ],
};

// FAQ Content
export const FAQ_CONTENT = [
  {
    question: 'How do I write a good AI/ML job description?',
    answer:
      "A strong AI/ML job description clearly separates must-have from nice-to-have requirements, includes specific technologies rather than vague terms, provides salary transparency, and avoids biased language. Be realistic about what one person can do — listing every ML technology as a requirement creates a 'unicorn' JD that discourages qualified candidates from applying.",
  },
  {
    question: 'How many required skills should I list?',
    answer:
      "Research shows that listing more than 6-8 requirements significantly reduces the applicant pool, particularly among women and underrepresented groups who tend to only apply when they meet all listed criteria. Separate your requirements into 'must-have' (4-6 items) and 'nice-to-have' (3-4 items) to attract a broader, more diverse candidate pool.",
  },
  {
    question: 'Should I include salary in my job description?',
    answer:
      "Yes. Job listings with salary ranges receive significantly more applications. In Australia, salary transparency is increasingly expected, and some states are moving towards mandatory disclosure. Including a range also saves time by filtering out mismatched expectations early in the process.",
  },
  {
    question: 'What is biased language in job descriptions?',
    answer:
      "Biased language includes gendered terms ('ninja', 'rockstar'), ageist phrases ('digital native', 'young and dynamic'), exclusionary requirements ('native English speaker'), and aggressive language ('crush it', 'dominant'). These terms can discourage qualified candidates from diverse backgrounds from applying, even if that wasn't your intention.",
  },
  {
    question: 'How long should an AI/ML job description be?',
    answer:
      "Aim for 500-800 words. Job descriptions that are too short lack the detail candidates need to assess fit, while overly long ones (1000+ words) see lower completion rates. Focus on what makes the role and your team unique rather than generic corporate boilerplate.",
  },
  {
    question: 'Is my data private when using this tool?',
    answer:
      'Yes, completely. All generation happens locally in your browser using JavaScript. No data is sent to our servers or stored anywhere. Your job description details stay on your device.',
  },
  {
    question: 'Can I edit the generated job description?',
    answer:
      "Absolutely — the generated JD is a starting point, not a final draft. Copy it and customise it with your company's specific details, team culture, and unique selling points. The best job descriptions include authentic details about your team and the problems you're solving.",
  },
  {
    question: 'What makes Australian AI/ML job descriptions different?',
    answer:
      "Use Australian English spelling (e.g., 'optimise' not 'optimize'). Reference Australian-specific benefits like superannuation, parental leave entitlements, and local work arrangements. Mention visa sponsorship availability if applicable. Reference Australian privacy and AI regulations if governance is part of the role.",
  },
];
