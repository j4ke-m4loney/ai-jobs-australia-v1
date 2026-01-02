// AI/ML Resume Keyword Definitions

export interface KeywordCategory {
  name: string;
  keywords: string[];
  weight: number; // Importance weight for scoring
}

export const AI_KEYWORDS: KeywordCategory[] = [
  {
    name: 'Programming Languages',
    weight: 1.5,
    keywords: [
      'Python',
      'R',
      'Java',
      'C++',
      'JavaScript',
      'TypeScript',
      'Scala',
      'Julia',
      'SQL',
      'MATLAB',
    ],
  },
  {
    name: 'ML/AI Frameworks',
    weight: 2.0,
    keywords: [
      'TensorFlow',
      'PyTorch',
      'Keras',
      'Scikit-learn',
      'scikit-learn',
      'XGBoost',
      'LightGBM',
      'Hugging Face',
      'OpenCV',
      'NLTK',
      'spaCy',
      'Pandas',
      'NumPy',
      'JAX',
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    weight: 1.5,
    keywords: [
      'AWS',
      'Azure',
      'GCP',
      'Google Cloud',
      'Docker',
      'Kubernetes',
      'MLflow',
      'Airflow',
      'Spark',
      'Databricks',
      'SageMaker',
    ],
  },
  {
    name: 'ML/AI Techniques',
    weight: 2.0,
    keywords: [
      'Machine Learning',
      'Deep Learning',
      'Neural Networks',
      'Natural Language Processing',
      'NLP',
      'Computer Vision',
      'Reinforcement Learning',
      'Supervised Learning',
      'Unsupervised Learning',
      'Transfer Learning',
      'Generative AI',
      'Large Language Models',
      'LLM',
      'CNN',
      'RNN',
      'LSTM',
      'Transformer',
      'GPT',
      'BERT',
    ],
  },
  {
    name: 'Data & Analytics',
    weight: 1.0,
    keywords: [
      'Data Analysis',
      'Data Science',
      'Big Data',
      'ETL',
      'Data Pipeline',
      'Data Engineering',
      'Data Visualization',
      'Statistical Analysis',
      'A/B Testing',
      'Tableau',
      'Power BI',
      'Jupyter',
    ],
  },
  {
    name: 'MLOps & Deployment',
    weight: 1.5,
    keywords: [
      'MLOps',
      'Model Deployment',
      'CI/CD',
      'Model Monitoring',
      'Model Optimization',
      'REST API',
      'FastAPI',
      'Flask',
      'Model Serving',
      'Production ML',
    ],
  },
  {
    name: 'Soft Skills',
    weight: 0.8,
    keywords: [
      'Communication',
      'Leadership',
      'Team Collaboration',
      'Problem Solving',
      'Critical Thinking',
      'Research',
      'Presentation',
      'Stakeholder Management',
      'Agile',
      'Scrum',
    ],
  },
];

// Common role-specific keyword suggestions
export const ROLE_SPECIFIC_KEYWORDS: Record<string, string[]> = {
  'Machine Learning Engineer': [
    'Model Training',
    'Feature Engineering',
    'Hyperparameter Tuning',
    'Model Optimization',
    'PyTorch',
    'TensorFlow',
    'MLOps',
  ],
  'Data Scientist': [
    'Statistical Analysis',
    'Data Visualization',
    'Predictive Modeling',
    'Python',
    'R',
    'SQL',
    'A/B Testing',
  ],
  'AI Researcher': [
    'Research',
    'Publications',
    'Deep Learning',
    'Neural Networks',
    'Algorithm Development',
    'PyTorch',
    'TensorFlow',
  ],
  'NLP Engineer': [
    'Natural Language Processing',
    'NLP',
    'Transformers',
    'BERT',
    'GPT',
    'spaCy',
    'Hugging Face',
  ],
  'Computer Vision Engineer': [
    'Computer Vision',
    'OpenCV',
    'Image Processing',
    'CNN',
    'Object Detection',
    'Image Segmentation',
  ],
  'Data Engineer': [
    'Data Pipeline',
    'ETL',
    'Spark',
    'Airflow',
    'SQL',
    'Data Warehouse',
    'Big Data',
  ],
};

// Get all unique keywords across all categories
export function getAllKeywords(): string[] {
  const allKeywords = AI_KEYWORDS.flatMap((category) => category.keywords);
  return [...new Set(allKeywords)];
}

// Get total possible score (for percentage calculation)
export function getMaxPossibleScore(): number {
  return AI_KEYWORDS.reduce(
    (sum, category) => sum + category.keywords.length * category.weight,
    0
  );
}
