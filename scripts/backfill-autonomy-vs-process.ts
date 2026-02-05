/**
 * Backfill Autonomy vs Process scores for existing jobs
 * Run with: npx tsx scripts/backfill-autonomy-vs-process.ts
 * Or with a limit: npx tsx scripts/backfill-autonomy-vs-process.ts 10
 * Or for all jobs: npx tsx scripts/backfill-autonomy-vs-process.ts all
 *
 * Add --stop-on-error to halt on first validation error
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { truncateAtWordBoundary } from './utils/truncate';

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

// Configuration
const RATIONALE_SOFT_LIMIT = 700;  // Warn if exceeded (prompt asks for this)
const RATIONALE_HARD_LIMIT = 1000; // DB limit - will truncate
const RATIONALE_MIN_LENGTH = 50;   // Warn if too short (likely bad response)

interface AutonomyVsProcessAnalysis {
  autonomy_level: 'low' | 'medium' | 'high';
  process_load: 'low' | 'medium' | 'high';
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

// Track all validation issues
interface ValidationIssue {
  jobId: string;
  jobTitle: string;
  issue: string;
  value: string | number;
  severity: 'error' | 'warning';
}

const validationIssues: ValidationIssue[] = [];

const SYSTEM_PROMPT = `You are an expert at analysing job postings to determine the autonomy vs process balance of a role. This helps "builders" understand how much independence they'll have vs bureaucratic overhead.

You must return a JSON object with exactly this structure:
{
  "autonomy_level": "<low|medium|high>",
  "process_load": "<low|medium|high>",
  "rationale": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Your rationale MUST be between 100-700 characters. This is a hard limit.
- Too short = not useful
- Too long = will be truncated

AUTONOMY SIGNALS (indicators of independence and ownership):
- "Define", "Own", "Decide", "Lead", "Drive"
- "Build", "Create", "Shape", "Architect", "Pioneer"
- "End-to-end ownership", "Technical decision-maker"
- "Self-directed", "Entrepreneurial"
- Small team size, startup environment
- Direct access to stakeholders/customers

PROCESS SIGNALS (indicators of bureaucracy and oversight):
- "Align", "Report", "Governance", "Compliance"
- "Stakeholder management", "Approval process", "Committee"
- "Documentation requirements", "Sign-off", "Review cycles"
- "Cross-functional alignment", "Change management"
- Large enterprise, regulated industry
- Multiple reporting lines, matrix organisation

SCORING GUIDELINES:
- Score both dimensions INDEPENDENTLY (high autonomy can still have high process)
- High autonomy: Role owns decisions, builds things end-to-end, minimal oversight
- Medium autonomy: Some ownership but within defined boundaries
- Low autonomy: Mostly executing others' decisions, heavy oversight
- High process: Lots of governance, approvals, documentation, stakeholders
- Medium process: Standard corporate processes, some flexibility
- Low process: Minimal bureaucracy, ship fast, iterate quickly

Confidence levels:
- high: Clear signals in job posting about working style
- medium: Some indicators but not definitive
- low: Limited information about work environment

Keep the rationale concise but informative, highlighting the key signals found in the posting.

Use Australian/British English spelling.`;

function cleanAndParseJSON(text: string): AutonomyVsProcessAnalysis {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  let jsonStr = jsonMatch[0];

  // Clean up common issues
  jsonStr = jsonStr
    .replace(/[\r\n]+/g, ' ')  // Remove newlines
    .replace(/,\s*}/g, '}')     // Remove trailing commas
    .replace(/,\s*]/g, ']')     // Remove trailing commas in arrays
    .replace(/'/g, '"')         // Replace single quotes with double quotes
    .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
    .replace(/""+/g, '"');      // Fix double quotes

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try a more aggressive cleanup - extract values manually
    const autonomyMatch = text.match(/autonomy_level["\s:]+["']?(low|medium|high)["']?/i);
    const processMatch = text.match(/process_load["\s:]+["']?(low|medium|high)["']?/i);
    const rationaleMatch = text.match(/rationale["\s:]+["']([^"']+)["']/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (autonomyMatch && processMatch) {
      return {
        autonomy_level: autonomyMatch[1].toLowerCase() as 'low' | 'medium' | 'high',
        process_load: processMatch[1].toLowerCase() as 'low' | 'medium' | 'high',
        rationale: rationaleMatch?.[1] || 'Analysis completed',
        confidence: (confidenceMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

function validateAnalysis(
  jobId: string,
  jobTitle: string,
  analysis: AutonomyVsProcessAnalysis
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check autonomy_level
  const validLevels = ['low', 'medium', 'high'];
  if (!validLevels.includes(analysis.autonomy_level)) {
    errors.push(`Invalid autonomy_level: "${analysis.autonomy_level}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Invalid autonomy_level',
      value: analysis.autonomy_level,
      severity: 'error',
    });
  }

  // Check process_load
  if (!validLevels.includes(analysis.process_load)) {
    errors.push(`Invalid process_load: "${analysis.process_load}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Invalid process_load',
      value: analysis.process_load,
      severity: 'error',
    });
  }

  // Check confidence
  const validConfidence = ['high', 'medium', 'low'];
  if (!validConfidence.includes(analysis.confidence)) {
    errors.push(`Invalid confidence: "${analysis.confidence}"`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Invalid confidence',
      value: analysis.confidence,
      severity: 'error',
    });
  }

  // Check rationale length
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
  } else if (rationaleLength < RATIONALE_MIN_LENGTH) {
    warnings.push(`Rationale too short (${rationaleLength} chars) - may be low quality`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Rationale too short',
      value: rationaleLength,
      severity: 'warning',
    });
  } else if (rationaleLength > RATIONALE_HARD_LIMIT) {
    errors.push(`Rationale exceeds DB limit (${rationaleLength}/${RATIONALE_HARD_LIMIT} chars) - WILL BE TRUNCATED`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Rationale exceeds DB limit',
      value: rationaleLength,
      severity: 'error',
    });
  } else if (rationaleLength > RATIONALE_SOFT_LIMIT) {
    warnings.push(`Rationale exceeds soft limit (${rationaleLength}/${RATIONALE_SOFT_LIMIT} chars)`);
    validationIssues.push({
      jobId,
      jobTitle,
      issue: 'Rationale exceeds soft limit',
      value: rationaleLength,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

async function analyseJob(
  jobId: string,
  title: string,
  description: string,
  requirements?: string | null,
  retries = 2
): Promise<{ analysis: AutonomyVsProcessAnalysis; validation: ReturnType<typeof validateAnalysis> }> {
  const jobContent = `
Job Title: ${title}

Job Description:
${description.slice(0, 3000)}

${requirements ? `Requirements:\n${requirements.slice(0, 1000)}` : ''}
`.trim();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 512, // Increased to avoid cutoff
        messages: [
          {
            role: 'user',
            content: `Analyse this job posting to determine the autonomy vs process balance. Return ONLY valid JSON:\n\n${jobContent}`,
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

      const result = cleanAndParseJSON(textContent.text);

      // Validate BEFORE any modifications
      const validation = validateAnalysis(jobId, title, result);

      // Sanitize values (but validation already recorded issues)
      const validLevels = ['low', 'medium', 'high'];
      if (!validLevels.includes(result.autonomy_level)) {
        result.autonomy_level = 'medium';
      }
      if (!validLevels.includes(result.process_load)) {
        result.process_load = 'medium';
      }
      if (!['high', 'medium', 'low'].includes(result.confidence)) {
        result.confidence = 'medium';
      }

      // Truncate rationale if needed (but we've already logged the issue)
      if (result.rationale && result.rationale.length > RATIONALE_HARD_LIMIT) {
        result.rationale = truncateAtWordBoundary(result.rationale, RATIONALE_HARD_LIMIT);
      } else if (!result.rationale) {
        result.rationale = 'Analysis completed';
      }

      return { analysis: result, validation };
    } catch (err) {
      if (attempt < retries) {
        console.log(`    ⚠️ Retry ${attempt + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw err;
      }
    }
  }

  throw new Error('All retries failed');
}

async function backfillJobs(limit: number = 10, stopOnError: boolean = false) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 AUTONOMY VS PROCESS BACKFILL`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Stop on error: ${stopOnError}`);
  console.log(`   Soft limit: ${RATIONALE_SOFT_LIMIT} chars`);
  console.log(`   Hard limit: ${RATIONALE_HARD_LIMIT} chars`);
  console.log(`   Min length: ${RATIONALE_MIN_LENGTH} chars`);
  console.log(`${'='.repeat(70)}\n`);

  // Fetch jobs without Autonomy vs Process data (approved only)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements')
    .is('autonomy_level', null)
    .eq('status', 'approved')
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No jobs need Autonomy vs Process analysis');
    return;
  }

  console.log(`Found ${jobs.length} jobs to analyse\n`);

  let successCount = 0;
  let failCount = 0;
  let warningCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const progress = `[${i + 1}/${jobs.length}]`;

    try {
      console.log(`${progress} Analysing: ${job.title.slice(0, 50)}...`);

      const { analysis, validation } = await analyseJob(
        job.id,
        job.title,
        job.description,
        job.requirements
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

      // Stop if there are errors and stopOnError is true
      if (!validation.isValid && stopOnError) {
        console.log(`\n🛑 STOPPING: Validation error encountered (--stop-on-error enabled)`);
        break;
      }

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          autonomy_level: analysis.autonomy_level,
          process_load: analysis.process_load,
          autonomy_vs_process_rationale: analysis.rationale,
          autonomy_vs_process_confidence: analysis.confidence,
          autonomy_vs_process_analysed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`   ❌ DB UPDATE FAILED: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`   ✅ Autonomy: ${analysis.autonomy_level.toUpperCase()}, Process: ${analysis.process_load.toUpperCase()} (${analysis.confidence})`);
        console.log(`   📝 Rationale (${analysis.rationale.length} chars): "${analysis.rationale.slice(0, 80)}..."`);
        successCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`   ❌ ANALYSIS FAILED:`, err instanceof Error ? err.message : err);
      failCount++;

      if (stopOnError) {
        console.log(`\n🛑 STOPPING: Analysis error encountered (--stop-on-error enabled)`);
        break;
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 BACKFILL SUMMARY`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  With warnings: ${warningCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  // Detailed validation issues report
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

    // Group by issue type
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
const stopOnError = args.includes('--stop-on-error');
const limitArg = args.find(arg => !arg.startsWith('--'));
const limit = limitArg === 'all' || limitArg === '0' ? 1000 : (parseInt(limitArg || '10') || 10);

backfillJobs(limit, stopOnError);
