export type Role =
  | "Machine Learning Engineer"
  | "Data Scientist"
  | "AI Researcher"
  | "Data Engineer"
  | "MLOps Engineer";

export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead";

export type Location =
  | "Sydney"
  | "Melbourne"
  | "Brisbane"
  | "Perth"
  | "Adelaide"
  | "Canberra";

export interface SalaryRange {
  min: number;
  median: number;
  max: number;
}

export interface BaseSalaryData {
  role: Role;
  experienceLevel: ExperienceLevel;
  location: Location;
  baseSalary: SalaryRange;
}

export interface SkillModifier {
  skill: string;
  category: string;
  modifier: number; // bonus in AUD
}

// All roles available
export const ROLES: Role[] = [
  "Machine Learning Engineer",
  "Data Scientist",
  "AI Researcher",
  "Data Engineer",
  "MLOps Engineer",
];

// Experience levels with descriptions
export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "Junior", label: "Junior (0-2 years)" },
  { value: "Mid", label: "Mid-Level (2-5 years)" },
  { value: "Senior", label: "Senior (5-10 years)" },
  { value: "Lead", label: "Lead/Principal (10+ years)" },
];

// All Australian cities
export const LOCATIONS: Location[] = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Canberra",
];

// Base salary data (Sydney baseline)
// Source: Estimated based on 2024-2025 market data
const BASE_SALARIES: Record<Role, Record<ExperienceLevel, SalaryRange>> = {
  "Machine Learning Engineer": {
    Junior: { min: 80000, median: 95000, max: 110000 },
    Mid: { min: 110000, median: 130000, max: 150000 },
    Senior: { min: 140000, median: 165000, max: 190000 },
    Lead: { min: 170000, median: 200000, max: 240000 },
  },
  "Data Scientist": {
    Junior: { min: 75000, median: 90000, max: 105000 },
    Mid: { min: 105000, median: 125000, max: 145000 },
    Senior: { min: 135000, median: 160000, max: 185000 },
    Lead: { min: 165000, median: 195000, max: 230000 },
  },
  "AI Researcher": {
    Junior: { min: 85000, median: 100000, max: 115000 },
    Mid: { min: 115000, median: 135000, max: 155000 },
    Senior: { min: 150000, median: 175000, max: 200000 },
    Lead: { min: 180000, median: 215000, max: 260000 },
  },
  "Data Engineer": {
    Junior: { min: 75000, median: 88000, max: 100000 },
    Mid: { min: 100000, median: 120000, max: 140000 },
    Senior: { min: 130000, median: 155000, max: 180000 },
    Lead: { min: 160000, median: 190000, max: 220000 },
  },
  "MLOps Engineer": {
    Junior: { min: 80000, median: 95000, max: 110000 },
    Mid: { min: 110000, median: 130000, max: 150000 },
    Senior: { min: 140000, median: 165000, max: 190000 },
    Lead: { min: 170000, median: 200000, max: 235000 },
  },
};

// Location multipliers (relative to Sydney = 1.0)
export const LOCATION_MULTIPLIERS: Record<Location, number> = {
  Sydney: 1.0,
  Melbourne: 0.97,
  Brisbane: 0.88,
  Perth: 0.93,
  Adelaide: 0.83,
  Canberra: 0.98, // Government roles often pay well
};

// Skill modifiers - additional salary bonus for having these skills
export const SKILL_MODIFIERS: SkillModifier[] = [
  // Programming Languages
  { skill: "Python", category: "Languages", modifier: 5000 },
  { skill: "R", category: "Languages", modifier: 3000 },
  { skill: "Julia", category: "Languages", modifier: 4000 },
  { skill: "Scala", category: "Languages", modifier: 6000 },
  { skill: "Java", category: "Languages", modifier: 4000 },

  // ML/DL Frameworks
  { skill: "TensorFlow", category: "ML/DL Frameworks", modifier: 8000 },
  { skill: "PyTorch", category: "ML/DL Frameworks", modifier: 8000 },
  { skill: "scikit-learn", category: "ML/DL Frameworks", modifier: 4000 },
  { skill: "Keras", category: "ML/DL Frameworks", modifier: 5000 },
  { skill: "XGBoost", category: "ML/DL Frameworks", modifier: 4000 },
  { skill: "LightGBM", category: "ML/DL Frameworks", modifier: 4000 },

  // Cloud Platforms
  { skill: "AWS", category: "Cloud Platforms", modifier: 10000 },
  { skill: "Azure", category: "Cloud Platforms", modifier: 9000 },
  { skill: "GCP", category: "Cloud Platforms", modifier: 9000 },

  // MLOps Tools
  { skill: "Docker", category: "MLOps Tools", modifier: 6000 },
  { skill: "Kubernetes", category: "MLOps Tools", modifier: 8000 },
  { skill: "MLflow", category: "MLOps Tools", modifier: 5000 },
  { skill: "Airflow", category: "MLOps Tools", modifier: 6000 },
  { skill: "Kubeflow", category: "MLOps Tools", modifier: 7000 },

  // Specializations
  {
    skill: "Deep Learning",
    category: "Specializations",
    modifier: 12000,
  },
  { skill: "NLP", category: "Specializations", modifier: 10000 },
  {
    skill: "Computer Vision",
    category: "Specializations",
    modifier: 10000,
  },
  {
    skill: "Reinforcement Learning",
    category: "Specializations",
    modifier: 12000,
  },
  { skill: "Time Series", category: "Specializations", modifier: 6000 },
  {
    skill: "Recommendation Systems",
    category: "Specializations",
    modifier: 7000,
  },

  // Big Data
  { skill: "Spark", category: "Big Data", modifier: 8000 },
  { skill: "Hadoop", category: "Big Data", modifier: 6000 },
  { skill: "Kafka", category: "Big Data", modifier: 7000 },

  // Databases
  { skill: "SQL", category: "Databases", modifier: 3000 },
  { skill: "PostgreSQL", category: "Databases", modifier: 4000 },
  { skill: "MongoDB", category: "Databases", modifier: 4000 },
  { skill: "Redis", category: "Databases", modifier: 4000 },
];

// Get base salary for a role, experience, and location
export function getBaseSalary(
  role: Role,
  experienceLevel: ExperienceLevel,
  location: Location
): SalaryRange {
  const baseSalary = BASE_SALARIES[role][experienceLevel];
  const multiplier = LOCATION_MULTIPLIERS[location];

  return {
    min: Math.round(baseSalary.min * multiplier),
    median: Math.round(baseSalary.median * multiplier),
    max: Math.round(baseSalary.max * multiplier),
  };
}

// Get skill categories for UI grouping
export function getSkillCategories(): string[] {
  const categories = new Set(SKILL_MODIFIERS.map((sm) => sm.category));
  return Array.from(categories);
}

// Get skills by category
export function getSkillsByCategory(category: string): SkillModifier[] {
  return SKILL_MODIFIERS.filter((sm) => sm.category === category);
}

// Get all skills as a flat array
export function getAllSkills(): string[] {
  return SKILL_MODIFIERS.map((sm) => sm.skill);
}
