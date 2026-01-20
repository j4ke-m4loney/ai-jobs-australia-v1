// Skill categories with keywords to detect
export interface SkillPattern {
  skill: string;
  patterns: string[]; // case-insensitive patterns to match
  category: string;
}

export interface RedFlag {
  flag: string;
  patterns: string[];
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface ExperiencePattern {
  level: string;
  patterns: string[];
  yearsRange: string;
}

export interface SalaryHint {
  hint: string;
  patterns: string[];
  interpretation: string;
}

export interface BenefitPattern {
  benefit: string;
  patterns: string[];
  category: string;
}

// Technical skills to detect
export const SKILL_PATTERNS: SkillPattern[] = [
  // Programming Languages
  { skill: "Python", patterns: ["python"], category: "Programming Languages" },
  { skill: "R", patterns: ["\\br\\b", "r programming", "r language"], category: "Programming Languages" },
  { skill: "SQL", patterns: ["sql", "mysql", "postgresql", "postgres"], category: "Programming Languages" },
  { skill: "Java", patterns: ["\\bjava\\b"], category: "Programming Languages" },
  { skill: "Scala", patterns: ["scala"], category: "Programming Languages" },
  { skill: "C++", patterns: ["c\\+\\+", "cpp"], category: "Programming Languages" },
  { skill: "JavaScript", patterns: ["javascript", "\\bjs\\b"], category: "Programming Languages" },
  { skill: "TypeScript", patterns: ["typescript", "\\bts\\b"], category: "Programming Languages" },
  { skill: "Go", patterns: ["\\bgolang\\b", "\\bgo\\b(?!od)"], category: "Programming Languages" },
  { skill: "Rust", patterns: ["\\brust\\b"], category: "Programming Languages" },
  { skill: "Julia", patterns: ["\\bjulia\\b"], category: "Programming Languages" },

  // ML/AI Frameworks
  { skill: "TensorFlow", patterns: ["tensorflow", "tf\\."], category: "ML/AI Frameworks" },
  { skill: "PyTorch", patterns: ["pytorch", "torch"], category: "ML/AI Frameworks" },
  { skill: "Keras", patterns: ["keras"], category: "ML/AI Frameworks" },
  { skill: "scikit-learn", patterns: ["scikit-learn", "sklearn", "scikit learn"], category: "ML/AI Frameworks" },
  { skill: "XGBoost", patterns: ["xgboost"], category: "ML/AI Frameworks" },
  { skill: "LightGBM", patterns: ["lightgbm"], category: "ML/AI Frameworks" },
  { skill: "Hugging Face", patterns: ["hugging face", "huggingface", "transformers library"], category: "ML/AI Frameworks" },
  { skill: "LangChain", patterns: ["langchain"], category: "ML/AI Frameworks" },
  { skill: "OpenAI API", patterns: ["openai", "gpt-4", "gpt-3", "chatgpt api"], category: "ML/AI Frameworks" },
  { skill: "JAX", patterns: ["\\bjax\\b"], category: "ML/AI Frameworks" },
  { skill: "ONNX", patterns: ["onnx"], category: "ML/AI Frameworks" },

  // Cloud Platforms
  { skill: "AWS", patterns: ["aws", "amazon web services", "sagemaker", "ec2", "s3"], category: "Cloud Platforms" },
  { skill: "Azure", patterns: ["azure", "microsoft azure"], category: "Cloud Platforms" },
  { skill: "GCP", patterns: ["gcp", "google cloud", "bigquery", "vertex ai"], category: "Cloud Platforms" },

  // Data Tools
  { skill: "Spark", patterns: ["spark", "pyspark", "apache spark"], category: "Data Tools" },
  { skill: "Hadoop", patterns: ["hadoop", "hdfs", "hive"], category: "Data Tools" },
  { skill: "Kafka", patterns: ["kafka"], category: "Data Tools" },
  { skill: "Airflow", patterns: ["airflow"], category: "Data Tools" },
  { skill: "dbt", patterns: ["\\bdbt\\b", "data build tool"], category: "Data Tools" },
  { skill: "Databricks", patterns: ["databricks"], category: "Data Tools" },
  { skill: "Snowflake", patterns: ["snowflake"], category: "Data Tools" },
  { skill: "Pandas", patterns: ["pandas"], category: "Data Tools" },
  { skill: "NumPy", patterns: ["numpy"], category: "Data Tools" },

  // MLOps & DevOps
  { skill: "Docker", patterns: ["docker", "containerisation", "containerization"], category: "MLOps & DevOps" },
  { skill: "Kubernetes", patterns: ["kubernetes", "k8s"], category: "MLOps & DevOps" },
  { skill: "MLflow", patterns: ["mlflow"], category: "MLOps & DevOps" },
  { skill: "Kubeflow", patterns: ["kubeflow"], category: "MLOps & DevOps" },
  { skill: "Git", patterns: ["\\bgit\\b", "github", "gitlab", "version control"], category: "MLOps & DevOps" },
  { skill: "CI/CD", patterns: ["ci/cd", "cicd", "continuous integration", "continuous deployment"], category: "MLOps & DevOps" },
  { skill: "Terraform", patterns: ["terraform"], category: "MLOps & DevOps" },
  { skill: "Jenkins", patterns: ["jenkins"], category: "MLOps & DevOps" },

  // AI/ML Techniques
  { skill: "Machine Learning", patterns: ["machine learning", "\\bml\\b"], category: "AI/ML Techniques" },
  { skill: "Deep Learning", patterns: ["deep learning", "neural network", "\\bdl\\b"], category: "AI/ML Techniques" },
  { skill: "NLP", patterns: ["\\bnlp\\b", "natural language processing", "text mining", "text analytics"], category: "AI/ML Techniques" },
  { skill: "Computer Vision", patterns: ["computer vision", "image recognition", "object detection", "\\bcv\\b"], category: "AI/ML Techniques" },
  { skill: "LLMs", patterns: ["\\bllm\\b", "large language model", "generative ai", "gen ai"], category: "AI/ML Techniques" },
  { skill: "Transformers", patterns: ["transformer", "attention mechanism", "\\bbert\\b", "\\bgpt\\b"], category: "AI/ML Techniques" },
  { skill: "Reinforcement Learning", patterns: ["reinforcement learning", "\\brl\\b"], category: "AI/ML Techniques" },
  { skill: "Time Series", patterns: ["time series", "forecasting", "arima", "prophet"], category: "AI/ML Techniques" },
  { skill: "Recommendation Systems", patterns: ["recommendation system", "recommender", "collaborative filtering"], category: "AI/ML Techniques" },
  { skill: "RAG", patterns: ["\\brag\\b", "retrieval augmented", "retrieval-augmented"], category: "AI/ML Techniques" },
  { skill: "Fine-tuning", patterns: ["fine-tuning", "fine tuning", "finetuning"], category: "AI/ML Techniques" },
  { skill: "Prompt Engineering", patterns: ["prompt engineering", "prompt design"], category: "AI/ML Techniques" },

  // Databases
  { skill: "PostgreSQL", patterns: ["postgresql", "postgres"], category: "Databases" },
  { skill: "MongoDB", patterns: ["mongodb", "mongo"], category: "Databases" },
  { skill: "Redis", patterns: ["redis"], category: "Databases" },
  { skill: "Elasticsearch", patterns: ["elasticsearch", "elastic search"], category: "Databases" },
  { skill: "Vector Databases", patterns: ["pinecone", "weaviate", "chroma", "vector database", "pgvector", "milvus"], category: "Databases" },

  // Soft Skills
  { skill: "Communication", patterns: ["communication skills", "communicate effectively", "stakeholder communication"], category: "Soft Skills" },
  { skill: "Leadership", patterns: ["leadership", "lead a team", "team lead", "mentor"], category: "Soft Skills" },
  { skill: "Problem Solving", patterns: ["problem solving", "problem-solving", "analytical thinking"], category: "Soft Skills" },
  { skill: "Collaboration", patterns: ["collaboration", "collaborative", "cross-functional", "work closely with"], category: "Soft Skills" },
  { skill: "Agile", patterns: ["agile", "scrum", "sprint", "kanban"], category: "Soft Skills" },
];

// Experience level patterns
export const EXPERIENCE_PATTERNS: ExperiencePattern[] = [
  {
    level: "Entry Level / Graduate",
    patterns: [
      "entry level", "entry-level", "graduate", "new grad", "0-1 year", "0-2 year",
      "junior", "no experience required", "recent graduate", "intern", "internship",
      "early career", "starting your career"
    ],
    yearsRange: "0-2 years",
  },
  {
    level: "Junior",
    patterns: [
      "junior", "1-2 year", "1-3 year", "2 years experience", "1\\+ year",
      "some experience", "early in your career"
    ],
    yearsRange: "1-3 years",
  },
  {
    level: "Mid-Level",
    patterns: [
      "mid-level", "mid level", "intermediate", "2-5 year", "3-5 year",
      "3\\+ year", "4\\+ year", "several years", "proven experience"
    ],
    yearsRange: "3-5 years",
  },
  {
    level: "Senior",
    patterns: [
      "senior", "5\\+ year", "5-7 year", "5-10 year", "6\\+ year", "7\\+ year",
      "extensive experience", "strong experience", "deep experience", "significant experience"
    ],
    yearsRange: "5-10 years",
  },
  {
    level: "Lead / Staff",
    patterns: [
      "lead", "staff", "principal", "8\\+ year", "10\\+ year", "tech lead",
      "team lead", "architect", "expert level"
    ],
    yearsRange: "8+ years",
  },
  {
    level: "Director / Head",
    patterns: [
      "director", "head of", "vp ", "vice president", "chief", "cto", "cdo",
      "executive", "c-level", "10\\+ year", "15\\+ year"
    ],
    yearsRange: "10+ years",
  },
];

// Salary hint patterns
export const SALARY_HINTS: SalaryHint[] = [
  {
    hint: "Competitive salary mentioned",
    patterns: ["competitive salary", "competitive compensation", "competitive package", "competitive remuneration"],
    interpretation: "Usually means market rate or slightly above. Worth asking for specific range.",
  },
  {
    hint: "Salary range provided",
    patterns: ["\\$\\d+[k,]", "\\d+k-\\d+k", "salary range", "\\d+,000"],
    interpretation: "Transparent about pay - a positive sign.",
  },
  {
    hint: "Equity/Stock options mentioned",
    patterns: ["equity", "stock option", "shares", "esop", "rsu", "ownership"],
    interpretation: "Common in startups and tech companies. Can significantly increase total compensation.",
  },
  {
    hint: "Bonus structure mentioned",
    patterns: ["bonus", "performance bonus", "annual bonus", "incentive"],
    interpretation: "Additional compensation tied to performance. Ask about typical bonus percentages.",
  },
  {
    hint: "Benefits emphasized",
    patterns: ["generous benefits", "comprehensive benefits", "great benefits", "benefits package"],
    interpretation: "May compensate for lower base salary with strong benefits.",
  },
  {
    hint: "No salary information",
    patterns: [],
    interpretation: "Salary not mentioned - you'll need to ask directly or research market rates.",
  },
];

// Red flags to watch out for
export const RED_FLAGS: RedFlag[] = [
  {
    flag: "Unrealistic expectations",
    patterns: ["rockstar", "ninja", "guru", "wizard", "unicorn", "superhero", "10x developer"],
    explanation: "These terms often signal unrealistic expectations or an immature hiring culture.",
    severity: "medium",
  },
  {
    flag: "Work-life balance concerns",
    patterns: ["fast-paced", "fast paced", "high pressure", "tight deadlines", "demanding environment", "hustle", "grinding"],
    explanation: "May indicate long hours, high stress, or poor work-life balance.",
    severity: "medium",
  },
  {
    flag: "Vague responsibilities",
    patterns: ["wear many hats", "various duties", "other duties as assigned", "do whatever it takes", "jack of all trades"],
    explanation: "Unclear role definition may lead to scope creep or being stretched too thin.",
    severity: "medium",
  },
  {
    flag: "Potential understaffing",
    patterns: ["small team", "lean team", "startup mentality", "scrappy", "do more with less", "resource constrained"],
    explanation: "May mean you'll be doing multiple jobs or lacking support.",
    severity: "low",
  },
  {
    flag: "Family language",
    patterns: ["we're a family", "like a family", "family environment", "family culture"],
    explanation: "Often used to justify overwork, blur professional boundaries, or guilt employees.",
    severity: "medium",
  },
  {
    flag: "Unpaid overtime hints",
    patterns: ["above and beyond", "go the extra mile", "whatever it takes", "flexible hours", "occasional weekend"],
    explanation: "May suggest expectation of unpaid overtime or poor boundaries.",
    severity: "low",
  },
  {
    flag: "High turnover signals",
    patterns: ["immediate start", "urgent hire", "asap", "quick turnaround", "hit the ground running"],
    explanation: "Urgency may indicate high turnover or poor planning. Ask why the role is open.",
    severity: "low",
  },
  {
    flag: "Overqualified for pay",
    patterns: ["phd required", "phd preferred", "doctoral"],
    explanation: "PhD requirements for non-research roles may indicate underpaying for expertise.",
    severity: "low",
  },
  {
    flag: "Excessive requirements",
    patterns: ["must have all", "extensive experience in all", "expert in all"],
    explanation: "Unrealistic requirement lists may indicate the employer doesn't understand the role.",
    severity: "medium",
  },
  {
    flag: "No remote/flexibility mentioned",
    patterns: ["on-site only", "office based", "in-office", "no remote", "must be located"],
    explanation: "Not necessarily a red flag, but worth confirming flexibility if important to you.",
    severity: "low",
  },
];

// Benefits and perks to highlight
export const BENEFIT_PATTERNS: BenefitPattern[] = [
  { benefit: "Remote Work", patterns: ["remote", "work from home", "wfh", "hybrid", "flexible location"], category: "Work Arrangement" },
  { benefit: "Flexible Hours", patterns: ["flexible hours", "flexible schedule", "flextime", "flex time"], category: "Work Arrangement" },
  { benefit: "Learning Budget", patterns: ["learning budget", "training budget", "professional development", "conference", "upskilling"], category: "Growth" },
  { benefit: "Health Insurance", patterns: ["health insurance", "medical insurance", "private health", "health cover"], category: "Health" },
  { benefit: "Parental Leave", patterns: ["parental leave", "maternity", "paternity", "family leave"], category: "Family" },
  { benefit: "Superannuation", patterns: ["superannuation", "super contribution", "above award super"], category: "Financial" },
  { benefit: "Equity", patterns: ["equity", "stock option", "shares", "esop", "ownership stake"], category: "Financial" },
  { benefit: "Annual Leave", patterns: ["annual leave", "vacation", "pto", "paid time off", "4 weeks", "5 weeks"], category: "Leave" },
  { benefit: "Wellbeing", patterns: ["wellbeing", "wellness", "mental health", "gym", "fitness"], category: "Health" },
  { benefit: "Team Events", patterns: ["team event", "team building", "social", "friday drinks", "team lunch"], category: "Culture" },
];

// Nice-to-have vs required keywords
export const REQUIRED_INDICATORS = [
  "must have", "required", "essential", "mandatory", "need to have",
  "you will have", "you should have", "requirements:", "minimum requirements",
  "key requirements", "qualifications:", "must be", "must possess"
];

export const NICE_TO_HAVE_INDICATORS = [
  "nice to have", "nice-to-have", "preferred", "bonus", "plus",
  "advantageous", "desirable", "ideally", "would be great", "good to have",
  "not essential", "optional", "a plus", "an advantage"
];
