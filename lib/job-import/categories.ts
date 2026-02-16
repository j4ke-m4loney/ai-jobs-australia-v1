export const JOB_CATEGORIES = [
  { value: 'ai-ml-architect', label: 'AI/ML Architect' },
  { value: 'ai-governance', label: 'AI Governance' },
  { value: 'ai-automation', label: 'AI Automation' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'annotation', label: 'Annotation' },
  { value: 'computer-vision', label: 'Computer Vision' },
  { value: 'data-engineer', label: 'Data Engineer' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'product', label: 'Product' },
  { value: 'sales', label: 'Sales' },
  { value: 'software-development', label: 'Software Development' },
  { value: 'strategy-transformation', label: 'Strategy & Transformation' },
  { value: 'teaching-research', label: 'Teaching & Research' },
] as const;

export const VALID_CATEGORY_SLUGS = JOB_CATEGORIES.map(c => c.value);
