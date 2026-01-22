// Skills database for gap analysis

export interface Skill {
  name: string;
  category: string;
  aliases: string[]; // Alternative names/spellings to match
  importance: "essential" | "important" | "nice-to-have";
  learningResources?: LearningResource[];
}

export interface LearningResource {
  name: string;
  type: "course" | "documentation" | "tutorial" | "certification";
  url: string;
  provider: string;
  isFree: boolean;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: Skill[];
}

// Comprehensive skills database for AI/ML roles
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Programming Languages",
    description: "Core programming languages for AI/ML development",
    skills: [
      {
        name: "Python",
        category: "Programming Languages",
        aliases: ["python3", "python 3", "py"],
        importance: "essential",
        learningResources: [
          { name: "Python for Everybody", type: "course", url: "https://www.coursera.org/specializations/python", provider: "Coursera", isFree: true },
          { name: "Official Python Tutorial", type: "documentation", url: "https://docs.python.org/3/tutorial/", provider: "Python.org", isFree: true },
        ],
      },
      {
        name: "R",
        category: "Programming Languages",
        aliases: ["r programming", "r language", "r stats"],
        importance: "important",
        learningResources: [
          { name: "R Programming", type: "course", url: "https://www.coursera.org/learn/r-programming", provider: "Coursera", isFree: true },
        ],
      },
      {
        name: "SQL",
        category: "Programming Languages",
        aliases: ["mysql", "postgresql", "postgres", "sqlite", "tsql", "pl/sql"],
        importance: "essential",
        learningResources: [
          { name: "SQL for Data Science", type: "course", url: "https://www.coursera.org/learn/sql-for-data-science", provider: "Coursera", isFree: true },
        ],
      },
      {
        name: "Java",
        category: "Programming Languages",
        aliases: ["java8", "java11", "java17", "jvm"],
        importance: "important",
      },
      {
        name: "Scala",
        category: "Programming Languages",
        aliases: ["scala 2", "scala 3"],
        importance: "nice-to-have",
      },
      {
        name: "C++",
        category: "Programming Languages",
        aliases: ["cpp", "c plus plus"],
        importance: "nice-to-have",
      },
      {
        name: "JavaScript",
        category: "Programming Languages",
        aliases: ["js", "es6", "ecmascript", "node.js", "nodejs"],
        importance: "nice-to-have",
      },
      {
        name: "TypeScript",
        category: "Programming Languages",
        aliases: ["ts"],
        importance: "nice-to-have",
      },
      {
        name: "Go",
        category: "Programming Languages",
        aliases: ["golang"],
        importance: "nice-to-have",
      },
      {
        name: "Rust",
        category: "Programming Languages",
        aliases: ["rust-lang"],
        importance: "nice-to-have",
      },
      {
        name: "Julia",
        category: "Programming Languages",
        aliases: ["julialang"],
        importance: "nice-to-have",
      },
    ],
  },
  {
    name: "ML/AI Frameworks",
    description: "Machine learning and deep learning frameworks",
    skills: [
      {
        name: "TensorFlow",
        category: "ML/AI Frameworks",
        aliases: ["tf", "tensorflow 2", "tf2"],
        importance: "essential",
        learningResources: [
          { name: "TensorFlow Developer Certificate", type: "certification", url: "https://www.tensorflow.org/certificate", provider: "Google", isFree: false },
          { name: "TensorFlow Tutorials", type: "documentation", url: "https://www.tensorflow.org/tutorials", provider: "TensorFlow", isFree: true },
        ],
      },
      {
        name: "PyTorch",
        category: "ML/AI Frameworks",
        aliases: ["torch", "pytorch lightning"],
        importance: "essential",
        learningResources: [
          { name: "PyTorch Tutorials", type: "documentation", url: "https://pytorch.org/tutorials/", provider: "PyTorch", isFree: true },
          { name: "Deep Learning with PyTorch", type: "course", url: "https://www.udacity.com/course/deep-learning-pytorch--ud188", provider: "Udacity", isFree: true },
        ],
      },
      {
        name: "Keras",
        category: "ML/AI Frameworks",
        aliases: ["keras api"],
        importance: "important",
      },
      {
        name: "scikit-learn",
        category: "ML/AI Frameworks",
        aliases: ["sklearn", "scikit learn"],
        importance: "essential",
        learningResources: [
          { name: "scikit-learn Tutorials", type: "documentation", url: "https://scikit-learn.org/stable/tutorial/index.html", provider: "scikit-learn", isFree: true },
        ],
      },
      {
        name: "XGBoost",
        category: "ML/AI Frameworks",
        aliases: ["xgb"],
        importance: "important",
      },
      {
        name: "LightGBM",
        category: "ML/AI Frameworks",
        aliases: ["lgbm", "light gbm"],
        importance: "nice-to-have",
      },
      {
        name: "Hugging Face",
        category: "ML/AI Frameworks",
        aliases: ["huggingface", "transformers", "hf"],
        importance: "essential",
        learningResources: [
          { name: "Hugging Face Course", type: "course", url: "https://huggingface.co/learn", provider: "Hugging Face", isFree: true },
        ],
      },
      {
        name: "LangChain",
        category: "ML/AI Frameworks",
        aliases: ["lang chain"],
        importance: "important",
        learningResources: [
          { name: "LangChain Documentation", type: "documentation", url: "https://python.langchain.com/docs/", provider: "LangChain", isFree: true },
        ],
      },
      {
        name: "OpenAI API",
        category: "ML/AI Frameworks",
        aliases: ["openai", "gpt api", "chatgpt api", "gpt-4", "gpt-3"],
        importance: "important",
      },
      {
        name: "JAX",
        category: "ML/AI Frameworks",
        aliases: ["google jax"],
        importance: "nice-to-have",
      },
      {
        name: "ONNX",
        category: "ML/AI Frameworks",
        aliases: ["open neural network exchange"],
        importance: "nice-to-have",
      },
      {
        name: "Pandas",
        category: "ML/AI Frameworks",
        aliases: ["pandas dataframe"],
        importance: "essential",
      },
      {
        name: "NumPy",
        category: "ML/AI Frameworks",
        aliases: ["numpy array", "np"],
        importance: "essential",
      },
      {
        name: "OpenCV",
        category: "ML/AI Frameworks",
        aliases: ["cv2", "opencv-python"],
        importance: "important",
      },
      {
        name: "spaCy",
        category: "ML/AI Frameworks",
        aliases: ["spacy"],
        importance: "important",
      },
      {
        name: "NLTK",
        category: "ML/AI Frameworks",
        aliases: ["natural language toolkit"],
        importance: "nice-to-have",
      },
    ],
  },
  {
    name: "Cloud Platforms",
    description: "Cloud computing and ML platforms",
    skills: [
      {
        name: "AWS",
        category: "Cloud Platforms",
        aliases: ["amazon web services", "sagemaker", "ec2", "s3", "aws lambda"],
        importance: "essential",
        learningResources: [
          { name: "AWS Machine Learning Specialty", type: "certification", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", provider: "AWS", isFree: false },
          { name: "AWS Free Tier", type: "tutorial", url: "https://aws.amazon.com/free/", provider: "AWS", isFree: true },
        ],
      },
      {
        name: "Azure",
        category: "Cloud Platforms",
        aliases: ["microsoft azure", "azure ml", "azure machine learning"],
        importance: "important",
        learningResources: [
          { name: "Azure AI Engineer Associate", type: "certification", url: "https://learn.microsoft.com/en-us/certifications/azure-ai-engineer/", provider: "Microsoft", isFree: false },
        ],
      },
      {
        name: "GCP",
        category: "Cloud Platforms",
        aliases: ["google cloud", "google cloud platform", "bigquery", "vertex ai", "cloud ai"],
        importance: "important",
        learningResources: [
          { name: "Google Cloud ML Engineer", type: "certification", url: "https://cloud.google.com/certification/machine-learning-engineer", provider: "Google", isFree: false },
        ],
      },
    ],
  },
  {
    name: "Data Tools",
    description: "Data processing and engineering tools",
    skills: [
      {
        name: "Spark",
        category: "Data Tools",
        aliases: ["apache spark", "pyspark", "spark sql"],
        importance: "important",
        learningResources: [
          { name: "Apache Spark Documentation", type: "documentation", url: "https://spark.apache.org/docs/latest/", provider: "Apache", isFree: true },
        ],
      },
      {
        name: "Hadoop",
        category: "Data Tools",
        aliases: ["hdfs", "hive", "apache hadoop"],
        importance: "nice-to-have",
      },
      {
        name: "Kafka",
        category: "Data Tools",
        aliases: ["apache kafka", "kafka streams"],
        importance: "nice-to-have",
      },
      {
        name: "Airflow",
        category: "Data Tools",
        aliases: ["apache airflow"],
        importance: "important",
        learningResources: [
          { name: "Airflow Documentation", type: "documentation", url: "https://airflow.apache.org/docs/", provider: "Apache", isFree: true },
        ],
      },
      {
        name: "dbt",
        category: "Data Tools",
        aliases: ["data build tool"],
        importance: "important",
      },
      {
        name: "Databricks",
        category: "Data Tools",
        aliases: ["databricks workspace"],
        importance: "important",
      },
      {
        name: "Snowflake",
        category: "Data Tools",
        aliases: ["snowflake data cloud"],
        importance: "important",
      },
    ],
  },
  {
    name: "MLOps & DevOps",
    description: "ML operations and deployment tools",
    skills: [
      {
        name: "Docker",
        category: "MLOps & DevOps",
        aliases: ["containerisation", "containerization", "dockerfile"],
        importance: "essential",
        learningResources: [
          { name: "Docker Documentation", type: "documentation", url: "https://docs.docker.com/", provider: "Docker", isFree: true },
        ],
      },
      {
        name: "Kubernetes",
        category: "MLOps & DevOps",
        aliases: ["k8s", "kubectl"],
        importance: "important",
        learningResources: [
          { name: "Kubernetes Documentation", type: "documentation", url: "https://kubernetes.io/docs/home/", provider: "Kubernetes", isFree: true },
        ],
      },
      {
        name: "MLflow",
        category: "MLOps & DevOps",
        aliases: ["ml flow"],
        importance: "important",
        learningResources: [
          { name: "MLflow Documentation", type: "documentation", url: "https://mlflow.org/docs/latest/index.html", provider: "MLflow", isFree: true },
        ],
      },
      {
        name: "Kubeflow",
        category: "MLOps & DevOps",
        aliases: ["kube flow"],
        importance: "nice-to-have",
      },
      {
        name: "Git",
        category: "MLOps & DevOps",
        aliases: ["github", "gitlab", "version control", "git version control"],
        importance: "essential",
      },
      {
        name: "CI/CD",
        category: "MLOps & DevOps",
        aliases: ["cicd", "continuous integration", "continuous deployment", "github actions", "jenkins"],
        importance: "important",
      },
      {
        name: "Terraform",
        category: "MLOps & DevOps",
        aliases: ["infrastructure as code", "iac"],
        importance: "nice-to-have",
      },
      {
        name: "FastAPI",
        category: "MLOps & DevOps",
        aliases: ["fast api"],
        importance: "important",
      },
      {
        name: "Flask",
        category: "MLOps & DevOps",
        aliases: ["flask api"],
        importance: "nice-to-have",
      },
    ],
  },
  {
    name: "AI/ML Techniques",
    description: "Machine learning concepts and methodologies",
    skills: [
      {
        name: "Machine Learning",
        category: "AI/ML Techniques",
        aliases: ["ml", "statistical learning"],
        importance: "essential",
        learningResources: [
          { name: "Machine Learning by Andrew Ng", type: "course", url: "https://www.coursera.org/learn/machine-learning", provider: "Coursera", isFree: true },
        ],
      },
      {
        name: "Deep Learning",
        category: "AI/ML Techniques",
        aliases: ["dl", "neural networks", "neural network"],
        importance: "essential",
        learningResources: [
          { name: "Deep Learning Specialization", type: "course", url: "https://www.coursera.org/specializations/deep-learning", provider: "Coursera", isFree: true },
        ],
      },
      {
        name: "NLP",
        category: "AI/ML Techniques",
        aliases: ["natural language processing", "text mining", "text analytics", "nlp models"],
        importance: "important",
        learningResources: [
          { name: "NLP Specialization", type: "course", url: "https://www.coursera.org/specializations/natural-language-processing", provider: "Coursera", isFree: true },
        ],
      },
      {
        name: "Computer Vision",
        category: "AI/ML Techniques",
        aliases: ["cv", "image recognition", "object detection", "image classification"],
        importance: "important",
      },
      {
        name: "LLMs",
        category: "AI/ML Techniques",
        aliases: ["large language models", "llm", "generative ai", "gen ai", "genai"],
        importance: "essential",
      },
      {
        name: "Transformers",
        category: "AI/ML Techniques",
        aliases: ["transformer architecture", "attention mechanism", "bert", "gpt"],
        importance: "important",
      },
      {
        name: "Reinforcement Learning",
        category: "AI/ML Techniques",
        aliases: ["rl", "reward learning"],
        importance: "nice-to-have",
      },
      {
        name: "Time Series",
        category: "AI/ML Techniques",
        aliases: ["time series analysis", "forecasting", "arima", "prophet"],
        importance: "important",
      },
      {
        name: "Recommendation Systems",
        category: "AI/ML Techniques",
        aliases: ["recommender systems", "collaborative filtering", "content-based filtering"],
        importance: "nice-to-have",
      },
      {
        name: "RAG",
        category: "AI/ML Techniques",
        aliases: ["retrieval augmented generation", "retrieval-augmented generation"],
        importance: "important",
      },
      {
        name: "Fine-tuning",
        category: "AI/ML Techniques",
        aliases: ["fine tuning", "finetuning", "model fine-tuning"],
        importance: "important",
      },
      {
        name: "Prompt Engineering",
        category: "AI/ML Techniques",
        aliases: ["prompt design", "prompt optimization"],
        importance: "important",
      },
      {
        name: "Feature Engineering",
        category: "AI/ML Techniques",
        aliases: ["feature extraction", "feature selection"],
        importance: "essential",
      },
      {
        name: "Model Evaluation",
        category: "AI/ML Techniques",
        aliases: ["model validation", "cross-validation", "hyperparameter tuning"],
        importance: "essential",
      },
    ],
  },
  {
    name: "Databases",
    description: "Database technologies",
    skills: [
      {
        name: "PostgreSQL",
        category: "Databases",
        aliases: ["postgres"],
        importance: "important",
      },
      {
        name: "MongoDB",
        category: "Databases",
        aliases: ["mongo", "nosql"],
        importance: "nice-to-have",
      },
      {
        name: "Redis",
        category: "Databases",
        aliases: ["redis cache"],
        importance: "nice-to-have",
      },
      {
        name: "Elasticsearch",
        category: "Databases",
        aliases: ["elastic search", "elastic"],
        importance: "nice-to-have",
      },
      {
        name: "Vector Databases",
        category: "Databases",
        aliases: ["pinecone", "weaviate", "chroma", "pgvector", "milvus", "qdrant"],
        importance: "important",
      },
    ],
  },
  {
    name: "Soft Skills",
    description: "Professional and interpersonal skills",
    skills: [
      {
        name: "Communication",
        category: "Soft Skills",
        aliases: ["communication skills", "written communication", "verbal communication", "stakeholder communication"],
        importance: "essential",
      },
      {
        name: "Leadership",
        category: "Soft Skills",
        aliases: ["team leadership", "technical leadership", "mentoring", "mentor"],
        importance: "important",
      },
      {
        name: "Problem Solving",
        category: "Soft Skills",
        aliases: ["problem-solving", "analytical thinking", "critical thinking"],
        importance: "essential",
      },
      {
        name: "Collaboration",
        category: "Soft Skills",
        aliases: ["teamwork", "cross-functional", "collaborative"],
        importance: "essential",
      },
      {
        name: "Agile",
        category: "Soft Skills",
        aliases: ["scrum", "sprint", "kanban", "agile methodology"],
        importance: "important",
      },
      {
        name: "Research",
        category: "Soft Skills",
        aliases: ["research skills", "literature review", "academic research"],
        importance: "important",
      },
      {
        name: "Presentation",
        category: "Soft Skills",
        aliases: ["presentation skills", "public speaking", "data storytelling"],
        importance: "important",
      },
    ],
  },
];

// Get all skills as a flat array
export function getAllSkills(): Skill[] {
  return SKILL_CATEGORIES.flatMap((category) => category.skills);
}

// Get skill by name (case-insensitive)
export function getSkillByName(name: string): Skill | undefined {
  const lowerName = name.toLowerCase();
  return getAllSkills().find(
    (skill) =>
      skill.name.toLowerCase() === lowerName ||
      skill.aliases.some((alias) => alias.toLowerCase() === lowerName)
  );
}

// Get skills by category
export function getSkillsByCategory(categoryName: string): Skill[] {
  const category = SKILL_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.skills || [];
}
