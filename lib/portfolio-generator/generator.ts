import {
  TargetRole,
  ExperienceLevel,
  TimeCommitment,
  SkillCategory,
  InterestArea,
  ProjectTemplate,
  getProjectsByFilters,
} from "./projectData";

export interface GeneratorInput {
  roles: TargetRole[];
  experienceLevel: ExperienceLevel;
  timeCommitments: TimeCommitment[];
  skills: SkillCategory[];
  interests: InterestArea[];
  projectCount: number;
}

export interface GeneratedProjectSet {
  projects: ProjectTemplate[];
  metadata: {
    roles: TargetRole[];
    experienceLevel: ExperienceLevel;
    timeCommitments: TimeCommitment[];
    skills: SkillCategory[];
    interests: InterestArea[];
    totalAvailable: number;
    totalGenerated: number;
  };
}

// Score a project based on how well it matches the user's criteria
function scoreProject(
  project: ProjectTemplate,
  input: GeneratorInput
): number {
  let score = 0;

  // Role match (higher weight)
  const roleMatches = input.roles.filter((r) =>
    project.targetRoles.includes(r)
  ).length;
  score += roleMatches * 3;

  // Skill match (prefer projects that use skills the user has)
  const skillMatches = input.skills.filter((s) =>
    project.skillsRequired.includes(s)
  ).length;
  score += skillMatches * 2;

  // Interest match
  const interestMatches = input.interests.filter((i) =>
    project.interestAreas.includes(i)
  ).length;
  score += interestMatches * 2;

  // Time commitment match
  const timeMatches = input.timeCommitments.filter((t) =>
    project.timeRequired.includes(t)
  ).length;
  score += timeMatches;

  // Bonus for Australian relevance
  if (project.australianRelevance) {
    score += 1;
  }

  // Adjust by complexity match
  const complexityMap: Record<ExperienceLevel, string[]> = {
    Junior: ["Beginner"],
    Mid: ["Beginner", "Intermediate"],
    Senior: ["Intermediate", "Advanced"],
  };

  if (complexityMap[input.experienceLevel].includes(project.complexity)) {
    score += 2;
  }

  return score;
}

// Generate a balanced set of portfolio project suggestions
export function generateProjects(input: GeneratorInput): GeneratedProjectSet {
  const {
    roles,
    experienceLevel,
    timeCommitments,
    skills,
    interests,
    projectCount,
  } = input;

  // Get all matching projects
  const matchingProjects = getProjectsByFilters(
    roles,
    experienceLevel,
    timeCommitments,
    skills,
    interests
  );

  // Score and sort projects
  const scoredProjects = matchingProjects.map((project) => ({
    project,
    score: scoreProject(project, input),
  }));

  // Sort by score (descending) with some randomisation for variety
  scoredProjects.sort((a, b) => {
    // Add small random factor to prevent identical results
    const randomFactor = (Math.random() - 0.5) * 2;
    return b.score - a.score + randomFactor;
  });

  // Select top projects, ensuring variety in complexity if possible
  let selectedProjects: ProjectTemplate[] = [];
  const complexities = new Set<string>();

  for (const { project } of scoredProjects) {
    if (selectedProjects.length >= projectCount) break;

    // Try to include variety in complexity levels
    if (selectedProjects.length < projectCount - 1 || !complexities.has(project.complexity)) {
      selectedProjects.push(project);
      complexities.add(project.complexity);
    }
  }

  // If we don't have enough, add more regardless of complexity
  if (selectedProjects.length < projectCount) {
    const remaining = scoredProjects
      .map((s) => s.project)
      .filter((p) => !selectedProjects.includes(p));
    selectedProjects = [
      ...selectedProjects,
      ...remaining.slice(0, projectCount - selectedProjects.length),
    ];
  }

  return {
    projects: selectedProjects,
    metadata: {
      roles,
      experienceLevel,
      timeCommitments,
      skills,
      interests,
      totalAvailable: matchingProjects.length,
      totalGenerated: selectedProjects.length,
    },
  };
}

// Get complexity badge styling
export function getComplexityBadge(complexity: string): {
  label: string;
  color: string;
  description: string;
} {
  const badges: Record<string, { label: string; color: string; description: string }> = {
    Beginner: {
      label: "Beginner",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      description: "Good for learning and quick wins",
    },
    Intermediate: {
      label: "Intermediate",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      description: "Solid demonstration of skills",
    },
    Advanced: {
      label: "Advanced",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      description: "Portfolio centrepiece material",
    },
  };

  return badges[complexity] || badges.Intermediate;
}

// Get time commitment details
export function getTimeCommitmentDetails(time: TimeCommitment): {
  label: string;
  hours: string;
} {
  const details: Record<TimeCommitment, { label: string; hours: string }> = {
    weekend: { label: "Weekend Project", hours: "8-16 hours" },
    "2-weeks": { label: "2 Week Sprint", hours: "20-40 hours" },
    "1-month": { label: "1 Month Deep Dive", hours: "40-80 hours" },
    "2-months": { label: "2+ Months", hours: "80+ hours" },
  };

  return details[time];
}
