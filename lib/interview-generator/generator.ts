import {
  Role,
  ExperienceLevel,
  InterviewStage,
  QuestionCategory,
  InterviewQuestion,
  getQuestionsByFilters,
} from "./questionData";

export interface GeneratorInput {
  role: Role;
  experienceLevel: ExperienceLevel;
  stages: InterviewStage[];
  categories: QuestionCategory[];
  questionCount: number;
}

export interface GeneratedQuestionSet {
  questions: InterviewQuestion[];
  metadata: {
    role: Role;
    experienceLevel: ExperienceLevel;
    stages: InterviewStage[];
    categories: QuestionCategory[];
    totalAvailable: number;
    totalGenerated: number;
  };
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate a balanced set of interview questions
export function generateQuestions(input: GeneratorInput): GeneratedQuestionSet {
  const { role, experienceLevel, stages, categories, questionCount } = input;

  // Get all matching questions
  const matchingQuestions = getQuestionsByFilters(
    [role],
    experienceLevel,
    stages,
    categories
  );

  // Shuffle for variety
  const shuffled = shuffleArray(matchingQuestions);

  // If we have categories specified, try to balance across them
  let selectedQuestions: InterviewQuestion[];

  if (categories.length > 1 && matchingQuestions.length >= questionCount) {
    selectedQuestions = selectBalancedQuestions(shuffled, categories, questionCount);
  } else {
    selectedQuestions = shuffled.slice(0, questionCount);
  }

  // Sort by category for better presentation
  selectedQuestions.sort((a, b) => {
    const categoryOrder = [
      "Behavioral",
      "ML Fundamentals",
      "Deep Learning",
      "Statistics & Math",
      "Coding & Algorithms",
      "System Design",
      "MLOps & Deployment",
      "Domain Specific",
      "Case Study",
    ];
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });

  return {
    questions: selectedQuestions,
    metadata: {
      role,
      experienceLevel,
      stages,
      categories,
      totalAvailable: matchingQuestions.length,
      totalGenerated: selectedQuestions.length,
    },
  };
}

// Select questions balanced across categories
function selectBalancedQuestions(
  questions: InterviewQuestion[],
  categories: QuestionCategory[],
  targetCount: number
): InterviewQuestion[] {
  const selected: InterviewQuestion[] = [];
  const questionsPerCategory = Math.ceil(targetCount / categories.length);

  // Group questions by category
  const byCategory = new Map<QuestionCategory, InterviewQuestion[]>();
  categories.forEach((cat) => byCategory.set(cat, []));

  questions.forEach((q) => {
    if (byCategory.has(q.category)) {
      byCategory.get(q.category)!.push(q);
    }
  });

  // Select from each category
  categories.forEach((cat) => {
    const categoryQuestions = byCategory.get(cat) || [];
    const toSelect = Math.min(questionsPerCategory, categoryQuestions.length);
    selected.push(...categoryQuestions.slice(0, toSelect));
  });

  // If we still need more questions, add from remaining
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remaining = questions.filter((q) => !selectedIds.has(q.id));
    selected.push(...remaining.slice(0, targetCount - selected.length));
  }

  // Trim to exact count if we have too many
  return selected.slice(0, targetCount);
}

// Get difficulty label with description
export function getDifficultyLabel(level: ExperienceLevel): {
  label: string;
  color: string;
  description: string;
} {
  const labels: Record<
    ExperienceLevel,
    { label: string; color: string; description: string }
  > = {
    Junior: {
      label: "Junior",
      color: "text-green-600",
      description: "Entry-level concepts and fundamentals",
    },
    Mid: {
      label: "Mid-Level",
      color: "text-blue-600",
      description: "Intermediate concepts with practical applications",
    },
    Senior: {
      label: "Senior",
      color: "text-purple-600",
      description: "Advanced concepts and system-level thinking",
    },
    Lead: {
      label: "Lead/Principal",
      color: "text-orange-600",
      description: "Strategic thinking and leadership scenarios",
    },
  };

  return labels[level];
}

// Get category icon suggestion (for UI)
export function getCategoryIcon(category: QuestionCategory): string {
  const icons: Record<QuestionCategory, string> = {
    "ML Fundamentals": "brain",
    "Deep Learning": "layers",
    "System Design": "git-branch",
    "Coding & Algorithms": "code",
    "Statistics & Math": "calculator",
    "MLOps & Deployment": "cloud",
    "Domain Specific": "target",
    Behavioral: "users",
    "Case Study": "briefcase",
  };

  return icons[category];
}

// Get stage description
export function getStageDescription(stage: InterviewStage): string {
  const descriptions: Record<InterviewStage, string> = {
    "Phone Screen": "Initial screening to assess basic qualifications and cultural fit",
    "Technical Interview": "Deep dive into technical knowledge and problem-solving",
    "System Design": "Evaluate ability to design scalable ML systems",
    Behavioral: "Assess soft skills, teamwork, and past experiences",
    "Final Round": "Senior leadership interview and final assessment",
  };

  return descriptions[stage];
}
