import { SKILL_CATEGORIES, Skill, LearningResource, getAllSkills } from "./skillsData";

export interface MatchedSkill {
  skill: Skill;
  foundInResume: boolean;
  foundInJob: boolean;
  isRequired: boolean; // Required in job description
  matchedText?: string;
}

export interface SkillGap {
  skill: Skill;
  priority: "high" | "medium" | "low";
  reason: string;
  learningResources: LearningResource[];
}

export interface SkillMatch {
  skill: Skill;
  strength: "strong" | "mentioned";
}

export interface CategoryAnalysis {
  category: string;
  matches: SkillMatch[];
  gaps: SkillGap[];
  matchPercentage: number;
}

export interface GapAnalysisResult {
  // Overall metrics
  overallMatchScore: number; // 0-100
  matchedSkillsCount: number;
  missingSkillsCount: number;
  totalJobSkills: number;

  // Categorised skills
  strongMatches: SkillMatch[]; // Skills found in both
  missingSkills: SkillGap[]; // Skills in job but not in resume
  additionalSkills: Skill[]; // Skills in resume but not in job

  // Category breakdown
  categoryAnalysis: CategoryAnalysis[];

  // Summary
  summary: string;
  recommendations: string[];
}

// Nice-to-have indicators to detect non-required skills
const NICE_TO_HAVE_PATTERNS = [
  "nice to have",
  "nice-to-have",
  "preferred",
  "bonus",
  "plus",
  "advantageous",
  "desirable",
  "ideally",
  "would be great",
  "good to have",
  "not essential",
  "optional",
  "a plus",
  "an advantage",
];

// Check if skill appears in nice-to-have context
function isNiceToHave(text: string, skillPosition: number): boolean {
  const contextBefore = text
    .substring(Math.max(0, skillPosition - 150), skillPosition)
    .toLowerCase();

  return NICE_TO_HAVE_PATTERNS.some((pattern) =>
    contextBefore.includes(pattern.toLowerCase())
  );
}

// Find skill matches in text
function findSkillInText(
  text: string,
  skill: Skill
): { found: boolean; matchedText?: string; position?: number } {
  const textLower = text.toLowerCase();

  // Check skill name
  const skillNameLower = skill.name.toLowerCase();
  let position = textLower.indexOf(skillNameLower);

  if (position !== -1) {
    return {
      found: true,
      matchedText: skill.name,
      position,
    };
  }

  // Check aliases
  for (const alias of skill.aliases) {
    const aliasLower = alias.toLowerCase();

    // For short aliases (like "ml", "ai", "r"), use word boundary matching
    if (aliasLower.length <= 3) {
      const regex = new RegExp(`\\b${escapeRegex(aliasLower)}\\b`, "i");
      const match = text.match(regex);
      if (match && match.index !== undefined) {
        return {
          found: true,
          matchedText: alias,
          position: match.index,
        };
      }
    } else {
      position = textLower.indexOf(aliasLower);
      if (position !== -1) {
        return {
          found: true,
          matchedText: alias,
          position,
        };
      }
    }
  }

  return { found: false };
}

// Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Main analysis function
export function analyseSkillsGap(
  resumeText: string,
  jobDescription: string
): GapAnalysisResult {
  const allSkills = getAllSkills();
  const matchedSkills: MatchedSkill[] = [];

  // Analyze each skill
  for (const skill of allSkills) {
    const resumeMatch = findSkillInText(resumeText, skill);
    const jobMatch = findSkillInText(jobDescription, skill);

    if (resumeMatch.found || jobMatch.found) {
      const isRequired = jobMatch.found
        ? !isNiceToHave(jobDescription.toLowerCase(), jobMatch.position || 0)
        : false;

      matchedSkills.push({
        skill,
        foundInResume: resumeMatch.found,
        foundInJob: jobMatch.found,
        isRequired,
        matchedText: jobMatch.matchedText || resumeMatch.matchedText,
      });
    }
  }

  // Separate into categories
  const strongMatches: SkillMatch[] = [];
  const missingSkills: SkillGap[] = [];
  const additionalSkills: Skill[] = [];

  for (const match of matchedSkills) {
    if (match.foundInResume && match.foundInJob) {
      strongMatches.push({
        skill: match.skill,
        strength: "strong",
      });
    } else if (match.foundInJob && !match.foundInResume) {
      // This is a gap
      const priority = determinePriority(match.skill, match.isRequired);
      missingSkills.push({
        skill: match.skill,
        priority,
        reason: match.isRequired
          ? "Required in job description"
          : "Nice-to-have in job description",
        learningResources: match.skill.learningResources || [],
      });
    } else if (match.foundInResume && !match.foundInJob) {
      additionalSkills.push(match.skill);
    }
  }

  // Sort missing skills by priority
  missingSkills.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Category analysis
  const categoryAnalysis = analyzeCategoriesDetailed(
    strongMatches,
    missingSkills,
    matchedSkills.filter((m) => m.foundInJob)
  );

  // Calculate overall score
  const jobSkillsCount = matchedSkills.filter((m) => m.foundInJob).length;
  const matchedCount = strongMatches.length;
  const overallMatchScore =
    jobSkillsCount > 0 ? Math.round((matchedCount / jobSkillsCount) * 100) : 0;

  // Generate summary and recommendations
  const summary = generateSummary(
    overallMatchScore,
    strongMatches.length,
    missingSkills.length
  );
  const recommendations = generateRecommendations(
    missingSkills,
    overallMatchScore
  );

  return {
    overallMatchScore,
    matchedSkillsCount: strongMatches.length,
    missingSkillsCount: missingSkills.length,
    totalJobSkills: jobSkillsCount,
    strongMatches,
    missingSkills,
    additionalSkills,
    categoryAnalysis,
    summary,
    recommendations,
  };
}

// Determine priority based on skill importance and whether it's required
function determinePriority(
  skill: Skill,
  isRequired: boolean
): "high" | "medium" | "low" {
  if (isRequired && skill.importance === "essential") {
    return "high";
  }
  if (isRequired && skill.importance === "important") {
    return "high";
  }
  if (isRequired && skill.importance === "nice-to-have") {
    return "medium";
  }
  if (!isRequired && skill.importance === "essential") {
    return "medium";
  }
  return "low";
}

// Analyze categories in detail
function analyzeCategoriesDetailed(
  matches: SkillMatch[],
  gaps: SkillGap[],
  jobSkills: MatchedSkill[]
): CategoryAnalysis[] {
  const categories: CategoryAnalysis[] = [];

  for (const category of SKILL_CATEGORIES) {
    const categoryMatches = matches.filter(
      (m) => m.skill.category === category.name
    );
    const categoryGaps = gaps.filter((g) => g.skill.category === category.name);
    const categoryJobSkills = jobSkills.filter(
      (s) => s.skill.category === category.name
    );

    if (categoryMatches.length > 0 || categoryGaps.length > 0) {
      const matchPercentage =
        categoryJobSkills.length > 0
          ? Math.round(
              (categoryMatches.length / categoryJobSkills.length) * 100
            )
          : 0;

      categories.push({
        category: category.name,
        matches: categoryMatches,
        gaps: categoryGaps,
        matchPercentage,
      });
    }
  }

  // Sort by match percentage (ascending) to show weakest areas first
  categories.sort((a, b) => a.matchPercentage - b.matchPercentage);

  return categories;
}

// Generate summary text
function generateSummary(
  score: number,
  matchCount: number,
  gapCount: number
): string {
  if (score >= 80) {
    return `Excellent match! Your resume covers ${matchCount} of the skills mentioned in this job description. You're well-positioned for this role.`;
  }
  if (score >= 60) {
    return `Good match! You have ${matchCount} matching skills. There are ${gapCount} skills you could develop to strengthen your application.`;
  }
  if (score >= 40) {
    return `Moderate match with ${matchCount} matching skills. Consider addressing the ${gapCount} skill gaps before applying, or highlight transferable experience in your cover letter.`;
  }
  if (score >= 20) {
    return `This role requires skills you're still developing. You match ${matchCount} skills but are missing ${gapCount}. This could be a stretch role to grow into.`;
  }
  return `This role appears to be a significant stretch based on current skills. Consider building foundational skills first or looking for more aligned roles.`;
}

// Generate recommendations
function generateRecommendations(
  gaps: SkillGap[],
  score: number
): string[] {
  const recommendations: string[] = [];

  // High priority gaps
  const highPriorityGaps = gaps.filter((g) => g.priority === "high");
  if (highPriorityGaps.length > 0) {
    const topSkills = highPriorityGaps
      .slice(0, 3)
      .map((g) => g.skill.name)
      .join(", ");
    recommendations.push(
      `Focus on learning these high-priority skills first: ${topSkills}`
    );
  }

  // Score-based recommendations
  if (score < 50) {
    recommendations.push(
      "Consider taking an online course to build foundational skills in the areas you're missing"
    );
  }

  if (score >= 50 && score < 80) {
    recommendations.push(
      "Highlight your matching skills prominently in your resume and cover letter"
    );
  }

  if (gaps.length > 0) {
    const gapsWithResources = gaps.filter(
      (g) => g.learningResources.length > 0
    );
    if (gapsWithResources.length > 0) {
      recommendations.push(
        "Check out the learning resources below to start building the missing skills"
      );
    }
  }

  // Additional skills
  if (score >= 60) {
    recommendations.push(
      "Your additional skills not mentioned in the job description could differentiate you - consider highlighting relevant ones"
    );
  }

  return recommendations;
}

// Get score label and color
export function getScoreInfo(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      label: "Excellent Match",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  }
  if (score >= 60) {
    return {
      label: "Good Match",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  }
  if (score >= 40) {
    return {
      label: "Moderate Match",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  }
  if (score >= 20) {
    return {
      label: "Stretch Role",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    };
  }
  return {
    label: "Skills Gap",
    color: "text-red-600",
    bgColor: "bg-red-100",
  };
}

// Get priority styling
export function getPriorityInfo(priority: "high" | "medium" | "low"): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (priority) {
    case "high":
      return {
        label: "High Priority",
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    case "medium":
      return {
        label: "Medium Priority",
        color: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    case "low":
      return {
        label: "Nice to Have",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
  }
}
