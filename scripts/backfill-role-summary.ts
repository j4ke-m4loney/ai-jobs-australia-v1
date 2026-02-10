/**
 * Backfill Role Summary for existing jobs
 * Run with: npx tsx scripts/backfill-role-summary.ts
 * Or with a limit: npx tsx scripts/backfill-role-summary.ts 10
 * Or for all jobs: npx tsx scripts/backfill-role-summary.ts all
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

interface RoleSummaryAnalysis {
  one_liner: string;
  plain_english: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at summarising job roles in plain English for Australian job seekers.

You must return a JSON object with exactly this structure:
{
  "one_liner": "<string max 160 chars>",
  "plain_english": "<string max 500 chars>",
  "confidence": "<high|medium|low>"
}

Guidelines:
- one_liner: A catchy, clear tagline summarising the role (like a social media bio). Make it engaging and informative.
- plain_english: Explain what someone in this role actually does day-to-day, avoiding jargon. Write as if explaining to a friend who isn't in tech.

Focus on:
- Core responsibilities in simple terms
- Who they work with
- What problems they solve
- What skills are actually used

Confidence levels:
- high: Job description is clear and detailed
- medium: Some ambiguity or marketing fluff to cut through
- low: Very vague or unclear job description

Use Australian/British English spelling (analyse, optimise, organisation, etc.).`;

function cleanAndParseJSON(text: string): RoleSummaryAnalysis {
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
    const oneLinerMatch = text.match(/one_liner["\s:]+["']([^"']+)["']/i);
    const plainEnglishMatch = text.match(/plain_english["\s:]+["']([^"']+)["']/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (oneLinerMatch) {
      return {
        one_liner: oneLinerMatch[1] || 'Role summary available',
        plain_english: plainEnglishMatch?.[1] || 'Analysis completed',
        confidence: (confidenceMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

async function analyseJob(title: string, description: string, requirements?: string | null, retries = 2): Promise<RoleSummaryAnalysis> {
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
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Summarise this job posting in plain English. Return ONLY valid JSON:\n\n${jobContent}`,
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

      // Validate and sanitize - truncate at word boundaries
      result.one_liner = truncateAtWordBoundary(result.one_liner || 'Role summary available', 160);
      result.plain_english = truncateAtWordBoundary(result.plain_english || 'Analysis completed', 500);
      if (!['high', 'medium', 'low'].includes(result.confidence)) {
        result.confidence = 'medium';
      }

      return result;
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

async function backfillJobs(limit: number = 10) {
  console.log(`🚀 Starting Role Summary backfill (limit: ${limit})...\n`);

  // Fetch jobs without Role Summary data (approved and expired)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements')
    .is('role_summary_one_liner', null)
    .in('status', ['approved', 'expired'])
    .limit(limit);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No jobs need Role Summary analysis');
    return;
  }

  console.log(`Found ${jobs.length} jobs to analyse\n`);

  let successCount = 0;
  let failCount = 0;

  for (const job of jobs) {
    try {
      console.log(`Analysing: ${job.title}...`);

      const analysis = await analyseJob(job.title, job.description, job.requirements);

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          role_summary_one_liner: analysis.one_liner,
          role_summary_plain_english: analysis.plain_english,
          role_summary_confidence: analysis.confidence,
          role_summary_analysed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`  ✅ ${analysis.confidence} confidence - ${analysis.one_liner.slice(0, 60)}...`);
        successCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`  ❌ Analysis failed:`, err);
      failCount++;
    }
  }

  console.log(`\n🎉 Backfill complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

// Run with optional limit argument (0 or 'all' = no limit)
const limitArg = process.argv[2];
const limit = limitArg === 'all' || limitArg === '0' ? 1000 : (parseInt(limitArg) || 10);
backfillJobs(limit);
