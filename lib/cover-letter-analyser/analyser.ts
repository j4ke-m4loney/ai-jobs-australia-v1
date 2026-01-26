import {
  AIRole,
  COVER_LETTER_KEYWORDS,
  ROLE_SPECIFIC_KEYWORDS,
  ALL_ACTION_VERBS,
  ACTION_VERBS,
  GENERIC_PHRASES,
  STRONG_OPENING_PATTERNS,
  STRONG_CLOSING_PATTERNS,
  RED_FLAG_PATTERNS,
  KeywordCategory,
} from './data';

// Interfaces
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

export interface StructureAnalysis {
  score: number;
  maxScore: number;
  hasStrongOpening: boolean;
  hasBodyContent: boolean;
  hasClosingCTA: boolean;
  openingFeedback: string;
  closingFeedback: string;
}

export interface KeywordAnalysis {
  score: number;
  maxScore: number;
  foundKeywords: KeywordMatch[];
  missingKeywords: string[];
  categoryBreakdown: CategoryResult[];
}

export interface PersonalisationAnalysis {
  score: number;
  maxScore: number;
  companyMentions: number;
  roleMentions: number;
  genericPhrases: string[];
  personalTouches: string[];
}

export interface ActionVerbAnalysis {
  score: number;
  maxScore: number;
  foundVerbs: string[];
  suggestedVerbs: string[];
}

export interface ReadabilityAnalysis {
  score: number;
  maxScore: number;
  wordCount: number;
  paragraphCount: number;
  sentenceCount: number;
  isOptimalLength: boolean;
  lengthFeedback: string;
}

export interface RedFlag {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface CoverLetterStats {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
}

export interface CoverLetterAnalysis {
  overallScore: number;
  overallPercentage: number;
  structureScore: StructureAnalysis;
  keywordScore: KeywordAnalysis;
  personalisationScore: PersonalisationAnalysis;
  actionVerbScore: ActionVerbAnalysis;
  readabilityScore: ReadabilityAnalysis;
  redFlags: RedFlag[];
  recommendations: string[];
  stats: CoverLetterStats;
}

// Component weights for overall score
const WEIGHTS = {
  structure: 0.20,
  keywords: 0.25,
  personalisation: 0.20,
  actionVerbs: 0.15,
  readability: 0.20,
};

/**
 * Main analysis function
 */
export function analyseCoverLetter(
  text: string,
  targetRole?: AIRole,
  companyName?: string
): CoverLetterAnalysis {
  const normalizedText = text.trim();

  // Calculate stats
  const stats = calculateStats(normalizedText);

  // Perform each analysis
  const structureScore = analyseStructure(normalizedText);
  const keywordScore = analyseKeywords(normalizedText, targetRole);
  const personalisationScore = analysePersonalisation(normalizedText, companyName, targetRole);
  const actionVerbScore = analyseActionVerbs(normalizedText);
  const readabilityScore = analyseReadability(stats);

  // Detect red flags
  const redFlags = detectRedFlags(normalizedText, stats);

  // Calculate overall score
  const overallScore = calculateOverallScore(
    structureScore,
    keywordScore,
    personalisationScore,
    actionVerbScore,
    readabilityScore
  );

  const overallPercentage = Math.round(overallScore * 100);

  // Generate recommendations
  const recommendations = generateRecommendations(
    structureScore,
    keywordScore,
    personalisationScore,
    actionVerbScore,
    readabilityScore,
    redFlags,
    companyName
  );

  return {
    overallScore,
    overallPercentage,
    structureScore,
    keywordScore,
    personalisationScore,
    actionVerbScore,
    readabilityScore,
    redFlags,
    recommendations,
    stats,
  };
}

/**
 * Calculate basic text statistics
 */
function calculateStats(text: string): CoverLetterStats {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  return {
    wordCount: words.length,
    characterCount: text.length,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
  };
}

/**
 * Analyse cover letter structure
 */
function analyseStructure(text: string): StructureAnalysis {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const firstParagraph = paragraphs[0] || '';
  const lastParagraph = paragraphs[paragraphs.length - 1] || '';

  let score = 0;
  const maxScore = 100;

  // Check for strong opening (40 points)
  let hasStrongOpening = false;
  let openingFeedback = '';

  for (const pattern of STRONG_OPENING_PATTERNS) {
    if (pattern.test(firstParagraph)) {
      hasStrongOpening = true;
      break;
    }
  }

  // Check for generic/weak opening
  const startsGeneric = /^(?:i am writing to apply|dear sir|to whom)/i.test(firstParagraph);

  if (hasStrongOpening && !startsGeneric) {
    score += 40;
    openingFeedback = 'Strong opening that engages the reader';
  } else if (!startsGeneric && firstParagraph.length > 50) {
    score += 25;
    openingFeedback = 'Decent opening, but could be more compelling';
    hasStrongOpening = false;
  } else {
    openingFeedback = 'Consider a more engaging opening that highlights your enthusiasm or a key achievement';
    hasStrongOpening = false;
  }

  // Check for body content (30 points)
  const hasBodyContent = paragraphs.length >= 2 && paragraphs.some(p => p.length > 100);
  if (hasBodyContent) {
    score += 30;
  }

  // Check for closing CTA (30 points)
  let hasClosingCTA = false;
  let closingFeedback = '';

  for (const pattern of STRONG_CLOSING_PATTERNS) {
    if (pattern.test(lastParagraph)) {
      hasClosingCTA = true;
      break;
    }
  }

  if (hasClosingCTA) {
    score += 30;
    closingFeedback = 'Clear call to action and availability';
  } else if (lastParagraph.length > 30) {
    score += 15;
    closingFeedback = 'Add a clear call to action and mention your availability';
    hasClosingCTA = false;
  } else {
    closingFeedback = 'Add a closing paragraph with a call to action';
    hasClosingCTA = false;
  }

  return {
    score,
    maxScore,
    hasStrongOpening,
    hasBodyContent,
    hasClosingCTA,
    openingFeedback,
    closingFeedback,
  };
}

/**
 * Analyse keyword usage
 */
function analyseKeywords(text: string, targetRole?: AIRole): KeywordAnalysis {
  const foundKeywords: KeywordMatch[] = [];
  const categoryBreakdown: CategoryResult[] = [];

  let totalScore = 0;
  let totalMaxScore = 0;

  // Combine general keywords with role-specific ones
  const keywordCategories: KeywordCategory[] = [...COVER_LETTER_KEYWORDS];

  if (targetRole && ROLE_SPECIFIC_KEYWORDS[targetRole]) {
    keywordCategories.push({
      name: `${targetRole} Specific`,
      weight: 2.0,
      keywords: ROLE_SPECIFIC_KEYWORDS[targetRole],
    });
  }

  for (const category of keywordCategories) {
    const categoryFound: KeywordMatch[] = [];
    const categoryMissing: string[] = [];
    let categoryScore = 0;
    const categoryMaxScore = category.keywords.length * category.weight;

    for (const keyword of category.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;

      if (count > 0) {
        categoryFound.push({
          keyword,
          count,
          category: category.name,
        });
        foundKeywords.push({
          keyword,
          count,
          category: category.name,
        });
        categoryScore += category.weight;
      } else {
        categoryMissing.push(keyword);
      }
    }

    totalScore += categoryScore;
    totalMaxScore += categoryMaxScore;

    categoryBreakdown.push({
      name: category.name,
      foundKeywords: categoryFound,
      missingKeywords: categoryMissing,
      score: categoryScore,
      maxScore: categoryMaxScore,
    });
  }

  // Deduplicate found keywords and get top missing
  const uniqueFound = foundKeywords.filter(
    (v, i, a) => a.findIndex(t => t.keyword.toLowerCase() === v.keyword.toLowerCase()) === i
  );

  // Get top missing keywords (prioritise high-weight categories)
  const allMissing: { keyword: string; weight: number }[] = [];
  for (const category of categoryBreakdown) {
    const catDef = keywordCategories.find(c => c.name === category.name);
    const weight = catDef?.weight || 1;
    for (const kw of category.missingKeywords.slice(0, 5)) {
      allMissing.push({ keyword: kw, weight });
    }
  }
  const topMissing = allMissing
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map(m => m.keyword);

  // Normalise score to 0-100
  const normalizedScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  return {
    score: Math.round(normalizedScore),
    maxScore: 100,
    foundKeywords: uniqueFound,
    missingKeywords: topMissing,
    categoryBreakdown,
  };
}

/**
 * Analyse personalisation
 */
function analysePersonalisation(
  text: string,
  companyName?: string,
  targetRole?: AIRole
): PersonalisationAnalysis {
  const lowerText = text.toLowerCase();
  let score = 0;
  const maxScore = 100;
  const personalTouches: string[] = [];
  const genericPhrases: string[] = [];

  // Check for company mentions (40 points max)
  let companyMentions = 0;
  if (companyName) {
    const companyRegex = new RegExp(`\\b${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(companyRegex);
    companyMentions = matches ? matches.length : 0;
    if (companyMentions >= 2) {
      score += 40;
      personalTouches.push(`Company name mentioned ${companyMentions} times`);
    } else if (companyMentions === 1) {
      score += 25;
      personalTouches.push('Company name mentioned once');
    }
  } else {
    // Check for any company reference if name not provided
    const hasCompanyRef = /your (?:company|team|organisation|mission|product)/i.test(text);
    if (hasCompanyRef) {
      score += 20;
      personalTouches.push('References to "your company/team"');
    }
  }

  // Check for role mentions (20 points max)
  let roleMentions = 0;
  if (targetRole) {
    const roleRegex = new RegExp(`\\b${targetRole.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(roleRegex);
    roleMentions = matches ? matches.length : 0;
    if (roleMentions > 0) {
      score += 20;
      personalTouches.push('Role title mentioned');
    }
  }

  // Check for "you/your" language addressing the company (20 points)
  const youMatches = text.match(/\b(your|you)\b/gi);
  const youCount = youMatches ? youMatches.length : 0;
  if (youCount >= 5) {
    score += 20;
    personalTouches.push('Strong "you/your" language addressing the reader');
  } else if (youCount >= 2) {
    score += 10;
    personalTouches.push('Some direct addressing of the reader');
  }

  // Check for specific/concrete details (20 points)
  const hasSpecifics = /(?:\d+%|\d+\s*(?:years?|months?|projects?|models?|teams?|clients?))/i.test(text);
  if (hasSpecifics) {
    score += 20;
    personalTouches.push('Includes specific numbers or metrics');
  }

  // Penalise generic phrases
  for (const phrase of GENERIC_PHRASES) {
    if (lowerText.includes(phrase)) {
      genericPhrases.push(phrase);
      score -= 10;
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(score, maxScore));

  return {
    score,
    maxScore,
    companyMentions,
    roleMentions,
    genericPhrases,
    personalTouches,
  };
}

/**
 * Analyse action verbs usage
 */
function analyseActionVerbs(text: string): ActionVerbAnalysis {
  const foundVerbs: string[] = [];
  const maxScore = 100;

  // Find all action verbs used
  for (const verb of ALL_ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}(?:ed|ing|s)?\\b`, 'gi');
    if (regex.test(text)) {
      foundVerbs.push(verb);
    }
  }

  // Remove duplicates
  const uniqueVerbs = [...new Set(foundVerbs)];

  // Calculate score based on variety and count
  let score = 0;
  const verbCount = uniqueVerbs.length;

  if (verbCount >= 8) {
    score = 100;
  } else if (verbCount >= 6) {
    score = 80;
  } else if (verbCount >= 4) {
    score = 60;
  } else if (verbCount >= 2) {
    score = 40;
  } else if (verbCount >= 1) {
    score = 20;
  }

  // Bonus for variety across categories
  const categoriesUsed = new Set<string>();
  for (const verb of uniqueVerbs) {
    if (ACTION_VERBS.achievement.includes(verb)) categoriesUsed.add('achievement');
    if (ACTION_VERBS.technical.includes(verb)) categoriesUsed.add('technical');
    if (ACTION_VERBS.leadership.includes(verb)) categoriesUsed.add('leadership');
    if (ACTION_VERBS.collaboration.includes(verb)) categoriesUsed.add('collaboration');
  }

  if (categoriesUsed.size >= 3) {
    score = Math.min(100, score + 10);
  }

  // Suggest verbs from categories not well represented
  const suggestedVerbs: string[] = [];
  if (!categoriesUsed.has('achievement')) {
    suggestedVerbs.push(...ACTION_VERBS.achievement.slice(0, 2));
  }
  if (!categoriesUsed.has('technical')) {
    suggestedVerbs.push(...ACTION_VERBS.technical.slice(0, 2));
  }
  if (!categoriesUsed.has('leadership') && !categoriesUsed.has('collaboration')) {
    suggestedVerbs.push(...ACTION_VERBS.collaboration.slice(0, 2));
  }

  return {
    score,
    maxScore,
    foundVerbs: uniqueVerbs,
    suggestedVerbs: suggestedVerbs.slice(0, 6),
  };
}

/**
 * Analyse readability and length
 */
function analyseReadability(stats: CoverLetterStats): ReadabilityAnalysis {
  const maxScore = 100;
  let score = 0;
  let lengthFeedback = '';

  // Word count scoring (50 points max)
  const { wordCount, paragraphCount, sentenceCount } = stats;
  let isOptimalLength = false;

  if (wordCount >= 250 && wordCount <= 400) {
    score += 50;
    isOptimalLength = true;
    lengthFeedback = 'Optimal length for a cover letter';
  } else if (wordCount >= 200 && wordCount <= 450) {
    score += 35;
    lengthFeedback = wordCount < 250
      ? 'Slightly short - aim for 250-400 words'
      : 'Slightly long - aim for 250-400 words';
  } else if (wordCount >= 150 && wordCount <= 500) {
    score += 20;
    lengthFeedback = wordCount < 200
      ? 'Cover letter is too short - add more substance'
      : 'Cover letter is too long - consider trimming';
  } else if (wordCount < 150) {
    score += 5;
    lengthFeedback = 'Cover letter is significantly too short';
  } else {
    score += 10;
    lengthFeedback = 'Cover letter is too long - readers may lose interest';
  }

  // Paragraph count scoring (30 points max)
  if (paragraphCount >= 3 && paragraphCount <= 5) {
    score += 30;
  } else if (paragraphCount >= 2 && paragraphCount <= 6) {
    score += 20;
  } else if (paragraphCount === 1) {
    score += 5;
  } else {
    score += 10;
  }

  // Sentence variety (20 points max)
  if (sentenceCount >= 8 && sentenceCount <= 20) {
    score += 20;
  } else if (sentenceCount >= 5 && sentenceCount <= 25) {
    score += 10;
  } else {
    score += 5;
  }

  return {
    score,
    maxScore,
    wordCount,
    paragraphCount,
    sentenceCount,
    isOptimalLength,
    lengthFeedback,
  };
}

/**
 * Detect red flags in the cover letter
 */
function detectRedFlags(text: string, stats: CoverLetterStats): RedFlag[] {
  const redFlags: RedFlag[] = [];

  // Check patterns
  for (const flag of RED_FLAG_PATTERNS) {
    const pattern = typeof flag.pattern === 'string'
      ? new RegExp(flag.pattern, 'i')
      : flag.pattern;

    if (pattern.test(text)) {
      redFlags.push({
        type: flag.type,
        message: flag.message,
        severity: flag.severity,
      });
    }
  }

  // Check length-based flags
  if (stats.wordCount < 150) {
    redFlags.push({
      type: 'too_short',
      message: 'Cover letter is too short - aim for 250-400 words',
      severity: 'high',
    });
  } else if (stats.wordCount > 500) {
    redFlags.push({
      type: 'too_long',
      message: 'Cover letter is too long - consider trimming to 250-400 words',
      severity: 'medium',
    });
  }

  // Check paragraph structure
  if (stats.paragraphCount === 1) {
    redFlags.push({
      type: 'no_paragraphs',
      message: 'Break your letter into 3-5 paragraphs for better readability',
      severity: 'high',
    });
  }

  return redFlags;
}

/**
 * Calculate overall weighted score
 */
function calculateOverallScore(
  structure: StructureAnalysis,
  keywords: KeywordAnalysis,
  personalisation: PersonalisationAnalysis,
  actionVerbs: ActionVerbAnalysis,
  readability: ReadabilityAnalysis
): number {
  const structureNorm = structure.score / structure.maxScore;
  const keywordsNorm = keywords.score / keywords.maxScore;
  const personalisationNorm = personalisation.score / personalisation.maxScore;
  const actionVerbsNorm = actionVerbs.score / actionVerbs.maxScore;
  const readabilityNorm = readability.score / readability.maxScore;

  return (
    structureNorm * WEIGHTS.structure +
    keywordsNorm * WEIGHTS.keywords +
    personalisationNorm * WEIGHTS.personalisation +
    actionVerbsNorm * WEIGHTS.actionVerbs +
    readabilityNorm * WEIGHTS.readability
  );
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  structure: StructureAnalysis,
  keywords: KeywordAnalysis,
  personalisation: PersonalisationAnalysis,
  actionVerbs: ActionVerbAnalysis,
  readability: ReadabilityAnalysis,
  redFlags: RedFlag[],
  companyName?: string
): string[] {
  const recommendations: string[] = [];

  // Structure recommendations
  if (!structure.hasStrongOpening) {
    recommendations.push(
      'Start with a compelling hook - mention a specific achievement or your enthusiasm for the company'
    );
  }
  if (!structure.hasClosingCTA) {
    recommendations.push(
      'End with a clear call to action and mention your availability for an interview'
    );
  }

  // Keyword recommendations
  if (keywords.score < 50 && keywords.missingKeywords.length > 0) {
    const examples = keywords.missingKeywords.slice(0, 3).join(', ');
    recommendations.push(
      `Add more technical keywords relevant to the role, such as: ${examples}`
    );
  }

  // Personalisation recommendations
  if (personalisation.companyMentions === 0 && !companyName) {
    recommendations.push(
      'Mention the company by name to show you\'ve tailored this letter specifically for them'
    );
  }
  if (personalisation.genericPhrases.length > 0) {
    recommendations.push(
      'Replace generic phrases with specific, personalised content about why you want this role'
    );
  }

  // Action verb recommendations
  if (actionVerbs.foundVerbs.length < 4) {
    const examples = actionVerbs.suggestedVerbs.slice(0, 3).join(', ');
    recommendations.push(
      `Use more action verbs to describe your achievements: ${examples}`
    );
  }

  // Readability recommendations
  if (!readability.isOptimalLength) {
    recommendations.push(readability.lengthFeedback);
  }

  // High-severity red flag recommendations
  const highRedFlags = redFlags.filter(f => f.severity === 'high');
  for (const flag of highRedFlags.slice(0, 2)) {
    recommendations.push(flag.message);
  }

  return recommendations.slice(0, 5);
}

/**
 * Get score label and colour
 */
export function getScoreLabel(percentage: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (percentage >= 80) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' };
  } else if (percentage >= 60) {
    return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' };
  } else if (percentage >= 40) {
    return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900' };
  } else {
    return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900' };
  }
}
