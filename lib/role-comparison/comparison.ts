import { RoleData } from './data';

export interface SkillOverlap {
  shared: string[];
  onlyRoleA: string[];
  onlyRoleB: string[];
  overlapPercentage: number;
}

export interface SalaryComparison {
  level: string;
  roleA: { min: number; max: number };
  roleB: { min: number; max: number };
  difference: string; // e.g. "Role A pays $5k–$10k more"
}

export interface RoleComparison {
  roleA: RoleData;
  roleB: RoleData;
  skillOverlap: SkillOverlap;
  toolOverlap: SkillOverlap;
  salaryComparison: SalaryComparison[];
  transitionTips: string[];
}

function computeOverlap(listA: string[], listB: string[]): SkillOverlap {
  const normA = listA.map((s) => s.toLowerCase());
  const normB = listB.map((s) => s.toLowerCase());

  const shared: string[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];

  listA.forEach((skill, i) => {
    if (normB.includes(normA[i])) {
      shared.push(skill);
    } else {
      onlyA.push(skill);
    }
  });

  listB.forEach((skill, i) => {
    if (!normA.includes(normB[i])) {
      onlyB.push(skill);
    }
  });

  const totalUnique = shared.length + onlyA.length + onlyB.length;
  const overlapPercentage = totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;

  return { shared, onlyRoleA: onlyA, onlyRoleB: onlyB, overlapPercentage };
}

function formatSalaryDiff(a: { min: number; max: number }, b: { min: number; max: number }): string {
  const avgA = (a.min + a.max) / 2;
  const avgB = (b.min + b.max) / 2;
  const diff = Math.abs(avgA - avgB);

  if (diff < 3000) return 'Roughly similar';

  const diffK = `$${Math.round(diff / 1000)}k`;
  if (avgA > avgB) return `~${diffK} higher (Role A)`;
  return `~${diffK} higher (Role B)`;
}

const LEVEL_LABELS = ['Junior', 'Mid-Level', 'Senior', 'Lead / Principal'] as const;
const LEVEL_KEYS = ['junior', 'mid', 'senior', 'lead'] as const;

function buildSalaryComparison(roleA: RoleData, roleB: RoleData): SalaryComparison[] {
  return LEVEL_KEYS.map((key, i) => ({
    level: LEVEL_LABELS[i],
    roleA: roleA.salaryRange[key],
    roleB: roleB.salaryRange[key],
    difference: formatSalaryDiff(roleA.salaryRange[key], roleB.salaryRange[key]),
  }));
}

function generateTransitionTips(roleA: RoleData, roleB: RoleData): string[] {
  const tips: string[] = [];
  const skillOverlap = computeOverlap(roleA.keySkills, roleB.keySkills);

  if (skillOverlap.overlapPercentage >= 40) {
    tips.push(
      `Good news — there\'s a ${skillOverlap.overlapPercentage}% skill overlap between these roles, making a transition achievable with focused upskilling.`
    );
  } else {
    tips.push(
      `These roles have a ${skillOverlap.overlapPercentage}% skill overlap. A transition is possible but will require dedicated learning in new areas.`
    );
  }

  if (skillOverlap.onlyRoleB.length > 0) {
    tips.push(
      `Key skills to develop: ${skillOverlap.onlyRoleB.slice(0, 4).join(', ')}.`
    );
  }

  if (roleA.relatedRoles.includes(roleB.id)) {
    tips.push(
      `${roleA.name} is listed as a related role to ${roleB.name} — professionals frequently move between these two paths.`
    );
  }

  return tips;
}

export function compareRoles(roleA: RoleData, roleB: RoleData): RoleComparison {
  return {
    roleA,
    roleB,
    skillOverlap: computeOverlap(roleA.keySkills, roleB.keySkills),
    toolOverlap: computeOverlap(roleA.typicalTools, roleB.typicalTools),
    salaryComparison: buildSalaryComparison(roleA, roleB),
    transitionTips: generateTransitionTips(roleA, roleB),
  };
}
