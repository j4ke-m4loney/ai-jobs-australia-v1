import { AI_KEYWORDS, getMaxPossibleScore } from './keywords';

export interface KeywordMatch {
  keyword: string;
  count: number;
  category: string;
}

export interface CategoryResult {
  name: string;
  foundKeywords: KeywordMatch[];
  missingKeywords: string[];
  score: number;
  maxScore: number;
}

export interface AnalysisResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  categoryResults: CategoryResult[];
  totalKeywordsFound: number;
  totalKeywordsPossible: number;
  topMissingKeywords: string[];
  recommendation: string;
  readabilityStats: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // in minutes
  };
}

/**
 * Analyzes resume text for AI/ML keywords
 */
export function analyzeResume(resumeText: string): AnalysisResult {

  // Calculate readability stats
  const words = resumeText.trim().split(/\s+/);
  const wordCount = words.length;
  const characterCount = resumeText.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

  let totalScore = 0;
  const maxScore = getMaxPossibleScore();
  const categoryResults: CategoryResult[] = [];
  let totalKeywordsFound = 0;
  const allMissingKeywords: { keyword: string; weight: number }[] = [];

  // Analyze each category
  AI_KEYWORDS.forEach((category) => {
    const foundKeywords: KeywordMatch[] = [];
    const missingKeywords: string[] = [];
    let categoryScore = 0;
    const categoryMaxScore = category.keywords.length * category.weight;

    category.keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = resumeText.match(regex);
      const count = matches ? matches.length : 0;

      if (count > 0) {
        foundKeywords.push({
          keyword,
          count,
          category: category.name,
        });
        categoryScore += category.weight;
        totalKeywordsFound++;
      } else {
        missingKeywords.push(keyword);
        allMissingKeywords.push({
          keyword,
          weight: category.weight,
        });
      }
    });

    totalScore += categoryScore;

    categoryResults.push({
      name: category.name,
      foundKeywords,
      missingKeywords,
      score: categoryScore,
      maxScore: categoryMaxScore,
    });
  });

  // Get top missing keywords (sorted by weight)
  const topMissingKeywords = allMissingKeywords
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)
    .map((item) => item.keyword);

  const percentage = Math.round((totalScore / maxScore) * 100);
  const totalKeywordsPossible = AI_KEYWORDS.reduce(
    (sum, cat) => sum + cat.keywords.length,
    0
  );

  // Generate recommendation
  const recommendation = getRecommendation(percentage, totalKeywordsFound);

  return {
    totalScore,
    maxScore,
    percentage,
    categoryResults,
    totalKeywordsFound,
    totalKeywordsPossible,
    topMissingKeywords,
    recommendation,
    readabilityStats: {
      wordCount,
      characterCount,
      estimatedReadingTime,
    },
  };
}

/**
 * Generate recommendation based on analysis
 */
function getRecommendation(percentage: number, keywordsFound: number): string {
  if (percentage >= 70) {
    return 'Excellent! Your resume is well-optimised for AI/ML roles. It contains strong technical keywords that ATS systems and recruiters look for.';
  } else if (percentage >= 50) {
    return 'Good start! Your resume has decent keyword coverage, but adding 5-7 more relevant technical terms could significantly improve your ATS compatibility.';
  } else if (percentage >= 30) {
    return 'Your resume could benefit from more AI/ML keywords. Consider adding relevant frameworks, tools, and techniques you\'ve worked with to improve visibility.';
  } else if (keywordsFound >= 5) {
    return 'Your resume needs more technical keywords. Review the missing keywords below and add relevant ones that match your actual experience.';
  } else {
    return 'Your resume appears to lack AI/ML-specific keywords. Make sure to include programming languages, frameworks, and techniques you\'ve used in your projects.';
  }
}

/**
 * Get score category label
 */
export function getScoreLabel(percentage: number): {
  label: string;
  color: string;
} {
  if (percentage >= 70) {
    return { label: 'Excellent', color: 'text-green-600' };
  } else if (percentage >= 50) {
    return { label: 'Good', color: 'text-blue-600' };
  } else if (percentage >= 30) {
    return { label: 'Fair', color: 'text-yellow-600' };
  } else {
    return { label: 'Needs Improvement', color: 'text-red-600' };
  }
}
