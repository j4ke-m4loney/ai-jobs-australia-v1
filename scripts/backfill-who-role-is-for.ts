/**
 * Backfill Who Role Is For for existing jobs
 * Run with: npx tsx scripts/backfill-who-role-is-for.ts
 * Or with a limit: npx tsx scripts/backfill-who-role-is-for.ts 10
 * Or for all jobs: npx tsx scripts/backfill-who-role-is-for.ts all
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { truncateAtWordBoundary, truncateArrayItems } from './utils/truncate';

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

interface WhoRoleIsForAnalysis {
  bullets: string[];
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at identifying ideal candidates for job roles. Your goal is to help job seekers quickly self-assess if a role is right for them.

You must return a JSON object with exactly this structure:
{
  "bullets": ["<string max 140 chars>", "<string max 140 chars>", "<string max 140 chars>"],
  "confidence": "<high|medium|low>"
}

Guidelines:
- Write exactly 3 bullet points describing WHO would be ideal for this role
- Each bullet should help someone self-assess: "Is this role for me?"
- Be specific about experience level, background, mindset, and career stage
- Focus on the type of person who would thrive, not just meet minimum requirements
- Write in a positive, encouraging tone

Examples of good bullets:
- "Senior engineers wanting hands-on technical work over people management"
- "Career changers with strong analytical skills and eagerness to learn ML"
- "Data scientists ready to move into production engineering"
- "Graduates passionate about AI who want mentorship and growth"
- "Experienced professionals comfortable with ambiguity and fast-paced environments"

Confidence levels:
- high: Job description clearly indicates the ideal candidate profile
- medium: Some ambiguity but reasonable inferences can be made
- low: Very vague job description, hard to determine ideal fit

Use Australian/British English spelling (analyse, optimise, organisation, etc.).`;

function cleanAndParseJSON(text: string): WhoRoleIsForAnalysis {
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
    const bulletsMatch = text.match(/bullets["\s:]+\[([\s\S]*?)\]/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (bulletsMatch) {
      // Extract bullet strings from the array
      const bulletStrings = bulletsMatch[1].match(/"([^"]+)"/g) || [];
      const bullets = bulletStrings.map(s => truncateAtWordBoundary(s.replace(/"/g, ''), 140));

      return {
        bullets: bullets.slice(0, 3),
        confidence: (confidenceMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

async function analyseJob(title: string, description: string, requirements?: string | null, retries = 2): Promise<WhoRoleIsForAnalysis> {
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
            content: `Analyse this job posting and identify who would be ideal for this role. Return ONLY valid JSON:\n\n${jobContent}`,
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

      // Validate and sanitise - truncate at word boundaries
      if (!Array.isArray(result.bullets)) {
        result.bullets = [];
      }
      result.bullets = truncateArrayItems(result.bullets, 140, 3);

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
  console.log(`🚀 Starting Who Role Is For backfill (limit: ${limit})...\n`);

  // Fetch jobs without Who Role Is For data (approved and expired)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements')
    .is('who_role_is_for_bullets', null)
    .in('status', ['approved', 'expired'])
    .limit(limit);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No jobs need Who Role Is For analysis');
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
          who_role_is_for_bullets: analysis.bullets,
          who_role_is_for_confidence: analysis.confidence,
          who_role_is_for_analysed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`  ✅ ${analysis.confidence} confidence - ${analysis.bullets.length} bullets`);
        if (analysis.bullets[0]) {
          console.log(`     • ${analysis.bullets[0].slice(0, 60)}...`);
        }
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
