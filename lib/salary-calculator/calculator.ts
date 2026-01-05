import {
  Role,
  ExperienceLevel,
  Location,
  SalaryRange,
  getBaseSalary,
  SKILL_MODIFIERS,
  LOCATIONS,
  LOCATION_MULTIPLIERS,
} from "./salaryData";

export interface SkillImpact {
  skill: string;
  modifier: number;
  category: string;
}

export interface SalaryResult {
  baseSalary: SalaryRange;
  skillBonus: number;
  skillImpacts: SkillImpact[];
  totalSalary: SalaryRange;
  role: Role;
  experienceLevel: ExperienceLevel;
  location: Location;
}

export interface CityComparison {
  location: Location;
  salary: SalaryRange;
  difference: number; // percentage difference from selected location
  differenceAmount: number; // dollar difference (median)
}

/**
 * Calculate total salary including base salary and skill bonuses
 */
export function calculateSalary(
  role: Role,
  experienceLevel: ExperienceLevel,
  location: Location,
  selectedSkills: string[]
): SalaryResult {
  // Get base salary for role, experience, and location
  const baseSalary = getBaseSalary(role, experienceLevel, location);

  // Calculate skill bonuses
  const skillImpacts: SkillImpact[] = [];
  let totalSkillBonus = 0;

  selectedSkills.forEach((skill) => {
    const skillModifier = SKILL_MODIFIERS.find((sm) => sm.skill === skill);
    if (skillModifier) {
      const locationAdjustedModifier = Math.round(
        skillModifier.modifier * LOCATION_MULTIPLIERS[location]
      );
      skillImpacts.push({
        skill: skillModifier.skill,
        modifier: locationAdjustedModifier,
        category: skillModifier.category,
      });
      totalSkillBonus += locationAdjustedModifier;
    }
  });

  // Calculate total salary (base + skills)
  const totalSalary: SalaryRange = {
    min: baseSalary.min + totalSkillBonus,
    median: baseSalary.median + totalSkillBonus,
    max: baseSalary.max + totalSkillBonus,
  };

  return {
    baseSalary,
    skillBonus: totalSkillBonus,
    skillImpacts: skillImpacts.sort((a, b) => b.modifier - a.modifier), // Sort by impact (highest first)
    totalSalary,
    role,
    experienceLevel,
    location,
  };
}

/**
 * Compare salaries across all Australian cities
 */
export function compareCities(
  role: Role,
  experienceLevel: ExperienceLevel,
  selectedSkills: string[],
  currentLocation: Location
): CityComparison[] {
  const currentSalary = calculateSalary(
    role,
    experienceLevel,
    currentLocation,
    selectedSkills
  );

  const comparisons: CityComparison[] = LOCATIONS.map((location) => {
    const locationSalary = calculateSalary(
      role,
      experienceLevel,
      location,
      selectedSkills
    );

    const differenceAmount =
      locationSalary.totalSalary.median - currentSalary.totalSalary.median;
    const differencePercentage =
      ((locationSalary.totalSalary.median - currentSalary.totalSalary.median) /
        currentSalary.totalSalary.median) *
      100;

    return {
      location,
      salary: locationSalary.totalSalary,
      difference: Math.round(differencePercentage * 10) / 10, // Round to 1 decimal
      differenceAmount,
    };
  });

  // Sort by median salary (highest first)
  return comparisons.sort((a, b) => b.salary.median - a.salary.median);
}

/**
 * Get the impact of each skill on salary
 */
export function getSkillImpact(selectedSkills: string[]): SkillImpact[] {
  const impacts: SkillImpact[] = [];

  selectedSkills.forEach((skill) => {
    const skillModifier = SKILL_MODIFIERS.find((sm) => sm.skill === skill);
    if (skillModifier) {
      impacts.push({
        skill: skillModifier.skill,
        modifier: skillModifier.modifier,
        category: skillModifier.category,
      });
    }
  });

  // Sort by modifier (highest impact first)
  return impacts.sort((a, b) => b.modifier - a.modifier);
}

/**
 * Format salary as AUD currency string
 */
export function formatSalary(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}%`;
}

/**
 * Get a recommendation message based on the salary and skills
 */
export function getRecommendation(result: SalaryResult): string {
  const skillCount = result.skillImpacts.length;
  const skillBonus = result.skillBonus;

  if (skillCount === 0) {
    return "Consider adding relevant skills to increase your earning potential. Skills like AWS, TensorFlow, or Deep Learning can add significant value.";
  } else if (skillCount < 3) {
    return "You have some valuable skills. Adding more specialized skills (e.g., cloud platforms or advanced ML frameworks) could boost your salary further.";
  } else if (skillBonus < 20000) {
    return "Good skill set! Consider adding high-impact skills like Deep Learning, Kubernetes, or cloud certifications to maximize your earning potential.";
  } else if (skillBonus < 40000) {
    return "Excellent skill combination! You have valuable expertise that commands a premium in the Australian AI/ML job market.";
  } else {
    return "Outstanding skill portfolio! You possess highly sought-after expertise that places you at the top of the market. Consider lead or principal roles.";
  }
}
