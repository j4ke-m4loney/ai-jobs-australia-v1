// Target roles for portfolio projects
export const TARGET_ROLES = [
  "Machine Learning Engineer",
  "Data Scientist",
  "AI/ML Researcher",
  "Data Engineer",
  "MLOps Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number];

// Experience levels
export const EXPERIENCE_LEVELS = [
  { value: "Junior", label: "Junior (0-2 years)", description: "Entry-level, learning fundamentals" },
  { value: "Mid", label: "Mid-Level (2-5 years)", description: "Some experience, building depth" },
  { value: "Senior", label: "Senior (5+ years)", description: "Experienced, demonstrating leadership" },
] as const;

export type ExperienceLevel = "Junior" | "Mid" | "Senior";

// Time commitment options
export const TIME_COMMITMENTS = [
  { value: "weekend", label: "Weekend Project", hours: "8-16 hours", description: "Quick win to show basic skills" },
  { value: "2-weeks", label: "2 Week Sprint", hours: "20-40 hours", description: "Solid demonstration project" },
  { value: "1-month", label: "1 Month Deep Dive", hours: "40-80 hours", description: "Comprehensive showcase piece" },
  { value: "2-months", label: "2+ Months", hours: "80+ hours", description: "Portfolio centrepiece with depth" },
] as const;

export type TimeCommitment = "weekend" | "2-weeks" | "1-month" | "2-months";

// Skill categories
export const SKILL_CATEGORIES = [
  "Python",
  "TensorFlow/Keras",
  "PyTorch",
  "Scikit-learn",
  "Computer Vision",
  "NLP/LLMs",
  "Time Series",
  "Recommendation Systems",
  "MLOps/Deployment",
  "Data Engineering",
  "SQL/Databases",
  "Cloud (AWS/GCP/Azure)",
  "Deep Learning",
  "Statistics",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

// Interest areas
export const INTEREST_AREAS = [
  "Healthcare/Medical",
  "Finance/Trading",
  "E-commerce/Retail",
  "Climate/Environment",
  "Sports/Gaming",
  "Social Good",
  "Creative/Art",
  "Productivity Tools",
  "Autonomous Systems",
  "Education",
] as const;

export type InterestArea = (typeof INTEREST_AREAS)[number];

// Project complexity
export type Complexity = "Beginner" | "Intermediate" | "Advanced";

// Dataset sources
export interface DatasetSuggestion {
  name: string;
  url: string;
  description: string;
}

// Project template
export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  complexity: Complexity;
  timeRequired: TimeCommitment[];
  targetRoles: TargetRole[];
  experienceLevels: ExperienceLevel[];
  skillsRequired: SkillCategory[];
  skillsLearned: string[];
  interestAreas: InterestArea[];
  techStack: string[];
  datasets: DatasetSuggestion[];
  resumeValue: string;
  interviewTalkingPoints: string[];
  extendedFeatures: string[];
  australianRelevance?: string;
}

// Project database
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Machine Learning Engineer projects
  {
    id: "ml-fraud-detection",
    title: "Real-Time Fraud Detection System",
    description: "Build a fraud detection pipeline that processes transactions in real-time, using ensemble methods and anomaly detection to flag suspicious activity with explainable predictions.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Machine Learning Engineer", "Data Scientist"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Scikit-learn", "SQL/Databases"],
    skillsLearned: ["Imbalanced data handling", "Real-time inference", "Model explainability", "Feature engineering for fraud"],
    interestAreas: ["Finance/Trading"],
    techStack: ["Python", "Scikit-learn", "XGBoost", "SHAP", "FastAPI", "Redis"],
    datasets: [
      { name: "IEEE-CIS Fraud Detection", url: "https://www.kaggle.com/c/ieee-fraud-detection", description: "Large-scale transaction dataset with fraud labels" },
      { name: "Credit Card Fraud Detection", url: "https://www.kaggle.com/mlg-ulb/creditcardfraud", description: "Classic anonymised credit card transactions" },
    ],
    resumeValue: "Demonstrates production ML skills with business impact - fraud detection directly affects company revenue",
    interviewTalkingPoints: [
      "How did you handle the severe class imbalance?",
      "Explain your feature engineering approach",
      "How would you deploy this to handle 10,000 transactions/second?",
      "How did you make predictions explainable for compliance?",
    ],
    extendedFeatures: ["Add streaming with Kafka", "Build monitoring dashboard", "Implement A/B testing framework", "Add model retraining pipeline"],
    australianRelevance: "Australian banks and fintechs (Afterpay, Zip) heavily invest in fraud detection",
  },
  {
    id: "ml-recommender-system",
    title: "Hybrid Recommendation Engine",
    description: "Create a recommendation system combining collaborative filtering, content-based, and knowledge-based approaches to suggest items with cold-start handling.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Machine Learning Engineer", "Data Scientist"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Deep Learning", "SQL/Databases"],
    skillsLearned: ["Recommendation algorithms", "Embedding techniques", "Cold-start solutions", "A/B testing"],
    interestAreas: ["E-commerce/Retail", "Creative/Art"],
    techStack: ["Python", "TensorFlow", "Surprise", "PostgreSQL", "FastAPI"],
    datasets: [
      { name: "MovieLens", url: "https://grouplens.org/datasets/movielens/", description: "Movie ratings dataset, multiple sizes available" },
      { name: "Amazon Product Reviews", url: "https://nijianmo.github.io/amazon/index.html", description: "Large-scale product review dataset" },
    ],
    resumeValue: "Recommendation systems drive revenue at most tech companies - highly sought-after skill",
    interviewTalkingPoints: [
      "How do you handle users with no history (cold start)?",
      "Explain the trade-offs between collaborative and content-based filtering",
      "How would you evaluate recommendation quality beyond accuracy?",
      "How did you handle the sparsity of the ratings matrix?",
    ],
    extendedFeatures: ["Add real-time personalisation", "Implement diversity/novelty metrics", "Build explanation system", "Add multi-armed bandit for exploration"],
  },
  {
    id: "ml-churn-prediction",
    title: "Customer Churn Prediction & Intervention",
    description: "Build an end-to-end churn prediction system that identifies at-risk customers and recommends retention strategies based on customer segments.",
    complexity: "Beginner",
    timeRequired: ["weekend", "2-weeks"],
    targetRoles: ["Data Scientist", "Machine Learning Engineer"],
    experienceLevels: ["Junior", "Mid"],
    skillsRequired: ["Python", "Scikit-learn", "SQL/Databases"],
    skillsLearned: ["Customer analytics", "Survival analysis basics", "Business metric translation", "Actionable insights"],
    interestAreas: ["E-commerce/Retail", "Finance/Trading"],
    techStack: ["Python", "Scikit-learn", "Pandas", "Plotly", "Streamlit"],
    datasets: [
      { name: "Telco Customer Churn", url: "https://www.kaggle.com/blastchar/telco-customer-churn", description: "Telecom customer data with churn labels" },
      { name: "Bank Customer Churn", url: "https://www.kaggle.com/adammaus/predicting-churn-for-bank-customers", description: "Bank customer demographics and churn" },
    ],
    resumeValue: "Classic business problem that every company faces - shows you understand business value",
    interviewTalkingPoints: [
      "How did you translate churn probability into business decisions?",
      "What features were most predictive and why?",
      "How would you measure the ROI of your retention interventions?",
    ],
    extendedFeatures: ["Add customer lifetime value prediction", "Build intervention recommendation engine", "Create executive dashboard"],
  },

  // Data Scientist projects
  {
    id: "ds-ab-testing-platform",
    title: "A/B Testing Analysis Platform",
    description: "Build a comprehensive A/B testing analysis tool that handles sample size calculation, statistical significance testing, and visualises experiment results with guardrail metrics.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Data Scientist"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Statistics", "SQL/Databases"],
    skillsLearned: ["Experiment design", "Statistical testing", "Multiple comparison corrections", "Bayesian A/B testing"],
    interestAreas: ["E-commerce/Retail", "Productivity Tools"],
    techStack: ["Python", "SciPy", "Streamlit", "Plotly", "PostgreSQL"],
    datasets: [
      { name: "Synthetic A/B Test Data", url: "https://www.kaggle.com/datasets", description: "Generate your own or use Kaggle examples" },
    ],
    resumeValue: "Every tech company runs A/B tests - this shows you can design and analyse experiments properly",
    interviewTalkingPoints: [
      "How do you determine sample size before running an experiment?",
      "Explain p-hacking and how your tool prevents it",
      "When would you use Bayesian vs frequentist approaches?",
      "How do you handle multiple metrics in a single experiment?",
    ],
    extendedFeatures: ["Add sequential testing", "Implement CUPED variance reduction", "Build experiment scheduling", "Add segment analysis"],
    australianRelevance: "Major Australian companies like Canva, Atlassian, and REA Group heavily rely on experimentation",
  },
  {
    id: "ds-causal-inference",
    title: "Causal Impact Analysis Tool",
    description: "Create a tool to estimate causal effects from observational data using techniques like propensity score matching, difference-in-differences, and synthetic control methods.",
    complexity: "Advanced",
    timeRequired: ["1-month", "2-months"],
    targetRoles: ["Data Scientist", "AI/ML Researcher"],
    experienceLevels: ["Senior"],
    skillsRequired: ["Python", "Statistics"],
    skillsLearned: ["Causal inference methods", "Propensity scores", "Instrumental variables", "Sensitivity analysis"],
    interestAreas: ["Healthcare/Medical", "Social Good", "Finance/Trading"],
    techStack: ["Python", "DoWhy", "EconML", "CausalML", "Streamlit"],
    datasets: [
      { name: "LaLonde Dataset", url: "https://users.nber.org/~rdehejia/data/", description: "Classic job training program evaluation data" },
    ],
    resumeValue: "Causal inference is increasingly valued - shows sophisticated statistical thinking beyond correlation",
    interviewTalkingPoints: [
      "Explain the difference between correlation and causation with an example",
      "When would you use propensity matching vs instrumental variables?",
      "How do you validate causal assumptions?",
      "What are the limitations of your approach?",
    ],
    extendedFeatures: ["Add heterogeneous treatment effects", "Build sensitivity analysis dashboard", "Implement meta-learners"],
  },
  {
    id: "ds-time-series-forecasting",
    title: "Multi-Horizon Demand Forecasting",
    description: "Build a demand forecasting system that predicts at multiple time horizons, handles seasonality, and provides prediction intervals with uncertainty quantification.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Data Scientist", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Time Series", "Deep Learning"],
    skillsLearned: ["Time series decomposition", "Prophet/ARIMA", "Neural forecasting", "Uncertainty estimation"],
    interestAreas: ["E-commerce/Retail", "Finance/Trading", "Climate/Environment"],
    techStack: ["Python", "Prophet", "NeuralProphet", "Darts", "Streamlit"],
    datasets: [
      { name: "Store Sales - Kaggle", url: "https://www.kaggle.com/c/store-sales-time-series-forecasting", description: "Ecuadorian grocery store sales data" },
      { name: "Australian Energy Data", url: "https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/data-nem", description: "Real Australian electricity demand data" },
    ],
    resumeValue: "Forecasting is critical for operations - shows you can handle temporal data and business planning",
    interviewTalkingPoints: [
      "How did you handle multiple seasonalities?",
      "Explain how you quantified forecast uncertainty",
      "How would you detect when your model needs retraining?",
      "What was your backtesting strategy?",
    ],
    extendedFeatures: ["Add hierarchical forecasting", "Implement anomaly detection", "Build automated retraining", "Add external regressor handling"],
    australianRelevance: "Use Australian energy market data from AEMO for local relevance",
  },

  // Computer Vision projects
  {
    id: "cv-document-extraction",
    title: "Intelligent Document Processing Pipeline",
    description: "Build a system that extracts structured information from unstructured documents (invoices, receipts, forms) using OCR and layout analysis.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Computer Vision Engineer", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Computer Vision", "Deep Learning"],
    skillsLearned: ["OCR pipelines", "Layout analysis", "Named entity recognition", "Document understanding"],
    interestAreas: ["Finance/Trading", "Productivity Tools"],
    techStack: ["Python", "Tesseract", "LayoutLM", "OpenCV", "FastAPI"],
    datasets: [
      { name: "FUNSD", url: "https://guillaumejaume.github.io/FUNSD/", description: "Form understanding dataset" },
      { name: "SROIE", url: "https://rrc.cvc.uab.es/?ch=13", description: "Scanned receipt dataset" },
    ],
    resumeValue: "Document AI is booming - banks, legal, and accounting firms all need this capability",
    interviewTalkingPoints: [
      "How did you handle poor quality scans?",
      "Explain your approach to extracting key-value pairs",
      "How would you handle documents in different formats?",
      "What was your accuracy and how did you measure it?",
    ],
    extendedFeatures: ["Add table extraction", "Support handwriting", "Build confidence scoring", "Add human-in-the-loop review"],
    australianRelevance: "Australian banks and accounting firms are investing heavily in document automation",
  },
  {
    id: "cv-object-detection",
    title: "Custom Object Detection for Retail Analytics",
    description: "Train a custom object detector to count products on shelves, detect out-of-stock situations, and analyse planogram compliance.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Computer Vision Engineer", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Computer Vision", "Deep Learning", "PyTorch"],
    skillsLearned: ["Object detection", "Transfer learning", "Data annotation", "Model optimisation"],
    interestAreas: ["E-commerce/Retail"],
    techStack: ["Python", "PyTorch", "YOLOv8", "Roboflow", "OpenCV"],
    datasets: [
      { name: "SKU-110K", url: "https://github.com/eg4000/SKU110K_CVPR19", description: "Densely packed retail shelf images" },
      { name: "Grocery Store Dataset", url: "https://github.com/marcusklasson/GroceryStoreDataset", description: "Grocery product images" },
    ],
    resumeValue: "Retail tech is growing rapidly - shows you can build production-ready CV systems",
    interviewTalkingPoints: [
      "How did you handle overlapping products?",
      "Explain your annotation strategy and quality control",
      "How did you optimise inference speed for edge deployment?",
      "What augmentation strategies worked best?",
    ],
    extendedFeatures: ["Add edge deployment", "Build real-time tracking", "Implement anomaly alerts", "Add reporting dashboard"],
    australianRelevance: "Woolworths and Coles invest heavily in retail analytics technology",
  },
  {
    id: "cv-medical-imaging",
    title: "Medical Image Classification with Explainability",
    description: "Build an image classifier for medical imaging (X-rays, skin lesions) with attention visualisation and uncertainty quantification for clinical decision support.",
    complexity: "Advanced",
    timeRequired: ["1-month", "2-months"],
    targetRoles: ["Computer Vision Engineer", "AI/ML Researcher", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Computer Vision", "Deep Learning", "PyTorch"],
    skillsLearned: ["Medical imaging", "Model interpretability", "Uncertainty estimation", "Ethical AI considerations"],
    interestAreas: ["Healthcare/Medical"],
    techStack: ["Python", "PyTorch", "Grad-CAM", "MONAI", "Streamlit"],
    datasets: [
      { name: "ChestX-ray14", url: "https://nihcc.app.box.com/v/ChestXray-NIHCC", description: "Large chest X-ray dataset with labels" },
      { name: "ISIC Skin Lesion", url: "https://www.isic-archive.com/", description: "Dermoscopic images of skin lesions" },
    ],
    resumeValue: "Healthcare AI is high-impact and high-paying - shows you can handle sensitive, regulated domains",
    interviewTalkingPoints: [
      "How do you ensure the model is trustworthy for clinical use?",
      "Explain your explainability approach",
      "How did you handle class imbalance in medical data?",
      "What ethical considerations did you address?",
    ],
    extendedFeatures: ["Add multi-task learning", "Implement federated learning simulation", "Build clinical report generation"],
  },

  // NLP Engineer projects
  {
    id: "nlp-sentiment-analysis",
    title: "Aspect-Based Sentiment Analysis System",
    description: "Build a sentiment analysis system that extracts specific aspects from reviews and determines sentiment for each aspect, not just overall sentiment.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["NLP Engineer", "Data Scientist", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "NLP/LLMs", "Deep Learning"],
    skillsLearned: ["Aspect extraction", "Fine-tuning transformers", "Multi-task learning", "Sentiment lexicons"],
    interestAreas: ["E-commerce/Retail", "Social Good"],
    techStack: ["Python", "Transformers", "SpaCy", "FastAPI", "Streamlit"],
    datasets: [
      { name: "SemEval ABSA", url: "https://alt.qcri.org/semeval2016/task5/", description: "Aspect-based sentiment datasets" },
      { name: "Amazon Reviews", url: "https://nijianmo.github.io/amazon/index.html", description: "Large product review corpus" },
    ],
    resumeValue: "Goes beyond basic sentiment - shows nuanced NLP understanding valuable for product teams",
    interviewTalkingPoints: [
      "How did you identify aspects in the text?",
      "Explain why aspect-level sentiment matters vs document-level",
      "How would you handle implicit aspects?",
      "What was your annotation strategy?",
    ],
    extendedFeatures: ["Add opinion summarisation", "Build comparison analysis", "Implement trend detection", "Add multilingual support"],
  },
  {
    id: "nlp-rag-system",
    title: "RAG-Powered Documentation Assistant",
    description: "Build a Retrieval-Augmented Generation system that answers questions about technical documentation with source citations and handles follow-up questions.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["NLP Engineer", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "NLP/LLMs", "SQL/Databases"],
    skillsLearned: ["Vector databases", "Embedding models", "Prompt engineering", "Retrieval strategies"],
    interestAreas: ["Productivity Tools", "Education"],
    techStack: ["Python", "LangChain", "ChromaDB", "OpenAI/Anthropic API", "FastAPI"],
    datasets: [
      { name: "Your own documentation", url: "", description: "Use open-source project docs (Python, React, etc.)" },
    ],
    resumeValue: "RAG is the hottest pattern in LLM applications - every company is building these",
    interviewTalkingPoints: [
      "How did you chunk documents for optimal retrieval?",
      "Explain your retrieval evaluation methodology",
      "How do you handle questions that span multiple documents?",
      "What strategies did you use to reduce hallucinations?",
    ],
    extendedFeatures: ["Add hybrid search", "Implement query rewriting", "Build feedback loop", "Add conversation memory"],
    australianRelevance: "Australian companies like Atlassian and Canva are building AI documentation tools",
  },
  {
    id: "nlp-text-classification",
    title: "Multi-Label Job Posting Classifier",
    description: "Build a system that automatically tags job postings with skills, seniority level, and job category using multi-label classification and zero-shot capabilities.",
    complexity: "Beginner",
    timeRequired: ["weekend", "2-weeks"],
    targetRoles: ["NLP Engineer", "Data Scientist", "Machine Learning Engineer"],
    experienceLevels: ["Junior", "Mid"],
    skillsRequired: ["Python", "NLP/LLMs", "Scikit-learn"],
    skillsLearned: ["Multi-label classification", "Text preprocessing", "Transfer learning", "Label hierarchy"],
    interestAreas: ["Productivity Tools"],
    techStack: ["Python", "Transformers", "Scikit-learn", "Streamlit"],
    datasets: [
      { name: "Job postings (scrape or use APIs)", url: "", description: "Collect from job boards or use existing datasets" },
    ],
    resumeValue: "Directly relevant to HR tech and job platforms - practical business application",
    interviewTalkingPoints: [
      "How did you handle the label imbalance?",
      "Explain your approach to creating the label taxonomy",
      "How would you handle new categories appearing over time?",
    ],
    extendedFeatures: ["Add skill extraction", "Build salary prediction", "Implement job matching", "Add company classification"],
    australianRelevance: "Perfect for Australian job market context - use local job posting examples",
  },

  // Data Engineer projects
  {
    id: "de-etl-pipeline",
    title: "Real-Time Data Pipeline with Quality Monitoring",
    description: "Build a streaming data pipeline that ingests, transforms, and loads data with built-in data quality checks, schema evolution handling, and observability.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Data Engineer", "MLOps Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "SQL/Databases", "Cloud (AWS/GCP/Azure)"],
    skillsLearned: ["Stream processing", "Data quality frameworks", "Schema management", "Pipeline orchestration"],
    interestAreas: ["Finance/Trading", "E-commerce/Retail"],
    techStack: ["Python", "Apache Kafka", "Apache Spark", "Great Expectations", "Airflow"],
    datasets: [
      { name: "NYC Taxi Data", url: "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page", description: "High-volume taxi trip records" },
    ],
    resumeValue: "Data pipelines are foundational - every ML system needs reliable data infrastructure",
    interviewTalkingPoints: [
      "How did you handle late-arriving data?",
      "Explain your data quality monitoring approach",
      "How would you handle schema changes upstream?",
      "What's your strategy for exactly-once processing?",
    ],
    extendedFeatures: ["Add CDC implementation", "Build lineage tracking", "Implement cost monitoring", "Add self-healing pipelines"],
  },
  {
    id: "de-feature-store",
    title: "Feature Store for ML Teams",
    description: "Build a feature store that serves features for both training and inference, handles feature versioning, and provides point-in-time correct joins.",
    complexity: "Advanced",
    timeRequired: ["1-month", "2-months"],
    targetRoles: ["Data Engineer", "MLOps Engineer", "Machine Learning Engineer"],
    experienceLevels: ["Senior"],
    skillsRequired: ["Python", "SQL/Databases", "MLOps/Deployment", "Cloud (AWS/GCP/Azure)"],
    skillsLearned: ["Feature engineering", "Time-travel queries", "Online/offline serving", "Feature discovery"],
    interestAreas: ["Productivity Tools"],
    techStack: ["Python", "Feast", "Redis", "PostgreSQL", "FastAPI"],
    datasets: [
      { name: "Synthetic e-commerce data", url: "", description: "Generate transactional data" },
    ],
    resumeValue: "Feature stores are becoming essential ML infrastructure - shows platform engineering skills",
    interviewTalkingPoints: [
      "Explain the difference between online and offline feature stores",
      "How do you handle point-in-time correctness?",
      "What's your feature versioning strategy?",
      "How do you prevent feature leakage?",
    ],
    extendedFeatures: ["Add feature monitoring", "Build feature discovery UI", "Implement feature lineage", "Add streaming features"],
  },

  // MLOps projects
  {
    id: "mlops-model-serving",
    title: "Production Model Serving Platform",
    description: "Build a model serving platform that handles A/B testing, canary deployments, automatic rollbacks, and real-time monitoring of model performance.",
    complexity: "Advanced",
    timeRequired: ["1-month", "2-months"],
    targetRoles: ["MLOps Engineer", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "MLOps/Deployment", "Cloud (AWS/GCP/Azure)"],
    skillsLearned: ["Model deployment patterns", "Traffic management", "Model monitoring", "Infrastructure as code"],
    interestAreas: ["Productivity Tools"],
    techStack: ["Python", "FastAPI", "Docker", "Kubernetes", "Prometheus", "Grafana"],
    datasets: [
      { name: "Any trained model", url: "", description: "Use a simple model to focus on infrastructure" },
    ],
    resumeValue: "MLOps is a critical gap in most teams - shows you can take models to production",
    interviewTalkingPoints: [
      "Explain your deployment strategy for zero-downtime updates",
      "How do you detect model degradation in production?",
      "What triggers an automatic rollback?",
      "How did you handle model versioning?",
    ],
    extendedFeatures: ["Add shadow deployments", "Build custom metrics", "Implement cost tracking", "Add multi-model serving"],
  },
  {
    id: "mlops-experiment-tracking",
    title: "ML Experiment Tracking & Model Registry",
    description: "Build an experiment tracking system that logs parameters, metrics, and artifacts, with a model registry for promoting models through environments.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["MLOps Engineer", "Machine Learning Engineer", "Data Scientist"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "MLOps/Deployment", "SQL/Databases"],
    skillsLearned: ["Experiment management", "Model versioning", "Reproducibility", "Team collaboration"],
    interestAreas: ["Productivity Tools"],
    techStack: ["Python", "MLflow", "PostgreSQL", "MinIO", "FastAPI"],
    datasets: [
      { name: "Any ML project", url: "", description: "Apply to existing projects" },
    ],
    resumeValue: "Shows mature ML practices - critical for teams scaling their ML efforts",
    interviewTalkingPoints: [
      "How do you ensure experiment reproducibility?",
      "Explain your model promotion workflow",
      "How do you handle experiment collaboration in a team?",
      "What metadata do you capture for each experiment?",
    ],
    extendedFeatures: ["Add hyperparameter tuning integration", "Build comparison dashboards", "Implement model lineage", "Add approval workflows"],
  },

  // Junior-friendly projects
  {
    id: "junior-eda-dashboard",
    title: "Interactive EDA Dashboard",
    description: "Build an automated exploratory data analysis tool that generates summary statistics, visualisations, and data quality reports for any uploaded CSV.",
    complexity: "Beginner",
    timeRequired: ["weekend", "2-weeks"],
    targetRoles: ["Data Scientist", "Data Engineer"],
    experienceLevels: ["Junior"],
    skillsRequired: ["Python", "Statistics"],
    skillsLearned: ["Data profiling", "Visualisation best practices", "Data quality assessment", "Streamlit development"],
    interestAreas: ["Productivity Tools", "Education"],
    techStack: ["Python", "Pandas", "Plotly", "Streamlit"],
    datasets: [
      { name: "Any CSV dataset", url: "", description: "Tool should work with any tabular data" },
    ],
    resumeValue: "Shows practical skills and attention to data quality - great first project",
    interviewTalkingPoints: [
      "How do you handle different data types automatically?",
      "What visualisations do you generate and why?",
      "How do you detect data quality issues?",
    ],
    extendedFeatures: ["Add correlation analysis", "Build outlier detection", "Generate PDF reports", "Add data cleaning suggestions"],
  },
  {
    id: "junior-image-classifier",
    title: "Transfer Learning Image Classifier",
    description: "Build and deploy an image classifier using transfer learning, with a web interface for uploading images and getting predictions with confidence scores.",
    complexity: "Beginner",
    timeRequired: ["weekend", "2-weeks"],
    targetRoles: ["Machine Learning Engineer", "Computer Vision Engineer"],
    experienceLevels: ["Junior"],
    skillsRequired: ["Python", "Deep Learning", "TensorFlow/Keras"],
    skillsLearned: ["Transfer learning", "Model fine-tuning", "Web deployment", "Image preprocessing"],
    interestAreas: ["Creative/Art", "Education"],
    techStack: ["Python", "TensorFlow", "Keras", "Streamlit", "Hugging Face Spaces"],
    datasets: [
      { name: "Custom dataset or Kaggle", url: "https://www.kaggle.com/datasets", description: "Choose something you find interesting" },
    ],
    resumeValue: "Classic first deep learning project - shows you understand the ML lifecycle end-to-end",
    interviewTalkingPoints: [
      "Why did you choose that base model?",
      "How did you prevent overfitting?",
      "Explain your data augmentation strategy",
    ],
    extendedFeatures: ["Add Grad-CAM visualisation", "Build batch prediction", "Implement model comparison", "Add feedback collection"],
  },
  {
    id: "junior-sql-analytics",
    title: "SQL Analytics Dashboard for Business Metrics",
    description: "Build a dashboard that calculates key business metrics (cohort retention, LTV, conversion funnels) using pure SQL with clear visualisations.",
    complexity: "Beginner",
    timeRequired: ["weekend", "2-weeks"],
    targetRoles: ["Data Scientist", "Data Engineer"],
    experienceLevels: ["Junior"],
    skillsRequired: ["SQL/Databases", "Python"],
    skillsLearned: ["Advanced SQL", "Business metrics", "Cohort analysis", "Dashboard design"],
    interestAreas: ["E-commerce/Retail", "Finance/Trading"],
    techStack: ["SQL", "PostgreSQL", "Python", "Streamlit", "Plotly"],
    datasets: [
      { name: "Online Retail Dataset", url: "https://archive.ics.uci.edu/ml/datasets/Online+Retail", description: "Transaction data for cohort analysis" },
    ],
    resumeValue: "SQL is fundamental - shows you can extract insights without complex ML",
    interviewTalkingPoints: [
      "Explain how you calculated cohort retention",
      "What business decisions could be made from your dashboard?",
      "How did you optimise your SQL queries for performance?",
    ],
    extendedFeatures: ["Add funnel analysis", "Build RFM segmentation", "Implement predictive queries", "Add anomaly highlighting"],
  },

  // Australian-specific projects
  {
    id: "aus-energy-forecasting",
    title: "Australian Energy Market Forecasting",
    description: "Build a forecasting system for Australian electricity demand using AEMO data, incorporating weather, holidays, and pricing to predict consumption patterns.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Data Scientist", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Time Series", "Deep Learning"],
    skillsLearned: ["Energy domain knowledge", "Multi-variate forecasting", "External features", "Australian market understanding"],
    interestAreas: ["Climate/Environment", "Finance/Trading"],
    techStack: ["Python", "Prophet", "LightGBM", "Streamlit"],
    datasets: [
      { name: "AEMO NEM Data", url: "https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/data-nem", description: "Official Australian energy market data" },
      { name: "BOM Weather Data", url: "http://www.bom.gov.au/climate/data/", description: "Australian Bureau of Meteorology weather data" },
    ],
    resumeValue: "Domain-specific Australian project - shows you understand local market context",
    interviewTalkingPoints: [
      "How did you incorporate weather as a feature?",
      "Explain the unique characteristics of Australian energy markets",
      "How did you handle the different state markets?",
    ],
    extendedFeatures: ["Add price forecasting", "Build renewable generation prediction", "Implement peak demand alerts"],
    australianRelevance: "Directly relevant to Australian energy companies and government",
  },
  {
    id: "aus-property-analysis",
    title: "Australian Property Market Analyser",
    description: "Build an analysis tool for Australian property data that identifies undervalued suburbs, predicts price trends, and analyses market indicators.",
    complexity: "Intermediate",
    timeRequired: ["2-weeks", "1-month"],
    targetRoles: ["Data Scientist"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Statistics", "SQL/Databases"],
    skillsLearned: ["Geospatial analysis", "Property domain knowledge", "Feature engineering", "Australian market understanding"],
    interestAreas: ["Finance/Trading"],
    techStack: ["Python", "Pandas", "GeoPandas", "Plotly", "Streamlit"],
    datasets: [
      { name: "Domain/REA APIs or scraping", url: "", description: "Australian property listing data" },
      { name: "ABS Census Data", url: "https://www.abs.gov.au/census", description: "Demographic data by suburb" },
    ],
    resumeValue: "Property tech is big in Australia - shows local market knowledge",
    interviewTalkingPoints: [
      "What features were most predictive of price changes?",
      "How did you handle the geographic aspects?",
      "What external data sources did you incorporate?",
    ],
    extendedFeatures: ["Add suburb comparison", "Build investment calculator", "Implement rental yield analysis"],
    australianRelevance: "Highly relevant for REA Group, Domain, and PropTech startups in Australia",
  },

  // Research-focused projects
  {
    id: "research-paper-implementation",
    title: "Research Paper Implementation & Benchmarking",
    description: "Reproduce results from a recent ML paper, extend it with your own experiments, and write up findings comparing to the original results.",
    complexity: "Advanced",
    timeRequired: ["1-month", "2-months"],
    targetRoles: ["AI/ML Researcher", "Machine Learning Engineer"],
    experienceLevels: ["Mid", "Senior"],
    skillsRequired: ["Python", "Deep Learning", "PyTorch"],
    skillsLearned: ["Research methodology", "Paper reading", "Experiment design", "Scientific writing"],
    interestAreas: ["Education"],
    techStack: ["Python", "PyTorch", "Weights & Biases", "LaTeX"],
    datasets: [
      { name: "Dataset from the paper", url: "", description: "Use the same benchmarks as the original paper" },
    ],
    resumeValue: "Shows research skills and ability to understand cutting-edge work - valued at research-focused companies",
    interviewTalkingPoints: [
      "Why did you choose this paper?",
      "What challenges did you face in reproduction?",
      "How did your results compare to the original?",
      "What extensions did you explore?",
    ],
    extendedFeatures: ["Add ablation studies", "Try on new datasets", "Combine with other methods", "Write a blog post"],
  },
];

// Get projects by filters
export function getProjectsByFilters(
  roles: TargetRole[],
  experienceLevel: ExperienceLevel,
  timeCommitment: TimeCommitment[],
  skills: SkillCategory[],
  interests: InterestArea[]
): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((project) => {
    // Must match at least one role
    const roleMatch = roles.length === 0 || roles.some((r) => project.targetRoles.includes(r));

    // Must match experience level
    const expMatch = project.experienceLevels.includes(experienceLevel);

    // Must match at least one time commitment
    const timeMatch = timeCommitment.length === 0 || timeCommitment.some((t) => project.timeRequired.includes(t));

    // Skill matching - prefer projects that use skills the user has
    const skillMatch =
      skills.length === 0 || skills.some((s) => project.skillsRequired.includes(s));

    // Interest matching
    const interestMatch =
      interests.length === 0 || interests.some((i) => project.interestAreas.includes(i));

    return roleMatch && expMatch && timeMatch && skillMatch && interestMatch;
  });
}
