import {
  SKILL_PATTERNS,
  EXPERIENCE_PATTERNS,
  SALARY_HINTS,
  RED_FLAGS,
  BENEFIT_PATTERNS,
  NICE_TO_HAVE_INDICATORS,
} from "./decoderData";

export interface DetectedSkill {
  skill: string;
  category: string;
  isRequired: boolean;
  context?: string;
}

export interface DetectedRedFlag {
  flag: string;
  explanation: string;
  severity: "low" | "medium" | "high";
  matchedText: string;
}

export interface DetectedBenefit {
  benefit: string;
  category: string;
}

export interface DetectedExperience {
  level: string;
  yearsRange: string;
  confidence: "high" | "medium" | "low";
  matchedText?: string;
}

export interface DetectedSalary {
  hint: string;
  interpretation: string;
  matchedText?: string;
}

export interface JobDecoderResult {
  // Skills
  requiredSkills: DetectedSkill[];
  niceToHaveSkills: DetectedSkill[];
  skillsByCategory: Map<string, DetectedSkill[]>;

  // Experience
  experienceLevel: DetectedExperience | null;

  // Salary
  salaryHints: DetectedSalary[];

  // Red flags
  redFlags: DetectedRedFlag[];

  // Benefits
  benefits: DetectedBenefit[];

  // Stats
  stats: {
    wordCount: number;
    totalSkillsFound: number;
    redFlagCount: number;
    benefitCount: number;
  };

  // Overall assessment
  overallScore: number; // 0-100 score based on benefits vs red flags
  summary: string;
}

// Check if text is in a "nice to have" section
function isInNiceToHaveContext(text: string, position: number): boolean {
  // Look at the 200 characters before the match
  const contextBefore = text.substring(Math.max(0, position - 200), position).toLowerCase();

  for (const indicator of NICE_TO_HAVE_INDICATORS) {
    if (contextBefore.includes(indicator.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// Extract context around a match
function extractContext(text: string, match: RegExpMatchArray, contextLength: number = 50): string {
  if (match.index === undefined) return "";

  const start = Math.max(0, match.index - contextLength);
  const end = Math.min(text.length, match.index + match[0].length + contextLength);

  let context = text.substring(start, end);
  if (start > 0) context = "..." + context;
  if (end < text.length) context = context + "...";

  return context;
}

// Main decoder function
export function decodeJobDescription(jobDescription: string): JobDecoderResult {
  const text = jobDescription;
  const textLower = text.toLowerCase();

  // Detect skills
  const detectedSkills: DetectedSkill[] = [];
  const seenSkills = new Set<string>();

  for (const skillPattern of SKILL_PATTERNS) {
    for (const pattern of skillPattern.patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        const matches = textLower.matchAll(regex);

        for (const match of matches) {
          if (!seenSkills.has(skillPattern.skill)) {
            const position = match.index || 0;
            const isNiceToHave = isInNiceToHaveContext(textLower, position);

            detectedSkills.push({
              skill: skillPattern.skill,
              category: skillPattern.category,
              isRequired: !isNiceToHave, // Default to required unless in nice-to-have section
              context: extractContext(text, match),
            });
            seenSkills.add(skillPattern.skill);
            break; // Only count each skill once
          }
        }
      } catch {
        // Skip invalid regex patterns
        continue;
      }
    }
  }

  // Separate required vs nice-to-have
  const requiredSkills = detectedSkills.filter((s) => s.isRequired);
  const niceToHaveSkills = detectedSkills.filter((s) => !s.isRequired);

  // Group by category
  const skillsByCategory = new Map<string, DetectedSkill[]>();
  for (const skill of detectedSkills) {
    const existing = skillsByCategory.get(skill.category) || [];
    existing.push(skill);
    skillsByCategory.set(skill.category, existing);
  }

  // Detect experience level
  let experienceLevel: DetectedExperience | null = null;
  let highestConfidence = 0;

  for (const expPattern of EXPERIENCE_PATTERNS) {
    for (const pattern of expPattern.patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = textLower.match(regex);

        if (match) {
          // Calculate confidence based on how specific the match is
          let confidence: "high" | "medium" | "low" = "medium";
          if (pattern.includes("year") || pattern.includes("\\+")) {
            confidence = "high";
          } else if (pattern.includes("senior") || pattern.includes("junior") || pattern.includes("lead")) {
            confidence = "medium";
          } else {
            confidence = "low";
          }

          const confidenceScore = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;

          if (confidenceScore > highestConfidence) {
            highestConfidence = confidenceScore;
            experienceLevel = {
              level: expPattern.level,
              yearsRange: expPattern.yearsRange,
              confidence,
              matchedText: match[0],
            };
          }
        }
      } catch {
        continue;
      }
    }
  }

  // Detect salary hints
  const salaryHints: DetectedSalary[] = [];
  const seenHints = new Set<string>();

  for (const hint of SALARY_HINTS) {
    for (const pattern of hint.patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = textLower.match(regex);

        if (match && !seenHints.has(hint.hint)) {
          salaryHints.push({
            hint: hint.hint,
            interpretation: hint.interpretation,
            matchedText: match[0],
          });
          seenHints.add(hint.hint);
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // If no salary hints found, add the "no salary" hint
  if (salaryHints.length === 0) {
    const noSalaryHint = SALARY_HINTS.find((h) => h.hint === "No salary information");
    if (noSalaryHint) {
      salaryHints.push({
        hint: noSalaryHint.hint,
        interpretation: noSalaryHint.interpretation,
      });
    }
  }

  // Detect red flags
  const redFlags: DetectedRedFlag[] = [];
  const seenFlags = new Set<string>();

  for (const flag of RED_FLAGS) {
    for (const pattern of flag.patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = textLower.match(regex);

        if (match && !seenFlags.has(flag.flag)) {
          redFlags.push({
            flag: flag.flag,
            explanation: flag.explanation,
            severity: flag.severity,
            matchedText: match[0],
          });
          seenFlags.add(flag.flag);
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Sort red flags by severity
  redFlags.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Detect benefits
  const benefits: DetectedBenefit[] = [];
  const seenBenefits = new Set<string>();

  for (const benefit of BENEFIT_PATTERNS) {
    for (const pattern of benefit.patterns) {
      try {
        const regex = new RegExp(pattern, "gi");
        const match = textLower.match(regex);

        if (match && !seenBenefits.has(benefit.benefit)) {
          benefits.push({
            benefit: benefit.benefit,
            category: benefit.category,
          });
          seenBenefits.add(benefit.benefit);
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Calculate stats
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  // Calculate overall score
  const benefitScore = Math.min(benefits.length * 10, 40); // Up to 40 points for benefits
  const redFlagPenalty = redFlags.reduce((acc, rf) => {
    return acc + (rf.severity === "high" ? 15 : rf.severity === "medium" ? 8 : 4);
  }, 0);
  const salaryBonus = salaryHints.some((h) => h.hint.includes("range")) ? 15 : 0;
  const clarityBonus = experienceLevel?.confidence === "high" ? 15 : experienceLevel ? 10 : 0;

  let overallScore = 50 + benefitScore + salaryBonus + clarityBonus - redFlagPenalty;
  overallScore = Math.max(0, Math.min(100, overallScore));

  // Generate summary
  const summary = generateSummary(
    detectedSkills.length,
    redFlags.length,
    benefits.length,
    experienceLevel
  );

  return {
    requiredSkills,
    niceToHaveSkills,
    skillsByCategory,
    experienceLevel,
    salaryHints,
    redFlags,
    benefits,
    stats: {
      wordCount,
      totalSkillsFound: detectedSkills.length,
      redFlagCount: redFlags.length,
      benefitCount: benefits.length,
    },
    overallScore,
    summary,
  };
}

function generateSummary(
  skillCount: number,
  redFlagCount: number,
  benefitCount: number,
  experienceLevel: DetectedExperience | null
): string {
  const parts: string[] = [];

  // Experience level
  if (experienceLevel) {
    parts.push(`This appears to be a ${experienceLevel.level.toLowerCase()} position (${experienceLevel.yearsRange}).`);
  }

  // Skills
  if (skillCount > 15) {
    parts.push(`The job requires a broad skillset with ${skillCount} technical skills mentioned.`);
  } else if (skillCount > 8) {
    parts.push(`The role requires a solid technical foundation with ${skillCount} skills mentioned.`);
  } else if (skillCount > 0) {
    parts.push(`The job has focused requirements with ${skillCount} key skills.`);
  }

  // Red flags
  if (redFlagCount === 0) {
    parts.push("No significant red flags were detected.");
  } else if (redFlagCount <= 2) {
    parts.push(`A few potential concerns were noted (${redFlagCount}) - worth asking about in the interview.`);
  } else {
    parts.push(`Several red flags were detected (${redFlagCount}) - proceed with caution and ask clarifying questions.`);
  }

  // Benefits
  if (benefitCount >= 5) {
    parts.push("The benefits package appears comprehensive.");
  } else if (benefitCount > 0) {
    parts.push(`${benefitCount} benefits/perks were mentioned.`);
  }

  return parts.join(" ");
}

// Get score label
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 75) {
    return { label: "Looks Good", color: "text-green-600" };
  } else if (score >= 50) {
    return { label: "Moderate", color: "text-yellow-600" };
  } else if (score >= 30) {
    return { label: "Some Concerns", color: "text-orange-600" };
  } else {
    return { label: "Caution Advised", color: "text-red-600" };
  }
}

// Get severity color
export function getSeverityColor(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "low":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
}
