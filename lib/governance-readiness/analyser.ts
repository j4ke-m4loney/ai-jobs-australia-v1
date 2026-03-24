import {
  GovernanceRole,
  GOVERNANCE_SKILL_CATEGORIES,
  ROLE_SKILL_EMPHASIS,
  GovernanceSkillCategory,
} from './data';

// Interfaces
export interface SkillMatch {
  skillName: string;
  category: string;
  importance: 'essential' | 'important' | 'nice-to-have';
  matchedAlias: string;
}

export interface SkillGap {
  skillName: string;
  category: string;
  importance: 'essential' | 'important' | 'nice-to-have';
  learningResources: {
    name: string;
    type: string;
    url: string;
    provider: string;
    isFree: boolean;
  }[];
}

export interface CategoryResult {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  percentage: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
}

export interface GovernanceAssessment {
  overallScore: number;
  overallPercentage: number;
  readinessLevel: string;
  categoryResults: CategoryResult[];
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  recommendations: string[];
  strengths: string[];
  topGaps: SkillGap[];
  roleSpecificScore: number | null;
  roleSpecificFeedback: string | null;
}

// Category weights (sum to 1.0)
const WEIGHTS: Record<string, number> = {
  'AI Frameworks & Principles': 0.25,
  'Technical AI Understanding': 0.15,
  'Risk Assessment & Management': 0.20,
  'Compliance & Regulation': 0.15,
  'Stakeholder Engagement': 0.10,
  'Implementation & Operations': 0.15,
};

/**
 * Main analysis function
 */
export function analyseGovernanceReadiness(
  text: string,
  targetRole?: GovernanceRole
): GovernanceAssessment {
  const normalizedText = text.toLowerCase().trim();

  // Analyse each category
  const categoryResults: CategoryResult[] = [];
  const allMatched: SkillMatch[] = [];
  const allMissing: SkillGap[] = [];

  for (const category of GOVERNANCE_SKILL_CATEGORIES) {
    const result = analyseCategory(normalizedText, category);
    categoryResults.push(result);
    allMatched.push(...result.matchedSkills);
    allMissing.push(...result.missingSkills);
  }

  // Calculate overall weighted score
  let weightedScore = 0;
  for (const result of categoryResults) {
    const weight = WEIGHTS[result.name] || 0.15;
    weightedScore += (result.percentage / 100) * weight;
  }

  const overallPercentage = Math.round(weightedScore * 100);
  const readinessLevel = getReadinessLevel(overallPercentage);

  // Role-specific analysis
  let roleSpecificScore: number | null = null;
  let roleSpecificFeedback: string | null = null;

  if (targetRole) {
    const roleResult = analyseRoleSpecific(normalizedText, targetRole);
    roleSpecificScore = roleResult.score;
    roleSpecificFeedback = roleResult.feedback;
  }

  // Generate strengths
  const strengths = generateStrengths(categoryResults);

  // Get top skill gaps (prioritise essential skills)
  const topGaps = allMissing
    .sort((a, b) => {
      const importanceOrder = { essential: 0, important: 1, 'nice-to-have': 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    })
    .slice(0, 8);

  // Generate recommendations
  const recommendations = generateRecommendations(
    categoryResults,
    topGaps,
    targetRole,
    overallPercentage
  );

  return {
    overallScore: weightedScore,
    overallPercentage,
    readinessLevel,
    categoryResults,
    matchedSkills: allMatched,
    missingSkills: allMissing,
    recommendations,
    strengths,
    topGaps,
    roleSpecificScore,
    roleSpecificFeedback,
  };
}

/**
 * Analyse a single skill category
 */
function analyseCategory(
  text: string,
  category: GovernanceSkillCategory
): CategoryResult {
  const matched: SkillMatch[] = [];
  const missing: SkillGap[] = [];

  let score = 0;
  let maxScore = 0;

  for (const skill of category.skills) {
    const importanceWeight =
      skill.importance === 'essential'
        ? 3
        : skill.importance === 'important'
          ? 2
          : 1;
    maxScore += importanceWeight;

    // Check skill name and aliases
    let found = false;
    let matchedAlias = '';

    // Check main name
    if (findSkillInText(text, skill.name.toLowerCase())) {
      found = true;
      matchedAlias = skill.name;
    }

    // Check aliases
    if (!found) {
      for (const alias of skill.aliases) {
        if (findSkillInText(text, alias.toLowerCase())) {
          found = true;
          matchedAlias = alias;
          break;
        }
      }
    }

    if (found) {
      score += importanceWeight;
      matched.push({
        skillName: skill.name,
        category: category.name,
        importance: skill.importance,
        matchedAlias,
      });
    } else {
      missing.push({
        skillName: skill.name,
        category: category.name,
        importance: skill.importance,
        learningResources: skill.learningResources,
      });
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    name: category.name,
    description: category.description,
    score,
    maxScore,
    percentage,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

/**
 * Find a skill in text using word boundary matching
 */
function findSkillInText(text: string, skill: string): boolean {
  // Handle special characters in skill names
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Use word boundary or start/end of string
  const regex = new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, 'i');
  return regex.test(text);
}

/**
 * Analyse role-specific readiness
 */
function analyseRoleSpecific(
  text: string,
  role: GovernanceRole
): { score: number; feedback: string } {
  const emphasisSkills = ROLE_SKILL_EMPHASIS[role] || [];
  let found = 0;

  for (const skill of emphasisSkills) {
    if (findSkillInText(text, skill)) {
      found++;
    }
  }

  const score = Math.round((found / emphasisSkills.length) * 100);

  let feedback: string;
  if (score >= 70) {
    feedback = `Strong alignment with ${role} requirements. Your experience covers most of the key competencies needed.`;
  } else if (score >= 50) {
    feedback = `Good foundation for a ${role} role. Focus on building depth in the missing areas to strengthen your candidacy.`;
  } else if (score >= 30) {
    feedback = `Some relevant experience for ${role}, but significant skill development needed. Consider targeted courses and certifications.`;
  } else {
    feedback = `Early stage for a ${role} role. Start with foundational knowledge in AI governance frameworks and build from there.`;
  }

  return { score, feedback };
}

/**
 * Generate strengths based on category results
 */
function generateStrengths(categories: CategoryResult[]): string[] {
  const strengths: string[] = [];

  for (const cat of categories) {
    if (cat.percentage >= 70) {
      strengths.push(
        `Strong ${cat.name.toLowerCase()} — you demonstrate solid knowledge in this area`
      );
    } else if (cat.percentage >= 50) {
      const topSkills = cat.matchedSkills
        .filter((s) => s.importance === 'essential' || s.importance === 'important')
        .slice(0, 2)
        .map((s) => s.skillName);
      if (topSkills.length > 0) {
        strengths.push(
          `Good foundation in ${cat.name.toLowerCase()}, particularly ${topSkills.join(' and ')}`
        );
      }
    }
  }

  return strengths.slice(0, 4);
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  categories: CategoryResult[],
  topGaps: SkillGap[],
  targetRole?: GovernanceRole,
  overallPercentage?: number
): string[] {
  const recommendations: string[] = [];

  // Identify weakest categories
  const weakCategories = categories
    .filter((c) => c.percentage < 40)
    .sort((a, b) => a.percentage - b.percentage);

  // Category-specific recommendations
  for (const cat of weakCategories.slice(0, 2)) {
    if (cat.name === 'AI Frameworks & Principles') {
      recommendations.push(
        "Start with Australia's AI Ethics Principles and the OECD AI Principles — these are foundational for any governance role"
      );
    } else if (cat.name === 'Technical AI Understanding') {
      recommendations.push(
        "Build your AI/ML literacy — you don't need to code, but understanding bias, explainability, and how models work is critical"
      );
    } else if (cat.name === 'Risk Assessment & Management') {
      recommendations.push(
        'Develop AI risk assessment skills — the NIST AI Risk Management Framework is a free, comprehensive starting point'
      );
    } else if (cat.name === 'Compliance & Regulation') {
      recommendations.push(
        "Strengthen your regulatory knowledge — the Australian Privacy Act and upcoming mandatory AI guardrails are essential to understand"
      );
    } else if (cat.name === 'Stakeholder Engagement') {
      recommendations.push(
        'Highlight your communication and policy writing experience — governance roles require translating technical concepts for executives and boards'
      );
    } else if (cat.name === 'Implementation & Operations') {
      recommendations.push(
        'Gain practical governance experience — setting up AI registers, governance frameworks, or monitoring processes are highly valued'
      );
    }
  }

  // Essential skill gap recommendations
  const essentialGaps = topGaps.filter((g) => g.importance === 'essential').slice(0, 2);
  for (const gap of essentialGaps) {
    if (gap.learningResources.length > 0) {
      const resource = gap.learningResources[0];
      recommendations.push(
        `Priority gap: ${gap.skillName} — check out "${resource.name}" from ${resource.provider}${resource.isFree ? ' (free)' : ''}`
      );
    }
  }

  // Role-specific recommendation
  if (targetRole) {
    recommendations.push(
      `For ${targetRole} roles, ensure your resume explicitly mentions relevant frameworks and methodologies — keywords matter in ATS screening`
    );
  }

  // General recommendations based on score
  if (overallPercentage !== undefined && overallPercentage < 30) {
    recommendations.push(
      'Consider ISO/IEC 42001 (AI Management Systems) certification to demonstrate structured governance knowledge'
    );
  }

  return recommendations.slice(0, 5);
}

/**
 * Get readiness level label and colour info
 */
export function getReadinessLevel(percentage: number): string {
  if (percentage >= 75) return 'Governance Ready';
  if (percentage >= 55) return 'Strong Foundation';
  if (percentage >= 35) return 'Building Skills';
  return 'Getting Started';
}

/**
 * Get score label and colour
 */
export function getScoreLabel(percentage: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (percentage >= 75) {
    return {
      label: 'Governance Ready',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    };
  } else if (percentage >= 55) {
    return {
      label: 'Strong Foundation',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    };
  } else if (percentage >= 35) {
    return {
      label: 'Building Skills',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    };
  } else {
    return {
      label: 'Getting Started',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    };
  }
}

/**
 * Get importance label and colour
 */
export function getImportanceInfo(importance: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (importance) {
    case 'essential':
      return {
        label: 'Essential',
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900',
      };
    case 'important':
      return {
        label: 'Important',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      };
    default:
      return {
        label: 'Nice to Have',
        color: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
      };
  }
}
