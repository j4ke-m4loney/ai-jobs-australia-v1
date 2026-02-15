export type CareerPathId =
  | 'ml-engineer'
  | 'data-scientist'
  | 'ai-researcher'
  | 'data-engineer'
  | 'mlops-engineer'
  | 'nlp-engineer'
  | 'cv-engineer'
  | 'ai-product-manager'
  | 'ai-ethics'
  | 'llm-engineer';

export interface CareerPath {
  id: CareerPathId;
  name: string;
  description: string;
  keySkills: string[];
  salaryRange: { min: number; max: number };
  demandLevel: string;
  jobSearchSlug: string;
}

export interface QuizOption {
  label: string;
  scores: Partial<Record<CareerPathId, number>>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    description:
      'You build and deploy production ML models at scale. You bridge the gap between data science experiments and robust, scalable systems that serve predictions to millions of users.',
    keySkills: ['Python', 'TensorFlow/PyTorch', 'MLOps', 'Cloud Platforms', 'Software Engineering'],
    salaryRange: { min: 95000, max: 240000 },
    demandLevel: 'Very High',
    jobSearchSlug: 'machine learning engineer',
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description:
      'You uncover insights from complex datasets and build predictive models that drive business decisions. Your work spans statistics, machine learning, and clear communication of findings.',
    keySkills: ['Python/R', 'Statistics', 'SQL', 'Machine Learning', 'Data Visualisation'],
    salaryRange: { min: 90000, max: 230000 },
    demandLevel: 'High',
    jobSearchSlug: 'data scientist',
  },
  {
    id: 'ai-researcher',
    name: 'AI/ML Researcher',
    description:
      'You push the boundaries of what AI can do by developing novel algorithms and publishing research. You thrive on deep mathematical thinking and experimental rigour.',
    keySkills: ['Deep Learning', 'Mathematics', 'Research Methods', 'Paper Writing', 'PyTorch'],
    salaryRange: { min: 100000, max: 260000 },
    demandLevel: 'Medium',
    jobSearchSlug: 'AI researcher',
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    description:
      'You design and maintain the data infrastructure that powers AI and analytics. You build reliable pipelines, data warehouses, and ensure data quality at scale.',
    keySkills: ['SQL', 'Spark/Airflow', 'Cloud Data Services', 'Python', 'Data Modelling'],
    salaryRange: { min: 88000, max: 220000 },
    demandLevel: 'Very High',
    jobSearchSlug: 'data engineer',
  },
  {
    id: 'mlops-engineer',
    name: 'MLOps Engineer',
    description:
      'You operationalise machine learning by building CI/CD pipelines for models, monitoring performance, and ensuring reliable deployments. You keep ML systems running smoothly in production.',
    keySkills: ['Docker/Kubernetes', 'CI/CD', 'Cloud Platforms', 'Python', 'Monitoring'],
    salaryRange: { min: 95000, max: 235000 },
    demandLevel: 'High',
    jobSearchSlug: 'MLOps engineer',
  },
  {
    id: 'nlp-engineer',
    name: 'NLP Engineer',
    description:
      'You specialise in making machines understand and generate human language. From sentiment analysis to machine translation, you work at the intersection of linguistics and deep learning.',
    keySkills: ['Transformers', 'Python', 'NLP Libraries', 'Deep Learning', 'Linguistics'],
    salaryRange: { min: 100000, max: 240000 },
    demandLevel: 'High',
    jobSearchSlug: 'NLP engineer',
  },
  {
    id: 'cv-engineer',
    name: 'Computer Vision Engineer',
    description:
      'You build systems that can see and interpret the visual world. From object detection to medical imaging, you develop algorithms that extract meaning from images and video.',
    keySkills: ['OpenCV', 'Deep Learning', 'Python', 'Image Processing', 'GPU Programming'],
    salaryRange: { min: 95000, max: 235000 },
    demandLevel: 'Medium-High',
    jobSearchSlug: 'computer vision engineer',
  },
  {
    id: 'ai-product-manager',
    name: 'AI Product Manager',
    description:
      'You lead the strategy and development of AI-powered products. You translate business needs into technical requirements and guide cross-functional teams to deliver impactful AI solutions.',
    keySkills: ['Product Strategy', 'Stakeholder Management', 'AI/ML Literacy', 'Agile', 'Data Analysis'],
    salaryRange: { min: 110000, max: 220000 },
    demandLevel: 'Medium-High',
    jobSearchSlug: 'AI product manager',
  },
  {
    id: 'ai-ethics',
    name: 'AI Ethics & Governance Specialist',
    description:
      'You ensure AI systems are fair, transparent, and responsible. You develop governance frameworks, audit algorithms for bias, and shape organisational AI policies.',
    keySkills: ['AI Governance', 'Risk Assessment', 'Policy Development', 'Bias Auditing', 'Stakeholder Engagement'],
    salaryRange: { min: 100000, max: 200000 },
    demandLevel: 'Growing',
    jobSearchSlug: 'AI ethics governance',
  },
  {
    id: 'llm-engineer',
    name: 'Conversational AI / LLM Engineer',
    description:
      'You build applications powered by large language models. From RAG pipelines to AI agents, you design and deploy the next generation of intelligent conversational systems.',
    keySkills: ['LLM APIs', 'Prompt Engineering', 'RAG', 'LangChain', 'Python'],
    salaryRange: { min: 100000, max: 250000 },
    demandLevel: 'Very High',
    jobSearchSlug: 'LLM engineer',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What best describes your technical background?',
    options: [
      {
        label: 'Engineering or computer science — I love building systems',
        scores: { 'ml-engineer': 2, 'data-engineer': 2, 'mlops-engineer': 2, 'cv-engineer': 1 },
      },
      {
        label: 'Statistics or mathematics — I think in numbers and probabilities',
        scores: { 'data-scientist': 3, 'ai-researcher': 2 },
      },
      {
        label: 'Business or management — I connect technology to strategy',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 1 },
      },
      {
        label: 'Humanities or social sciences — I care about people and impact',
        scores: { 'ai-ethics': 3, 'ai-product-manager': 1 },
      },
    ],
  },
  {
    id: 2,
    question: 'Which type of problem excites you most?',
    options: [
      {
        label: 'Building ML systems that scale to millions of users',
        scores: { 'ml-engineer': 3, 'mlops-engineer': 2 },
      },
      {
        label: 'Extracting hidden insights and patterns from messy data',
        scores: { 'data-scientist': 3, 'data-engineer': 1 },
      },
      {
        label: 'Making machines understand and generate human language',
        scores: { 'nlp-engineer': 3, 'llm-engineer': 2 },
      },
      {
        label: 'Teaching computers to see and interpret visual information',
        scores: { 'cv-engineer': 3, 'ai-researcher': 1 },
      },
    ],
  },
  {
    id: 3,
    question: 'How would you describe your ideal work style?',
    options: [
      {
        label: 'Writing clean, well-tested, production-ready code',
        scores: { 'data-engineer': 3, 'mlops-engineer': 2, 'ml-engineer': 1 },
      },
      {
        label: 'Running experiments and iterating on model performance',
        scores: { 'data-scientist': 2, 'ai-researcher': 3, 'ml-engineer': 1 },
      },
      {
        label: 'Collaborating across teams and aligning stakeholders',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 2 },
      },
      {
        label: 'Diving deep into research papers and novel approaches',
        scores: { 'ai-researcher': 3, 'nlp-engineer': 1 },
      },
    ],
  },
  {
    id: 4,
    question: 'What kind of impact do you want your work to have?',
    options: [
      {
        label: 'Building products that millions of people use daily',
        scores: { 'ml-engineer': 2, 'llm-engineer': 3, 'cv-engineer': 1 },
      },
      {
        label: 'Advancing scientific understanding and publishing breakthroughs',
        scores: { 'ai-researcher': 3, 'nlp-engineer': 1 },
      },
      {
        label: 'Shaping business strategy with data-driven decisions',
        scores: { 'ai-product-manager': 3, 'data-scientist': 1 },
      },
      {
        label: 'Ensuring AI is used responsibly and benefits everyone',
        scores: { 'ai-ethics': 3, 'ai-product-manager': 1 },
      },
    ],
  },
  {
    id: 5,
    question: 'Which set of tools would you most enjoy working with?',
    options: [
      {
        label: 'Docker, Kubernetes, and CI/CD pipelines',
        scores: { 'mlops-engineer': 3, 'data-engineer': 2 },
      },
      {
        label: 'Jupyter notebooks, pandas, and scikit-learn',
        scores: { 'data-scientist': 3, 'ml-engineer': 1 },
      },
      {
        label: 'Transformers, LangChain, and prompt engineering',
        scores: { 'llm-engineer': 3, 'nlp-engineer': 2 },
      },
      {
        label: 'OpenCV, CUDA, and GPU-accelerated computing',
        scores: { 'cv-engineer': 3, 'ml-engineer': 1 },
      },
    ],
  },
  {
    id: 6,
    question: 'How do you prefer to learn new things?',
    options: [
      {
        label: 'Building projects and learning by doing',
        scores: { 'ml-engineer': 2, 'data-engineer': 2, 'mlops-engineer': 2 },
      },
      {
        label: 'Reading academic papers and understanding the theory',
        scores: { 'ai-researcher': 3, 'nlp-engineer': 1 },
      },
      {
        label: 'Studying real-world business case studies',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 1 },
      },
      {
        label: 'Workshops, meetups, and learning with others',
        scores: { 'ai-ethics': 2, 'data-scientist': 2 },
      },
    ],
  },
  {
    id: 7,
    question: 'What is your ideal relationship with data?',
    options: [
      {
        label: 'Building the pipelines and infrastructure that move it',
        scores: { 'data-engineer': 3, 'mlops-engineer': 2 },
      },
      {
        label: 'Analysing it to find insights and tell stories',
        scores: { 'data-scientist': 3, 'ai-product-manager': 1 },
      },
      {
        label: 'Using it as training material to build smarter models',
        scores: { 'ml-engineer': 2, 'llm-engineer': 2, 'nlp-engineer': 1 },
      },
      {
        label: 'Governing its quality, privacy, and ethical use',
        scores: { 'ai-ethics': 3, 'data-engineer': 1 },
      },
    ],
  },
  {
    id: 8,
    question: 'How do you handle ambiguity in your work?',
    options: [
      {
        label: 'I thrive on it — open-ended problems spark my creativity',
        scores: { 'ai-researcher': 3, 'data-scientist': 1 },
      },
      {
        label: 'I prefer clear requirements and well-defined specs',
        scores: { 'data-engineer': 2, 'mlops-engineer': 2 },
      },
      {
        label: 'I create structure — turning chaos into actionable plans',
        scores: { 'ai-product-manager': 2, 'ai-ethics': 2 },
      },
      {
        label: 'I explore creatively and prototype quickly to find answers',
        scores: { 'llm-engineer': 3, 'cv-engineer': 2, 'nlp-engineer': 1 },
      },
    ],
  },
  {
    id: 9,
    question: 'How do you prefer to communicate your work?',
    options: [
      {
        label: 'Live demos and working prototypes',
        scores: { 'ml-engineer': 2, 'llm-engineer': 2 },
      },
      {
        label: 'Data visualisations, dashboards, and charts',
        scores: { 'data-scientist': 3, 'data-engineer': 1 },
      },
      {
        label: 'Presentations and stakeholder facilitation',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 2 },
      },
      {
        label: 'Technical papers and detailed documentation',
        scores: { 'ai-researcher': 3, 'nlp-engineer': 1 },
      },
    ],
  },
  {
    id: 10,
    question: 'What matters most to you in your career?',
    options: [
      {
        label: 'Working with cutting-edge technology',
        scores: { 'llm-engineer': 3, 'cv-engineer': 2, 'nlp-engineer': 1 },
      },
      {
        label: 'Job security and strong market demand',
        scores: { 'data-engineer': 3, 'mlops-engineer': 2 },
      },
      {
        label: 'Making a positive social impact',
        scores: { 'ai-ethics': 3, 'ai-product-manager': 1 },
      },
      {
        label: 'Intellectual challenge and continuous learning',
        scores: { 'ai-researcher': 3, 'data-scientist': 2 },
      },
    ],
  },
  {
    id: 11,
    question: 'What scale of project appeals to you most?',
    options: [
      {
        label: 'Large distributed systems processing massive datasets',
        scores: { 'data-engineer': 3, 'mlops-engineer': 2 },
      },
      {
        label: 'Focused experiments pushing the state of the art',
        scores: { 'data-scientist': 2, 'ai-researcher': 2, 'cv-engineer': 1 },
      },
      {
        label: 'End-to-end applications from prototype to production',
        scores: { 'llm-engineer': 3, 'ml-engineer': 2, 'nlp-engineer': 1 },
      },
      {
        label: 'Cross-organisation initiatives that shape AI strategy',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 2 },
      },
    ],
  },
  {
    id: 12,
    question: 'Which description best fits your ideal role?',
    options: [
      {
        label: 'Training and deploying machine learning models at scale',
        scores: { 'ml-engineer': 3, 'cv-engineer': 1 },
      },
      {
        label: 'Building intelligent apps powered by large language models',
        scores: { 'llm-engineer': 3, 'nlp-engineer': 2 },
      },
      {
        label: 'Designing and maintaining robust data infrastructure',
        scores: { 'data-engineer': 3, 'mlops-engineer': 2 },
      },
      {
        label: 'Leading AI product strategy and cross-functional teams',
        scores: { 'ai-product-manager': 3, 'ai-ethics': 1 },
      },
    ],
  },
];
