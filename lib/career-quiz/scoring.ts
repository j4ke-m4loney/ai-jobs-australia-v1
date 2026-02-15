import { CAREER_PATHS, QUIZ_QUESTIONS, type CareerPathId, type CareerPath } from './quizData';

export interface CareerPathResult {
  path: CareerPath;
  rawScore: number;
  maxPossibleScore: number;
  percentage: number;
}

export interface QuizResults {
  topMatch: CareerPathResult;
  runnerUps: CareerPathResult[];
  allResults: CareerPathResult[];
}

/**
 * Calculate quiz results from user answers.
 * @param answers - Record mapping question index (0-based) to selected option index (0-based)
 */
export function calculateResults(answers: Record<number, number>): QuizResults {
  // Accumulate raw scores per career path
  const rawScores: Record<CareerPathId, number> = {} as Record<CareerPathId, number>;
  for (const path of CAREER_PATHS) {
    rawScores[path.id] = 0;
  }

  for (const [questionIndex, optionIndex] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS[Number(questionIndex)];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option) continue;

    for (const [pathId, score] of Object.entries(option.scores)) {
      rawScores[pathId as CareerPathId] += score;
    }
  }

  // Calculate max possible score per path
  // For each question, find the highest score available for that path across all options
  const maxScores: Record<CareerPathId, number> = {} as Record<CareerPathId, number>;
  for (const path of CAREER_PATHS) {
    maxScores[path.id] = 0;
  }

  for (const question of QUIZ_QUESTIONS) {
    for (const path of CAREER_PATHS) {
      let maxForQuestion = 0;
      for (const option of question.options) {
        const score = option.scores[path.id] ?? 0;
        if (score > maxForQuestion) {
          maxForQuestion = score;
        }
      }
      maxScores[path.id] += maxForQuestion;
    }
  }

  // Build results with normalised percentages
  const results: CareerPathResult[] = CAREER_PATHS.map((path) => {
    const maxPossible = maxScores[path.id];
    const raw = rawScores[path.id];
    const percentage = maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0;

    return {
      path,
      rawScore: raw,
      maxPossibleScore: maxPossible,
      percentage,
    };
  });

  // Sort by percentage (desc), then raw score (desc), then alphabetical (asc)
  results.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
    return a.path.name.localeCompare(b.path.name);
  });

  return {
    topMatch: results[0],
    runnerUps: results.slice(1, 3),
    allResults: results,
  };
}

export function formatSalaryRange(min: number, max: number): string {
  const formatK = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${formatK(min)} – ${formatK(max)}`;
}

export function getDemandLevelColour(level: string): string {
  switch (level) {
    case 'Very High':
      return 'text-green-600 dark:text-green-400';
    case 'High':
      return 'text-blue-600 dark:text-blue-400';
    case 'Medium-High':
      return 'text-blue-500 dark:text-blue-400';
    case 'Medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Growing':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-muted-foreground';
  }
}
