import {
  AIMLRole,
  SeniorityLevel,
  CompanySize,
  WorkArrangement,
  ROLE_RESPONSIBILITIES,
  ROLE_REQUIRED_SKILLS,
  ROLE_NICE_TO_HAVES,
  BENEFITS_BY_SIZE,
  SENIORITY_EXPERIENCE,
  SALARY_RANGES,
  BIAS_PATTERNS,
  BiasPattern,
} from './data';

// Input interface
export interface JDInput {
  role: AIMLRole;
  seniority: SeniorityLevel;
  companySize: CompanySize;
  companyName: string;
  teamContext: string;
  techStack: string[];
  location: string;
  workArrangement: WorkArrangement;
  salaryMin?: number;
  salaryMax?: number;
  customResponsibilities: string;
}

// Output interfaces
export interface GeneratedJD {
  title: string;
  sections: JDSection[];
  fullText: string;
  qualityChecks: QualityCheck[];
  salaryBenchmark: SalaryBenchmark | null;
  stats: JDStats;
}

export interface JDSection {
  heading: string;
  content: string;
  type: 'paragraph' | 'list';
}

export interface QualityCheck {
  category: 'bias' | 'requirements' | 'structure' | 'salary' | 'inclusivity';
  status: 'pass' | 'warning' | 'fail';
  message: string;
  suggestion?: string;
}

export interface SalaryBenchmark {
  marketMin: number;
  marketMax: number;
  listedMin?: number;
  listedMax?: number;
  competitiveness: 'below' | 'competitive' | 'above';
  feedback: string;
}

export interface JDStats {
  wordCount: number;
  requiredSkillCount: number;
  niceToHaveCount: number;
  responsibilityCount: number;
}

/**
 * Main generation function
 */
export function generateJobDescription(input: JDInput): GeneratedJD {
  const title = buildTitle(input.role, input.seniority);
  const sections = buildSections(input);
  const fullText = buildFullText(title, sections);
  const qualityChecks = runQualityChecks(input, fullText, sections);
  const salaryBenchmark = buildSalaryBenchmark(input);
  const stats = calculateStats(sections);

  return {
    title,
    sections,
    fullText,
    qualityChecks,
    salaryBenchmark,
    stats,
  };
}

/**
 * Build the job title
 */
function buildTitle(role: AIMLRole, seniority: SeniorityLevel): string {
  if (seniority === 'Head of / Director' && role === 'Head of AI/ML') {
    return 'Head of AI/ML';
  }
  if (seniority === 'Head of / Director') {
    return `Head of ${role.replace('Engineer', 'Engineering')}`;
  }
  if (seniority === 'Junior') return `Junior ${role}`;
  if (seniority === 'Mid-Level') return role;
  return `${seniority} ${role}`;
}

/**
 * Build all JD sections
 */
function buildSections(input: JDInput): JDSection[] {
  const sections: JDSection[] = [];

  // About the Role
  sections.push({
    heading: 'About the Role',
    content: buildAboutSection(input),
    type: 'paragraph',
  });

  // Key Responsibilities
  sections.push({
    heading: 'Key Responsibilities',
    content: buildResponsibilities(input),
    type: 'list',
  });

  // Required Skills & Experience
  sections.push({
    heading: 'Required Skills & Experience',
    content: buildRequiredSkills(input),
    type: 'list',
  });

  // Nice-to-Have
  sections.push({
    heading: 'Nice-to-Have',
    content: buildNiceToHaves(input),
    type: 'list',
  });

  // What We Offer
  sections.push({
    heading: 'What We Offer',
    content: buildBenefits(input),
    type: 'list',
  });

  return sections;
}

/**
 * Build the "About the Role" section
 */
function buildAboutSection(input: JDInput): string {
  const exp = SENIORITY_EXPERIENCE[input.seniority];
  const companyRef = input.companyName
    ? input.companyName
    : 'our company';

  const teamLine = input.teamContext
    ? ` You'll be joining ${input.teamContext.trim().endsWith('.') ? input.teamContext.trim() : input.teamContext.trim() + '.'}`
    : '';

  const techLine =
    input.techStack.length > 0
      ? ` Our tech stack includes ${formatList(input.techStack)}.`
      : '';

  const locationLine = input.location
    ? ` This is a ${input.workArrangement.toLowerCase()} role based in ${input.location}.`
    : ` This is a ${input.workArrangement.toLowerCase()} role.`;

  const expLine =
    exp.min > 0
      ? ` We're looking for someone with ${exp.min}–${exp.max} years of relevant experience.`
      : " This is an entry-level position — we're looking for strong fundamentals and a willingness to learn.";

  return `${companyRef} is looking for a ${input.seniority === 'Mid-Level' ? '' : input.seniority.toLowerCase().replace('head of / director', 'senior leader') + ' '}${input.role} to join our team.${teamLine}${techLine}${locationLine}${expLine}`;
}

/**
 * Build responsibilities section
 */
function buildResponsibilities(input: JDInput): string {
  const baseResponsibilities = ROLE_RESPONSIBILITIES[input.role] || [];

  // Select appropriate number based on seniority
  let count = 6;
  if (input.seniority === 'Lead' || input.seniority === 'Principal') count = 7;
  if (input.seniority === 'Head of / Director') count = 8;
  if (input.seniority === 'Junior') count = 5;

  const selected = baseResponsibilities.slice(0, count);

  // Add custom responsibilities if provided
  const custom = input.customResponsibilities
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const all = [...selected, ...custom];
  return all.map((r) => `• ${r}`).join('\n');
}

/**
 * Build required skills section
 */
function buildRequiredSkills(input: JDInput): string {
  const baseSkills = ROLE_REQUIRED_SKILLS[input.role] || [];
  const exp = SENIORITY_EXPERIENCE[input.seniority];

  const skills = [...baseSkills];

  // Add experience requirement
  if (exp.min > 0) {
    skills.unshift(
      `${exp.min}+ years of experience in ${input.role.toLowerCase().includes('manager') || input.role.toLowerCase().includes('head') ? 'a relevant technical or leadership role' : 'a similar technical role'}`
    );
  }

  // Add tech stack specifics
  if (input.techStack.length > 0) {
    const frameworks = input.techStack.filter(
      (t) =>
        ['PyTorch', 'TensorFlow', 'scikit-learn', 'Keras', 'Hugging Face', 'LangChain', 'JAX', 'XGBoost'].includes(t)
    );
    const clouds = input.techStack.filter((t) =>
      ['AWS', 'Azure', 'GCP'].includes(t)
    );
    const dataTools = input.techStack.filter((t) =>
      ['Spark', 'Airflow', 'dbt', 'Databricks', 'Snowflake', 'MLflow', 'Kubeflow', 'Docker', 'Kubernetes'].includes(t)
    );

    if (frameworks.length > 0) {
      // Replace generic framework requirement with specific
      const idx = skills.findIndex((s) => /ML framework|framework/i.test(s));
      if (idx >= 0) {
        skills[idx] = `Experience with ${formatList(frameworks)}`;
      }
    }
    if (clouds.length > 0) {
      const idx = skills.findIndex((s) => /cloud platform/i.test(s));
      if (idx >= 0) {
        skills[idx] = `Experience with ${formatList(clouds)} cloud services`;
      }
    }
    if (dataTools.length > 0 && !skills.some((s) => dataTools.some((t) => s.includes(t)))) {
      skills.push(`Familiarity with ${formatList(dataTools)}`);
    }
  }

  return skills.map((s) => `• ${s}`).join('\n');
}

/**
 * Build nice-to-have section
 */
function buildNiceToHaves(input: JDInput): string {
  const baseNiceToHaves = ROLE_NICE_TO_HAVES[input.role] || [];
  return baseNiceToHaves.map((n) => `• ${n}`).join('\n');
}

/**
 * Build benefits section
 */
function buildBenefits(input: JDInput): string {
  const benefits = BENEFITS_BY_SIZE[input.companySize] || BENEFITS_BY_SIZE['Mid-size (201-1000)'];

  const items = [...benefits];

  // Add salary if provided
  if (input.salaryMin && input.salaryMax) {
    items.unshift(
      `Salary range: $${input.salaryMin.toLocaleString()} – $${input.salaryMax.toLocaleString()} + superannuation`
    );
  } else if (input.salaryMin) {
    items.unshift(
      `Salary from $${input.salaryMin.toLocaleString()} + superannuation`
    );
  }

  return items.map((b) => `• ${b}`).join('\n');
}

/**
 * Build full text for copying
 */
function buildFullText(title: string, sections: JDSection[]): string {
  let text = `# ${title}\n\n`;
  for (const section of sections) {
    text += `## ${section.heading}\n\n`;
    text += section.content + '\n\n';
  }
  return text.trim();
}

/**
 * Run quality checks on the JD
 */
function runQualityChecks(
  input: JDInput,
  fullText: string,
  sections: JDSection[]
): QualityCheck[] {
  const checks: QualityCheck[] = [];

  // 1. Bias language check
  const biasIssues = detectBias(fullText);
  if (biasIssues.length === 0) {
    checks.push({
      category: 'bias',
      status: 'pass',
      message: 'No biased or exclusionary language detected',
    });
  } else {
    for (const issue of biasIssues) {
      checks.push({
        category: 'bias',
        status: issue.severity === 'high' ? 'fail' : 'warning',
        message: `Found "${issue.original}" — ${issue.type} language`,
        suggestion: `Consider using "${issue.suggestion}" instead`,
      });
    }
  }

  // 2. Requirements count check
  const requiredSection = sections.find((s) => s.heading === 'Required Skills & Experience');
  const reqCount = requiredSection
    ? requiredSection.content.split('\n').filter((l) => l.startsWith('•')).length
    : 0;

  if (reqCount > 8) {
    checks.push({
      category: 'requirements',
      status: 'warning',
      message: `${reqCount} required skills listed — this may discourage qualified candidates`,
      suggestion:
        'Research shows >8 requirements significantly reduces applications, particularly from women and underrepresented groups. Move some to nice-to-have.',
    });
  } else if (reqCount >= 4 && reqCount <= 8) {
    checks.push({
      category: 'requirements',
      status: 'pass',
      message: `${reqCount} required skills — good balance between specificity and accessibility`,
    });
  } else if (reqCount < 4) {
    checks.push({
      category: 'requirements',
      status: 'warning',
      message: `Only ${reqCount} required skills — consider adding more to help candidates assess fit`,
    });
  }

  // 3. Salary transparency check
  if (input.salaryMin || input.salaryMax) {
    checks.push({
      category: 'salary',
      status: 'pass',
      message: 'Salary range included — listings with salary get significantly more applications',
    });
  } else {
    checks.push({
      category: 'salary',
      status: 'warning',
      message: 'No salary range included',
      suggestion:
        'Job listings with salary transparency receive up to 30% more applications. Consider adding a range.',
    });
  }

  // 4. Word count check
  const wordCount = fullText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount >= 500 && wordCount <= 800) {
    checks.push({
      category: 'structure',
      status: 'pass',
      message: `${wordCount} words — optimal length for engagement`,
    });
  } else if (wordCount < 500) {
    checks.push({
      category: 'structure',
      status: 'warning',
      message: `${wordCount} words — consider adding more detail about the role and team`,
    });
  } else {
    checks.push({
      category: 'structure',
      status: 'warning',
      message: `${wordCount} words — longer JDs see lower completion rates. Consider trimming.`,
    });
  }

  // 5. Team context check
  if (input.teamContext.trim()) {
    checks.push({
      category: 'inclusivity',
      status: 'pass',
      message: 'Team context included — helps candidates envision themselves in the role',
    });
  } else {
    checks.push({
      category: 'inclusivity',
      status: 'warning',
      message: 'No team context provided',
      suggestion:
        'Describing the team (size, what they work on, reporting line) helps candidates self-select and increases application quality.',
    });
  }

  // 6. Location and work arrangement
  if (input.location) {
    checks.push({
      category: 'structure',
      status: 'pass',
      message: `Location (${input.location}) and work arrangement (${input.workArrangement}) specified`,
    });
  }

  return checks;
}

/**
 * Detect biased language
 */
function detectBias(text: string): BiasPattern[] {
  const found: BiasPattern[] = [];
  for (const pattern of BIAS_PATTERNS) {
    if (pattern.pattern.test(text)) {
      found.push(pattern);
    }
  }
  return found;
}

/**
 * Build salary benchmark
 */
function buildSalaryBenchmark(input: JDInput): SalaryBenchmark | null {
  const roleRanges = SALARY_RANGES[input.role];
  if (!roleRanges) return null;

  const range = roleRanges[input.seniority];
  if (!range) return null;

  let competitiveness: 'below' | 'competitive' | 'above' = 'competitive';
  let feedback = '';

  if (input.salaryMin && input.salaryMax) {
    const midListed = (input.salaryMin + input.salaryMax) / 2;
    const midMarket = (range.min + range.max) / 2;

    if (midListed < midMarket * 0.85) {
      competitiveness = 'below';
      feedback = `Your listed range is below the typical Australian market rate for this role and seniority. You may struggle to attract top candidates.`;
    } else if (midListed > midMarket * 1.15) {
      competitiveness = 'above';
      feedback = `Your listed range is above the typical Australian market rate — this will attract strong candidates and reduce time-to-fill.`;
    } else {
      competitiveness = 'competitive';
      feedback = `Your listed range is competitive with the Australian market for this role and seniority.`;
    }
  } else {
    feedback = `The typical Australian market range for a ${input.seniority} ${input.role} is $${range.min.toLocaleString()} – $${range.max.toLocaleString()} + super.`;
  }

  return {
    marketMin: range.min,
    marketMax: range.max,
    listedMin: input.salaryMin,
    listedMax: input.salaryMax,
    competitiveness,
    feedback,
  };
}

/**
 * Calculate JD statistics
 */
function calculateStats(sections: JDSection[]): JDStats {
  const allText = sections.map((s) => s.content).join('\n');
  const wordCount = allText.split(/\s+/).filter((w) => w.length > 0).length;

  const countBullets = (heading: string) => {
    const section = sections.find((s) => s.heading === heading);
    return section
      ? section.content.split('\n').filter((l) => l.startsWith('•')).length
      : 0;
  };

  return {
    wordCount,
    requiredSkillCount: countBullets('Required Skills & Experience'),
    niceToHaveCount: countBullets('Nice-to-Have'),
    responsibilityCount: countBullets('Key Responsibilities'),
  };
}

/**
 * Format a list with commas and "and"
 */
function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Get quality score colour
 */
export function getQualityColor(status: 'pass' | 'warning' | 'fail'): string {
  switch (status) {
    case 'pass':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'fail':
      return 'text-red-600';
  }
}
