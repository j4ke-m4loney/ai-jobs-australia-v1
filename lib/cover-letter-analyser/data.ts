// Cover Letter Analyser Data

export type AIRole =
  | 'Machine Learning Engineer'
  | 'Data Scientist'
  | 'AI Researcher'
  | 'MLOps Engineer'
  | 'Data Engineer'
  | 'NLP Engineer'
  | 'Computer Vision Engineer';

export const AI_ROLES: AIRole[] = [
  'Machine Learning Engineer',
  'Data Scientist',
  'AI Researcher',
  'MLOps Engineer',
  'Data Engineer',
  'NLP Engineer',
  'Computer Vision Engineer',
];

// Keywords by category with weights
export interface KeywordCategory {
  name: string;
  keywords: string[];
  weight: number;
}

export const COVER_LETTER_KEYWORDS: KeywordCategory[] = [
  {
    name: 'AI/ML Technical',
    weight: 2.0,
    keywords: [
      'machine learning',
      'deep learning',
      'neural networks',
      'natural language processing',
      'NLP',
      'computer vision',
      'reinforcement learning',
      'artificial intelligence',
      'AI',
      'predictive modeling',
      'statistical modeling',
      'data mining',
      'feature engineering',
      'model training',
      'model optimisation',
      'hyperparameter tuning',
    ],
  },
  {
    name: 'Frameworks & Tools',
    weight: 1.5,
    keywords: [
      'TensorFlow',
      'PyTorch',
      'Keras',
      'scikit-learn',
      'Pandas',
      'NumPy',
      'Python',
      'R',
      'SQL',
      'Spark',
      'Hadoop',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'GCP',
      'MLflow',
      'Airflow',
      'Jupyter',
      'Git',
    ],
  },
  {
    name: 'Industry Terms',
    weight: 1.5,
    keywords: [
      'model deployment',
      'production ML',
      'data pipeline',
      'ETL',
      'MLOps',
      'CI/CD',
      'model serving',
      'A/B testing',
      'experimentation',
      'scalable',
      'real-time',
      'batch processing',
      'data warehouse',
      'big data',
      'cloud infrastructure',
    ],
  },
  {
    name: 'Soft Skills',
    weight: 1.0,
    keywords: [
      'collaboration',
      'communication',
      'problem-solving',
      'analytical',
      'leadership',
      'mentoring',
      'stakeholder',
      'cross-functional',
      'agile',
      'initiative',
      'proactive',
      'attention to detail',
    ],
  },
];

// Role-specific keywords
export const ROLE_SPECIFIC_KEYWORDS: Record<AIRole, string[]> = {
  'Machine Learning Engineer': [
    'model training',
    'feature engineering',
    'hyperparameter tuning',
    'model optimisation',
    'PyTorch',
    'TensorFlow',
    'MLOps',
    'model deployment',
    'production ML',
    'scalable ML',
  ],
  'Data Scientist': [
    'statistical analysis',
    'data visualisation',
    'predictive modeling',
    'Python',
    'R',
    'SQL',
    'A/B testing',
    'insights',
    'business intelligence',
    'experimentation',
  ],
  'AI Researcher': [
    'research',
    'publications',
    'deep learning',
    'neural networks',
    'algorithm development',
    'novel approaches',
    'state-of-the-art',
    'academic',
    'experiments',
    'benchmarks',
  ],
  'MLOps Engineer': [
    'MLOps',
    'CI/CD',
    'model deployment',
    'infrastructure',
    'automation',
    'monitoring',
    'Docker',
    'Kubernetes',
    'AWS',
    'pipeline orchestration',
  ],
  'Data Engineer': [
    'data pipeline',
    'ETL',
    'Spark',
    'Airflow',
    'SQL',
    'data warehouse',
    'big data',
    'streaming',
    'batch processing',
    'data quality',
  ],
  'NLP Engineer': [
    'natural language processing',
    'NLP',
    'transformers',
    'BERT',
    'GPT',
    'LLM',
    'text processing',
    'sentiment analysis',
    'named entity recognition',
    'language models',
  ],
  'Computer Vision Engineer': [
    'computer vision',
    'image processing',
    'CNN',
    'object detection',
    'image segmentation',
    'OpenCV',
    'video analysis',
    'image classification',
    'visual recognition',
    'deep learning',
  ],
};

// Action verbs categorised
export const ACTION_VERBS = {
  achievement: [
    'achieved',
    'delivered',
    'exceeded',
    'improved',
    'increased',
    'reduced',
    'saved',
    'generated',
    'accelerated',
    'transformed',
    'drove',
    'enabled',
  ],
  technical: [
    'developed',
    'built',
    'designed',
    'architected',
    'implemented',
    'engineered',
    'optimised',
    'deployed',
    'automated',
    'integrated',
    'scaled',
    'created',
  ],
  leadership: [
    'led',
    'managed',
    'coordinated',
    'mentored',
    'guided',
    'directed',
    'supervised',
    'spearheaded',
    'championed',
    'established',
    'pioneered',
    'initiated',
  ],
  collaboration: [
    'collaborated',
    'partnered',
    'worked',
    'contributed',
    'supported',
    'assisted',
    'facilitated',
    'presented',
    'communicated',
    'consulted',
    'advised',
    'liaised',
  ],
};

// All action verbs flattened
export const ALL_ACTION_VERBS = [
  ...ACTION_VERBS.achievement,
  ...ACTION_VERBS.technical,
  ...ACTION_VERBS.leadership,
  ...ACTION_VERBS.collaboration,
];

// Generic phrases to detect (negative signals)
export const GENERIC_PHRASES = [
  'i am writing to apply',
  'i am interested in',
  'to whom it may concern',
  'dear sir or madam',
  'dear hiring manager',
  'i think i would be',
  'i believe i would be',
  'any company',
  'this position',
  'the position',
  'perfect fit',
  'great fit',
  'i am the ideal',
  'i am confident',
  're: application',
  'please find attached',
  'attached please find',
];

// Weak language patterns
export const WEAK_LANGUAGE = [
  'i think',
  'i believe',
  'i feel',
  'maybe',
  'perhaps',
  'might be',
  'could be',
  'sort of',
  'kind of',
  'trying to',
  'hoping to',
];

// Strong opening patterns (positive signals)
export const STRONG_OPENING_PATTERNS = [
  /^when i (?:saw|read|discovered|learned)/i,
  /^as a (?:\w+\s){0,3}(?:engineer|scientist|researcher|developer)/i,
  /^with (?:\d+\+?\s*)?years? of experience/i,
  /^having (?:led|developed|built|designed|delivered)/i,
  /^i (?:recently|just) (?:led|developed|built|deployed|delivered)/i,
  /^(?:at|during) my (?:time|role|tenure) at/i,
  /^your (?:company|team|organisation|mission)/i,
  /^the opportunity to/i,
  /^i am excited/i,
  /^i was thrilled/i,
];

// Closing patterns (positive signals)
export const STRONG_CLOSING_PATTERNS = [
  /i (?:would|'d) (?:welcome|love|appreciate) the (?:opportunity|chance)/i,
  /i (?:am|'m) available/i,
  /please (?:feel free to )?contact me/i,
  /i look forward to/i,
  /let'?s (?:discuss|connect|chat)/i,
  /happy to (?:discuss|provide|share)/i,
  /thank you for (?:your )?(?:time|consideration)/i,
  /i can be reached/i,
  /available (?:at|for)/i,
];

// Red flag patterns
export interface RedFlagPattern {
  pattern: RegExp | string;
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  {
    pattern: /^i am writing to apply/i,
    type: 'generic_opening',
    message: 'Generic opening - try a more engaging hook that showcases your enthusiasm or key achievement',
    severity: 'medium',
  },
  {
    pattern: /to whom it may concern/i,
    type: 'no_addressee',
    message: 'Address your letter to a specific person or "Dear Hiring Team"',
    severity: 'high',
  },
  {
    pattern: /dear sir or madam/i,
    type: 'no_addressee',
    message: 'Use "Dear Hiring Team" or find the hiring manager\'s name',
    severity: 'medium',
  },
  {
    pattern: /i think i would be/i,
    type: 'weak_language',
    message: 'Use confident language - "I am" or "I will" instead of "I think I would be"',
    severity: 'low',
  },
  {
    pattern: /i believe i would be/i,
    type: 'weak_language',
    message: 'Use confident language - "I am" or "I will" instead of "I believe I would be"',
    severity: 'low',
  },
  {
    pattern: /salary|compensation|remuneration|pay rate/i,
    type: 'salary_mention',
    message: 'Avoid discussing salary in your cover letter - save this for the interview stage',
    severity: 'medium',
  },
  {
    pattern: /analyze|optimize|organization|color|favor|center(?!ed on)/i,
    type: 'us_spelling',
    message: 'Use Australian spelling (analyse, optimise, organisation, colour, favour, centre)',
    severity: 'low',
  },
  {
    pattern: /desperate|urgently need|need a job/i,
    type: 'desperation',
    message: 'Avoid language that conveys desperation - focus on what you can offer',
    severity: 'high',
  },
  {
    pattern: /unemployed|laid off|fired|let go/i,
    type: 'negative_framing',
    message: 'Focus on your skills and what you can contribute rather than past employment status',
    severity: 'medium',
  },
  {
    pattern: /i don'?t have experience|lack experience|no experience/i,
    type: 'negative_self',
    message: 'Avoid negative self-statements - focus on transferable skills and enthusiasm',
    severity: 'medium',
  },
];

// FAQ content
export const FAQ_CONTENT = [
  {
    question: 'What makes a good AI/ML cover letter?',
    answer:
      'A strong AI/ML cover letter has a compelling opening that hooks the reader, demonstrates specific technical expertise relevant to the role, shows you\'ve researched the company, includes quantifiable achievements (e.g., "improved model accuracy by 15%"), and ends with a clear call to action. It should be concise (250-400 words) and tailored to each application.',
  },
  {
    question: 'How does this cover letter analyser work?',
    answer:
      'Our analyser evaluates your cover letter across five key dimensions: structure (opening, body, closing), keyword usage (AI/ML technical terms), personalisation (company-specific content), action verbs (power words that demonstrate achievement), and readability (length and paragraph structure). Each dimension is scored and weighted to give you an overall assessment.',
  },
  {
    question: 'Is my cover letter data private?',
    answer:
      'Yes, absolutely. All analysis happens locally in your browser using JavaScript. Your cover letter text is never sent to our servers or stored anywhere. We take your privacy seriously - your application materials stay on your device.',
  },
  {
    question: 'What keywords should I include for AI roles?',
    answer:
      'Include relevant technical keywords like machine learning, deep learning, specific frameworks (TensorFlow, PyTorch), programming languages (Python, SQL), cloud platforms (AWS, GCP), and role-specific terms. However, only include keywords that genuinely reflect your experience - don\'t keyword-stuff.',
  },
  {
    question: 'How long should my cover letter be?',
    answer:
      'Aim for 250-400 words (roughly 3-4 paragraphs). This is long enough to make your case but short enough to respect the reader\'s time. Cover letters that are too short may seem lacking in effort, while overly long ones often go unread.',
  },
  {
    question: 'Should I mention specific technologies in my cover letter?',
    answer:
      'Yes, but strategically. Mention technologies that are listed in the job description and that you have genuine experience with. This shows you\'ve read the job posting and have relevant skills. However, save the exhaustive list for your resume - your cover letter should tell a story.',
  },
  {
    question: 'How can I personalise my cover letter?',
    answer:
      'Research the company and mention specific things that attract you: their products, mission, recent achievements, or technical challenges. Use the company name and refer to the specific role. Address "you" and "your team" rather than speaking generically. Explain why this company, not just any AI company.',
  },
  {
    question: 'What are common cover letter mistakes to avoid?',
    answer:
      'Common mistakes include: generic openings ("I am writing to apply..."), not mentioning the company name, focusing on what you want rather than what you can offer, typos and grammatical errors, being too long or too short, using weak language ("I think I could..."), and rehashing your resume instead of telling a compelling story.',
  },
];
