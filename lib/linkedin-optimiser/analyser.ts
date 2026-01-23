import {
  AI_KEYWORDS,
  AI_ROLES,
  POWER_WORDS,
  VALUE_PROPOSITIONS,
} from "./linkedinData";

export interface KeywordMatch {
  keyword: string;
  count: number;
  category: string;
}

export interface HeadlineAnalysis {
  length: number;
  maxLength: number;
  optimalLength: number;
  isOptimalLength: boolean;
  isTooLong: boolean;
  keywordsFound: string[];
  roleDetected: string | null;
  hasValueProp: boolean;
  structureScore: number;
  suggestions: string[];
  tips: string[];
}

export interface SectionAnalysis {
  keywordsFound: KeywordMatch[];
  missingKeywords: string[];
  score: number;
  maxScore: number;
  tips: string[];
  powerWordsFound: string[];
  wordCount: number;
}

export interface CategoryResult {
  name: string;
  foundKeywords: KeywordMatch[];
  missingKeywords: string[];
  score: number;
  maxScore: number;
}

export interface LinkedInAnalysisResult {
  overallScore: number;
  headlineAnalysis: HeadlineAnalysis;
  aboutAnalysis: SectionAnalysis | null;
  experienceAnalysis: SectionAnalysis | null;
  categoryBreakdown: CategoryResult[];
  topMissingKeywords: string[];
  recommendation: string;
  stats: {
    totalCharacters: number;
    sectionsAnalysed: number;
    totalKeywordsFound: number;
    totalKeywordsPossible: number;
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findKeywordsInText(text: string): KeywordMatch[] {
  const matches: KeywordMatch[] = [];

  AI_KEYWORDS.forEach((category) => {
    category.keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi");
      const keywordMatches = text.match(regex);
      const count = keywordMatches ? keywordMatches.length : 0;

      if (count > 0) {
        matches.push({
          keyword,
          count,
          category: category.name,
        });
      }
    });
  });

  return matches;
}

function findPowerWords(text: string): string[] {
  const found: string[] = [];
  POWER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
    if (regex.test(text)) {
      found.push(word);
    }
  });
  return found;
}

function detectRole(headline: string): string | null {
  const lowerHeadline = headline.toLowerCase();
  for (const role of AI_ROLES) {
    if (lowerHeadline.includes(role.toLowerCase())) {
      return role;
    }
  }
  return null;
}

function hasValueProposition(headline: string): boolean {
  const lowerHeadline = headline.toLowerCase();

  // Check for explicit value propositions
  for (const prop of VALUE_PROPOSITIONS) {
    if (lowerHeadline.includes(prop.toLowerCase())) {
      return true;
    }
  }

  // Check for common value prop patterns
  const valuePropPatterns = [
    /helping\s+\w+/i,
    /building\s+\w+/i,
    /driving\s+\w+/i,
    /delivering\s+\w+/i,
    /passionate\s+about/i,
    /specialising\s+in/i,
    /expert\s+in/i,
  ];

  return valuePropPatterns.some((pattern) => pattern.test(headline));
}

export function analyseHeadline(headline: string): HeadlineAnalysis {
  const maxLength = 220;
  const optimalLength = 120;
  const length = headline.length;
  const isOptimalLength = length >= 60 && length <= optimalLength;
  const isTooLong = length > maxLength;

  const keywordsFound = findKeywordsInText(headline).map((m) => m.keyword);
  const roleDetected = detectRole(headline);
  const valueProp = hasValueProposition(headline);

  // Calculate structure score (out of 100)
  let structureScore = 0;

  // Has role/title (30 points)
  if (roleDetected) structureScore += 30;

  // Has keywords (30 points)
  structureScore += Math.min(keywordsFound.length * 10, 30);

  // Has value proposition (20 points)
  if (valueProp) structureScore += 20;

  // Good length (20 points)
  if (isOptimalLength) structureScore += 20;
  else if (length > 40 && length <= maxLength) structureScore += 10;

  // Generate tips
  const tips: string[] = [];
  if (!roleDetected) {
    tips.push("Add your job title to help recruiters find you");
  }
  if (keywordsFound.length === 0) {
    tips.push("Include AI/ML keywords like 'Machine Learning', 'NLP', or 'Data Science'");
  }
  if (!valueProp) {
    tips.push("Add a value proposition explaining what you help others achieve");
  }
  if (length < 60) {
    tips.push("Your headline is quite short - consider adding more detail");
  }
  if (isTooLong) {
    tips.push(`Your headline exceeds ${maxLength} characters and may be truncated`);
  }

  // Generate suggestions
  const suggestions = generateHeadlineSuggestions(headline, roleDetected, keywordsFound);

  return {
    length,
    maxLength,
    optimalLength,
    isOptimalLength,
    isTooLong,
    keywordsFound,
    roleDetected,
    hasValueProp: valueProp,
    structureScore,
    suggestions,
    tips,
  };
}

function generateHeadlineSuggestions(
  currentHeadline: string,
  detectedRole: string | null,
  foundKeywords: string[]
): string[] {
  const suggestions: string[] = [];
  const role = detectedRole || "Machine Learning Engineer";

  // Pick a specialty based on found keywords or default
  let specialty = "AI/ML";
  if (foundKeywords.some((k) => k.toLowerCase().includes("nlp") || k.toLowerCase().includes("natural language"))) {
    specialty = "NLP";
  } else if (foundKeywords.some((k) => k.toLowerCase().includes("computer vision"))) {
    specialty = "Computer Vision";
  } else if (foundKeywords.some((k) => k.toLowerCase().includes("deep learning"))) {
    specialty = "Deep Learning";
  } else if (foundKeywords.some((k) => k.toLowerCase().includes("generative") || k.toLowerCase().includes("llm"))) {
    specialty = "Generative AI";
  }

  // Generate 3 suggestions
  suggestions.push(
    `${role} | ${specialty} | Building production ML systems`
  );
  suggestions.push(
    `${role} specialising in ${specialty} | Driving business outcomes with AI`
  );
  suggestions.push(
    `${specialty} Expert | ${role} | Turning data into actionable insights`
  );

  return suggestions;
}

function analyseSection(text: string, sectionName: string): SectionAnalysis {
  const keywordsFound = findKeywordsInText(text);
  const powerWordsFound = findPowerWords(text);
  const wordCount = text.trim().split(/\s+/).length;

  // Calculate score
  let score = 0;
  let maxScore = 0;

  AI_KEYWORDS.forEach((category) => {
    const categoryMax = category.keywords.length * category.weight;
    maxScore += categoryMax;

    category.keywords.forEach((keyword) => {
      const found = keywordsFound.some(
        (m) => m.keyword.toLowerCase() === keyword.toLowerCase()
      );
      if (found) {
        score += category.weight;
      }
    });
  });

  // Find missing keywords
  const foundKeywordNames = keywordsFound.map((k) => k.keyword.toLowerCase());
  const allMissing: { keyword: string; weight: number }[] = [];

  AI_KEYWORDS.forEach((category) => {
    category.keywords.forEach((keyword) => {
      if (!foundKeywordNames.includes(keyword.toLowerCase())) {
        allMissing.push({ keyword, weight: category.weight });
      }
    });
  });

  const missingKeywords = allMissing
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 15)
    .map((m) => m.keyword);

  // Generate tips
  const tips: string[] = [];

  if (sectionName === "About") {
    if (wordCount < 50) {
      tips.push("Your About section is quite short. Aim for 150-300 words to tell your story.");
    }
    if (wordCount > 500) {
      tips.push("Your About section is lengthy. Consider condensing to keep recruiters engaged.");
    }
    if (powerWordsFound.length === 0) {
      tips.push("Add action verbs like 'Led', 'Built', or 'Delivered' to strengthen your narrative.");
    }
    if (keywordsFound.length < 5) {
      tips.push("Include more AI/ML keywords to improve searchability.");
    }
    // Check for first-person language
    if (!/\b(I|my|me)\b/i.test(text)) {
      tips.push("Consider using first-person language ('I built...') for a more personal tone.");
    }
  }

  if (sectionName === "Experience") {
    if (powerWordsFound.length < 3) {
      tips.push("Use more action verbs to start your bullet points (Led, Built, Implemented).");
    }
    if (!/\d+%|\d+x|\$\d+|\d+\s*(users|customers|increase|reduction)/i.test(text)) {
      tips.push("Add quantified achievements (e.g., 'Improved model accuracy by 15%').");
    }
    if (keywordsFound.length < 8) {
      tips.push("Include more technical keywords throughout your experience descriptions.");
    }
  }

  return {
    keywordsFound,
    missingKeywords,
    score,
    maxScore,
    tips,
    powerWordsFound,
    wordCount,
  };
}

export function analyseLinkedInProfile(
  headline: string,
  about: string,
  experience: string
): LinkedInAnalysisResult {
  // Analyse each section
  const headlineAnalysis = analyseHeadline(headline);
  const aboutAnalysis = about.trim() ? analyseSection(about, "About") : null;
  const experienceAnalysis = experience.trim() ? analyseSection(experience, "Experience") : null;

  // Calculate overall score (weighted)
  // Headline: 30%, About: 35%, Experience: 35%
  let weightedScore = 0;
  let totalWeight = 0;

  // Headline (always required) - 30%
  weightedScore += (headlineAnalysis.structureScore / 100) * 30;
  totalWeight += 30;

  // About section - 35% if provided
  if (aboutAnalysis) {
    const aboutPercentage = aboutAnalysis.maxScore > 0
      ? aboutAnalysis.score / aboutAnalysis.maxScore
      : 0;
    weightedScore += aboutPercentage * 35;
    totalWeight += 35;
  }

  // Experience section - 35% if provided
  if (experienceAnalysis) {
    const expPercentage = experienceAnalysis.maxScore > 0
      ? experienceAnalysis.score / experienceAnalysis.maxScore
      : 0;
    weightedScore += expPercentage * 35;
    totalWeight += 35;
  }

  // If only headline provided, it gets 100% weight
  const overallScore = totalWeight > 0
    ? Math.round((weightedScore / totalWeight) * 100)
    : 0;

  // Build category breakdown from all sections
  const categoryBreakdown: CategoryResult[] = AI_KEYWORDS.map((category) => {
    const foundKeywords: KeywordMatch[] = [];
    const missingKeywords: string[] = [];
    let score = 0;
    const maxScore = category.keywords.length * category.weight;

    // Combine keywords from all sections
    const allText = `${headline} ${about} ${experience}`;

    category.keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi");
      const matches = allText.match(regex);
      const count = matches ? matches.length : 0;

      if (count > 0) {
        foundKeywords.push({
          keyword,
          count,
          category: category.name,
        });
        score += category.weight;
      } else {
        missingKeywords.push(keyword);
      }
    });

    return {
      name: category.name,
      foundKeywords,
      missingKeywords,
      score,
      maxScore,
    };
  });

  // Get top missing keywords across all categories
  const allMissing: { keyword: string; weight: number }[] = [];
  categoryBreakdown.forEach((cat) => {
    const category = AI_KEYWORDS.find((c) => c.name === cat.name);
    cat.missingKeywords.forEach((keyword) => {
      allMissing.push({ keyword, weight: category?.weight || 1 });
    });
  });

  const topMissingKeywords = allMissing
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)
    .map((m) => m.keyword);

  // Calculate stats
  const totalCharacters = headline.length + about.length + experience.length;
  const sectionsAnalysed = 1 + (about.trim() ? 1 : 0) + (experience.trim() ? 1 : 0);
  const totalKeywordsFound = categoryBreakdown.reduce(
    (sum, cat) => sum + cat.foundKeywords.length,
    0
  );
  const totalKeywordsPossible = AI_KEYWORDS.reduce(
    (sum, cat) => sum + cat.keywords.length,
    0
  );

  // Generate recommendation
  const recommendation = getRecommendation(overallScore, totalKeywordsFound);

  return {
    overallScore,
    headlineAnalysis,
    aboutAnalysis,
    experienceAnalysis,
    categoryBreakdown,
    topMissingKeywords,
    recommendation,
    stats: {
      totalCharacters,
      sectionsAnalysed,
      totalKeywordsFound,
      totalKeywordsPossible,
    },
  };
}

export function getRecommendation(percentage: number, keywordsFound: number): string {
  if (percentage >= 70) {
    return "Excellent! Your LinkedIn profile is well-optimised for AI/ML roles. Recruiters searching for candidates with your skills should easily find your profile.";
  } else if (percentage >= 50) {
    return "Good foundation! Your profile has solid AI/ML keywords. Consider adding more technical terms and quantified achievements to stand out further.";
  } else if (percentage >= 30) {
    return "Your profile could benefit from more AI/ML-specific keywords. Focus on adding relevant technical skills and frameworks to improve discoverability.";
  } else if (keywordsFound >= 5) {
    return "Your profile needs more AI/ML keywords to be competitive. Review the missing keywords below and incorporate relevant ones into your profile.";
  } else {
    return "Your LinkedIn profile appears to lack AI/ML-specific terminology. Adding relevant keywords will significantly improve your visibility to recruiters.";
  }
}

export function getScoreLabel(percentage: number): {
  label: string;
  color: string;
} {
  if (percentage >= 70) {
    return { label: "Excellent", color: "text-green-600" };
  } else if (percentage >= 50) {
    return { label: "Good", color: "text-blue-600" };
  } else if (percentage >= 30) {
    return { label: "Fair", color: "text-yellow-600" };
  } else {
    return { label: "Needs Improvement", color: "text-red-600" };
  }
}
