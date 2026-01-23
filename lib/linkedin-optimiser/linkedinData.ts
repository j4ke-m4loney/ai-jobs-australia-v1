export interface KeywordCategory {
  name: string;
  keywords: string[];
  weight: number;
}

export const AI_KEYWORDS: KeywordCategory[] = [
  {
    name: "Programming Languages",
    weight: 1.5,
    keywords: [
      "Python",
      "R",
      "Java",
      "C++",
      "JavaScript",
      "TypeScript",
      "Scala",
      "Julia",
      "SQL",
      "MATLAB",
      "Go",
      "Rust",
    ],
  },
  {
    name: "ML/AI Frameworks",
    weight: 2.0,
    keywords: [
      "TensorFlow",
      "PyTorch",
      "Keras",
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "Hugging Face",
      "JAX",
      "ONNX",
      "MLflow",
      "Weights & Biases",
      "wandb",
      "LangChain",
      "LlamaIndex",
    ],
  },
  {
    name: "Cloud & Infrastructure",
    weight: 1.5,
    keywords: [
      "AWS",
      "Amazon Web Services",
      "Azure",
      "GCP",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "SageMaker",
      "Vertex AI",
      "Databricks",
      "Snowflake",
      "Airflow",
      "MLOps",
      "CI/CD",
    ],
  },
  {
    name: "AI/ML Techniques",
    weight: 2.0,
    keywords: [
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "NLP",
      "Natural Language Processing",
      "Computer Vision",
      "Reinforcement Learning",
      "Generative AI",
      "LLM",
      "Large Language Models",
      "RAG",
      "Retrieval Augmented Generation",
      "Fine-tuning",
      "Transfer Learning",
      "Feature Engineering",
      "Model Training",
      "Model Deployment",
      "A/B Testing",
      "Recommendation Systems",
      "Time Series",
      "Anomaly Detection",
      "Classification",
      "Regression",
      "Clustering",
      "Transformers",
      "Prompt Engineering",
    ],
  },
  {
    name: "Data Tools",
    weight: 1.5,
    keywords: [
      "Pandas",
      "NumPy",
      "Spark",
      "PySpark",
      "Hadoop",
      "Dask",
      "Polars",
      "SQL",
      "NoSQL",
      "MongoDB",
      "PostgreSQL",
      "Redis",
      "Elasticsearch",
      "Data Pipelines",
      "ETL",
      "Data Warehousing",
    ],
  },
  {
    name: "Soft Skills & Leadership",
    weight: 1.0,
    keywords: [
      "Team Lead",
      "Leadership",
      "Mentoring",
      "Cross-functional",
      "Stakeholder",
      "Communication",
      "Problem-solving",
      "Collaboration",
      "Agile",
      "Scrum",
      "Product",
      "Strategy",
    ],
  },
];

export const HEADLINE_TEMPLATES = [
  "{role} | {specialty} | {value_prop}",
  "{role} specialising in {specialty} | {value_prop}",
  "{specialty} Expert | {role} | {value_prop}",
  "Helping {audience} with {value_prop} | {role}",
  "{role} | Building {product_type} | {specialty}",
];

export const AI_ROLES = [
  "Machine Learning Engineer",
  "ML Engineer",
  "Data Scientist",
  "AI Engineer",
  "AI/ML Engineer",
  "NLP Engineer",
  "Computer Vision Engineer",
  "Deep Learning Engineer",
  "MLOps Engineer",
  "Research Scientist",
  "AI Researcher",
  "Data Engineer",
  "Analytics Engineer",
  "Principal Engineer",
  "Staff Engineer",
  "Senior Engineer",
  "Lead Engineer",
  "Tech Lead",
  "Engineering Manager",
  "Head of AI",
  "Head of ML",
  "Director of AI",
  "VP of Engineering",
];

export const POWER_WORDS = [
  "Led",
  "Built",
  "Developed",
  "Designed",
  "Implemented",
  "Optimised",
  "Scaled",
  "Deployed",
  "Architected",
  "Launched",
  "Improved",
  "Increased",
  "Reduced",
  "Automated",
  "Streamlined",
  "Transformed",
  "Delivered",
  "Achieved",
  "Generated",
  "Pioneered",
];

export const RECRUITER_FRIENDLY_PHRASES = [
  "Open to opportunities",
  "Looking for new challenges",
  "Seeking",
  "Available for",
  "Passionate about",
  "Experienced in",
  "Specialising in",
  "Expert in",
  "Skilled in",
];

export const VALUE_PROPOSITIONS = [
  "Turning data into actionable insights",
  "Building production ML systems",
  "Driving business outcomes with AI",
  "Making AI accessible and impactful",
  "Solving complex problems with data",
  "Delivering AI solutions at scale",
  "Bridging research and production",
  "Democratising machine learning",
];

export const SPECIALTIES = [
  "NLP",
  "Computer Vision",
  "Deep Learning",
  "Generative AI",
  "LLMs",
  "Recommender Systems",
  "Time Series",
  "MLOps",
  "Data Engineering",
  "Analytics",
];

export function getAllKeywords(): string[] {
  const allKeywords = AI_KEYWORDS.flatMap((category) => category.keywords);
  return [...new Set(allKeywords)];
}

export function getMaxPossibleScore(): number {
  return AI_KEYWORDS.reduce(
    (sum, category) => sum + category.keywords.length * category.weight,
    0
  );
}

export function getCategoryByName(name: string): KeywordCategory | undefined {
  return AI_KEYWORDS.find((cat) => cat.name === name);
}
