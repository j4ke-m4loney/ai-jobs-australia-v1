/**
 * Re-categorise legacy jobs using Claude API
 *
 * Jobs imported before the expanded 17-category system used broad legacy
 * categories ('ai', 'ml', 'research'). This script analyses each job and
 * assigns the single best-fit category from the current JOB_CATEGORIES list.
 *
 * Usage:
 *   npx tsx scripts/recategorise-legacy-jobs.ts [limit] [--commit] [--stop-on-error]
 *
 * Default is DRY RUN — prints proposed changes without updating the DB.
 * Pass --commit to actually write changes.
 *
 * Examples:
 *   npx tsx scripts/recategorise-legacy-jobs.ts 5              # Dry run on 5 jobs
 *   npx tsx scripts/recategorise-legacy-jobs.ts 5 --commit     # Update 5 jobs
 *   npx tsx scripts/recategorise-legacy-jobs.ts all --commit   # Update all legacy jobs
 *   npx tsx scripts/recategorise-legacy-jobs.ts 5 --stop-on-error
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !anthropicApiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

// The 17 valid category slugs and their labels
const CATEGORY_OPTIONS = [
  { slug: 'ai-ml-architect', label: 'AI/ML Architect' },
  { slug: 'ai-governance', label: 'AI Governance' },
  { slug: 'ai-automation', label: 'AI Automation' },
  { slug: 'analyst', label: 'Analyst' },
  { slug: 'annotation', label: 'Annotation' },
  { slug: 'computer-vision', label: 'Computer Vision' },
  { slug: 'data-engineer', label: 'Data Engineer' },
  { slug: 'data-science', label: 'Data Science' },
  { slug: 'engineering', label: 'Engineering' },
  { slug: 'infrastructure', label: 'Infrastructure' },
  { slug: 'machine-learning', label: 'Machine Learning' },
  { slug: 'marketing', label: 'Marketing' },
  { slug: 'product', label: 'Product' },
  { slug: 'quality-assurance', label: 'Quality Assurance' },
  { slug: 'sales', label: 'Sales' },
  { slug: 'software-development', label: 'Software Development' },
  { slug: 'strategy-transformation', label: 'Strategy & Transformation' },
  { slug: 'teaching-research', label: 'Teaching & Research' },
] as const;

const VALID_SLUGS = CATEGORY_OPTIONS.map(c => c.slug);

const LEGACY_CATEGORIES = ['ai', 'ml', 'research'];

// Auto-correct common near-miss slugs that Claude invents
const SLUG_ALIASES: Record<string, string> = {
  'data-analyst': 'analyst',
  'data-analytics': 'analyst',
  'data-engineering': 'data-engineer',
  'ai-safety': 'ai-governance',
  'ai-security': 'ai-governance',
  'ai-ethics': 'ai-governance',
  'qa-engineer': 'quality-assurance',
  'qa-engineering': 'quality-assurance',
  'talent-acquisition': 'product',
  'hr': 'product',
  'ai-enablement': 'strategy-transformation',
  'consulting': 'strategy-transformation',
  'devops': 'infrastructure',
  'cloud': 'infrastructure',
  'nlp': 'machine-learning',
  'deep-learning': 'machine-learning',
  'mlops': 'machine-learning',
  'research': 'teaching-research',
};

interface CategoryAnalysis {
  category: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ValidationIssue {
  jobId: string;
  jobTitle: string;
  issue: string;
  value: string | number;
  severity: 'error' | 'warning';
}

const validationIssues: ValidationIssue[] = [];

const categoryList = CATEGORY_OPTIONS.map(c => `  - "${c.slug}" → ${c.label}`).join('\n');

const SYSTEM_PROMPT = `You are an expert AI/ML job classifier for an Australian job board.

Given a job posting, you must assign it the single best-fit category from the list below.

AVAILABLE CATEGORIES:
${categoryList}

You must return a JSON object with exactly this structure:
{
  "category": "<slug from the list above>",
  "rationale": "<one short sentence, max 120 chars>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL REQUIREMENTS:
1. The "category" MUST be one of the exact slugs listed above. No other values are accepted.
2. Pick the SINGLE best-fit category. If truly ambiguous, prefer the more specific one.
3. Your rationale MUST be ONE short sentence under 120 characters. Example: "Core ML engineering role focused on model training and deployment."
4. NEVER exceed 120 characters for the rationale. Be direct.

CLASSIFICATION GUIDELINES:
- "machine-learning" → roles focused on ML model training, deployment, MLOps, feature engineering
- "ai-ml-architect" → senior/lead roles designing AI/ML systems and architecture
- "data-science" → roles focused on analysis, experimentation, statistical modelling
- "data-engineer" → roles focused on data pipelines, ETL, data infrastructure
- "teaching-research" → academic research, R&D scientists, university positions
- "ai-automation" → roles applying AI to automate business processes
- "ai-governance" → roles focused on AI ethics, responsible AI, compliance
- "computer-vision" → roles specifically about image/video processing, object detection
- "quality-assurance" → QA, testing, test automation roles for AI/ML systems
- "software-development" → general software engineering that supports AI systems
- "engineering" → broad engineering roles with AI/ML components
- "infrastructure" → cloud, DevOps, platform roles supporting AI workloads
- "analyst" → business/data analyst roles with AI/ML elements
- "product" → product management for AI/ML products
- "strategy-transformation" → AI strategy, digital transformation, consulting
- "annotation" → data labelling, annotation, quality assurance for ML
- "marketing" → AI-related marketing roles
- "sales" → AI-related sales roles

Confidence levels:
- high: Title and description clearly match one category
- medium: Good fit but could arguably be another category
- low: Genuinely ambiguous between multiple categories

Use Australian/British English spelling.`;

function cleanAndParseJSON(text: string): CategoryAnalysis {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  let jsonStr = jsonMatch[0];

  jsonStr = jsonStr
    .replace(/[\r\n]+/g, ' ')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":')
    .replace(/""+/g, '"');

  try {
    return JSON.parse(jsonStr);
  } catch {
    const categoryMatch = text.match(/category["\s:]+["']([a-z-]+)["']/i);
    const rationaleMatch = text.match(/rationale["\s:]+["']([^"']+)["']/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (categoryMatch) {
      return {
        category: categoryMatch[1].toLowerCase(),
        rationale: rationaleMatch?.[1] || 'Classification completed.',
        confidence: (confidenceMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

function isCompleteSentence(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed);
}

function validateAnalysis(
  jobId: string,
  jobTitle: string,
  analysis: CategoryAnalysis
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check category is a valid slug
  if (!VALID_SLUGS.includes(analysis.category as typeof VALID_SLUGS[number])) {
    errors.push(`Invalid category slug: "${analysis.category}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Invalid category slug',
      value: analysis.category,
      severity: 'error',
    });
  }

  // Check confidence
  if (!['high', 'medium', 'low'].includes(analysis.confidence)) {
    errors.push(`Invalid confidence: "${analysis.confidence}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Invalid confidence',
      value: analysis.confidence,
      severity: 'error',
    });
  }

  // Check rationale
  const rationaleLength = analysis.rationale?.length || 0;

  if (rationaleLength === 0) {
    errors.push('Rationale is empty');
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Empty rationale',
      value: 0,
      severity: 'error',
    });
  } else if (rationaleLength < 20) {
    warnings.push(`Rationale very short (${rationaleLength} chars)`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Rationale too short',
      value: rationaleLength,
      severity: 'warning',
    });
  }

  // Check for incomplete sentences
  if (analysis.rationale && !isCompleteSentence(analysis.rationale)) {
    errors.push(`Rationale ends mid-sentence: "...${analysis.rationale.slice(-30)}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Incomplete sentence (API truncation)',
      value: analysis.rationale.slice(-30),
      severity: 'error',
    });
  }

  return { isValid: errors.length === 0, errors, warnings };
}

async function classifyJob(
  jobId: string,
  title: string,
  description: string,
  requirements: string | null,
  currentCategory: string,
  retries = 3
): Promise<{ analysis: CategoryAnalysis; validation: ReturnType<typeof validateAnalysis> }> {
  const jobContent = `
Job Title: ${title}
Current (legacy) category: ${currentCategory}

Job Description:
${description.slice(0, 3000)}

${requirements ? `Requirements:\n${requirements.slice(0, 1000)}` : ''}
`.trim();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Classify this job posting into the single best-fit category. Return ONLY valid JSON:\n\n${jobContent}`,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      const textContent = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (!textContent) {
        throw new Error('No text content in response');
      }

      if (response.stop_reason === 'max_tokens') {
        throw new Error('Response truncated by max_tokens limit');
      }

      const result = cleanAndParseJSON(textContent.text);

      // Auto-correct near-miss slugs before validation
      if (SLUG_ALIASES[result.category]) {
        const corrected = SLUG_ALIASES[result.category];
        console.log(`    🔄 Auto-corrected slug: "${result.category}" → "${corrected}"`);
        result.category = corrected;
      }

      // Retry on incomplete sentence
      if (result.rationale && !isCompleteSentence(result.rationale)) {
        if (attempt < retries) {
          console.log(`    ⚠️ Incomplete sentence detected, retry ${attempt + 1}/${retries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }

      const validation = validateAnalysis(jobId, title, result);

      // Sanitize confidence
      if (!['high', 'medium', 'low'].includes(result.confidence)) {
        result.confidence = 'medium';
      }

      // Ensure rationale is present
      if (!result.rationale) {
        result.rationale = 'Classification completed.';
      }

      return { analysis: result, validation };
    } catch (err) {
      if (attempt < retries) {
        console.log(`    ⚠️ Retry ${attempt + 1}/${retries}: ${err instanceof Error ? err.message : err}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw err;
      }
    }
  }

  throw new Error('All retries failed');
}

async function recategoriseJobs(limit: number, commitMode: boolean, stopOnError: boolean) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🏷️  RE-CATEGORISE LEGACY JOBS`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   Mode: ${commitMode ? '✍️  COMMIT (will update DB)' : '👀 DRY RUN (no DB changes)'}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Stop on error: ${stopOnError}`);
  console.log(`   Legacy categories: ${LEGACY_CATEGORIES.join(', ')}`);
  console.log(`${'='.repeat(70)}\n`);

  // Fetch legacy-category jobs (approved only)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements, category')
    .eq('status', 'approved')
    .in('category', LEGACY_CATEGORIES)
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No legacy-category jobs found to re-categorise');
    return;
  }

  console.log(`Found ${jobs.length} legacy-category jobs to classify\n`);

  let successCount = 0;
  let failCount = 0;
  let warningCount = 0;
  const categoryBreakdown = new Map<string, number>();
  const confidenceBreakdown = new Map<string, number>();

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const progress = `[${i + 1}/${jobs.length}]`;

    try {
      console.log(`${progress} "${job.title.slice(0, 60)}" (current: ${job.category})`);

      const { analysis, validation } = await classifyJob(
        job.id,
        job.title,
        job.description,
        job.requirements,
        job.category
      );

      // Show validation issues immediately
      if (validation.errors.length > 0) {
        console.log(`   ❌ ERRORS:`);
        validation.errors.forEach(err => console.log(`      • ${err}`));
      }
      if (validation.warnings.length > 0) {
        console.log(`   ⚠️  WARNINGS:`);
        validation.warnings.forEach(warn => console.log(`      • ${warn}`));
        warningCount++;
      }

      if (!validation.isValid && stopOnError) {
        console.log(`\n🛑 STOPPING: Validation error encountered (--stop-on-error enabled)`);
        break;
      }

      // Skip DB update if category is invalid
      if (!VALID_SLUGS.includes(analysis.category as typeof VALID_SLUGS[number])) {
        console.log(`   ❌ Skipping — invalid category "${analysis.category}"`);
        failCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      console.log(`   → ${analysis.category} (${analysis.confidence} confidence)`);
      console.log(`   Rationale: ${analysis.rationale}`);

      // Track stats
      categoryBreakdown.set(analysis.category, (categoryBreakdown.get(analysis.category) || 0) + 1);
      confidenceBreakdown.set(analysis.confidence, (confidenceBreakdown.get(analysis.confidence) || 0) + 1);

      if (commitMode) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ category: analysis.category })
          .eq('id', job.id);

        if (updateError) {
          console.error(`   ❌ DB UPDATE FAILED: ${updateError.message}`);
          failCount++;
        } else {
          console.log(`   ✅ Updated in DB`);
          successCount++;
        }
      } else {
        successCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`   ❌ CLASSIFICATION FAILED:`, err instanceof Error ? err.message : err);
      failCount++;

      if (stopOnError) {
        console.log(`\n🛑 STOPPING: Classification error encountered (--stop-on-error enabled)`);
        break;
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 SUMMARY${commitMode ? '' : ' (DRY RUN — no DB changes made)'}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   ✅ Classified: ${successCount}`);
  console.log(`   ⚠️  With warnings: ${warningCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (categoryBreakdown.size > 0) {
    console.log(`\n📂 CATEGORY BREAKDOWN:`);
    const sorted = [...categoryBreakdown.entries()].sort((a, b) => b[1] - a[1]);
    sorted.forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
  }

  if (confidenceBreakdown.size > 0) {
    console.log(`\n🎯 CONFIDENCE DISTRIBUTION:`);
    ['high', 'medium', 'low'].forEach(level => {
      const count = confidenceBreakdown.get(level) || 0;
      if (count > 0) console.log(`   ${level}: ${count}`);
    });
  }

  // Detailed validation issues
  if (validationIssues.length > 0) {
    const errors = validationIssues.filter(i => i.severity === 'error');
    const warnings = validationIssues.filter(i => i.severity === 'warning');

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 VALIDATION ISSUES DETAIL`);
    console.log(`${'='.repeat(70)}`);

    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(err => {
        console.log(`   • "${err.jobTitle.slice(0, 40)}..." → ${err.issue}: ${err.value}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(warn => {
        console.log(`   • "${warn.jobTitle.slice(0, 40)}..." → ${warn.issue}: ${warn.value}`);
      });
    }

    const issueTypes = new Map<string, number>();
    validationIssues.forEach(issue => {
      const count = issueTypes.get(issue.issue) || 0;
      issueTypes.set(issue.issue, count + 1);
    });

    console.log(`\n📈 ISSUES BY TYPE:`);
    issueTypes.forEach((count, type) => {
      console.log(`   • ${type}: ${count}`);
    });
  } else {
    console.log(`\n✅ No validation issues - all responses within limits!`);
  }

  console.log(`\n${'='.repeat(70)}\n`);
}

// Parse arguments
const args = process.argv.slice(2);
const commitMode = args.includes('--commit');
const stopOnError = args.includes('--stop-on-error');
const limitArg = args.find(arg => !arg.startsWith('--'));
const limit = limitArg === 'all' || limitArg === '0' ? 1000 : (parseInt(limitArg || '10') || 10);

recategoriseJobs(limit, commitMode, stopOnError);
