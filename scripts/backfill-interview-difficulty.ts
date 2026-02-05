/**
 * Backfill Interview Difficulty scores for existing jobs
 * Run with: npx tsx scripts/backfill-interview-difficulty.ts
 * Or with a limit: npx tsx scripts/backfill-interview-difficulty.ts 10
 * Or for all jobs: npx tsx scripts/backfill-interview-difficulty.ts all
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

interface InterviewDifficultyAnalysis {
  level: 'easy' | 'medium' | 'hard' | 'very_hard';
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at predicting interview difficulty based on job postings.

You must return a JSON object with exactly this structure:
{
  "level": "<easy|medium|hard|very_hard>",
  "rationale": "<string max 350 chars>",
  "confidence": "<high|medium|low>"
}

Difficulty guidelines:
- easy: Entry-level/junior roles, basic skills, likely 1-2 casual interviews
- medium: Mid-level roles, solid technical foundation, 2-3 interview rounds
- hard: Senior roles, deep expertise required, coding challenges, system design, 3-4 rounds
- very_hard: Staff/Principal/Director+, world-class talent bar, extensive process (5+ rounds), FAANG-level rigour

Factors to consider:
- Job title and seniority level
- Required years of experience
- Technical depth and breadth required
- Company reputation (if identifiable)
- Specific mentions of interview process
- Rare or specialised skills required
- Leadership/architecture responsibilities

Confidence levels:
- high: Clear indicators of seniority and requirements in job posting
- medium: Some ambiguity about role level or interview process
- low: Very limited information or unclear requirements

Keep the rationale concise and factual, focusing on the key difficulty indicators found in the posting.`;

function cleanAndParseJSON(text: string): InterviewDifficultyAnalysis {
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
    const levelMatch = text.match(/level["\s:]+["']?(easy|medium|hard|very_hard)["']?/i);
    const rationaleMatch = text.match(/rationale["\s:]+["']([^"']+)["']/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (levelMatch) {
      return {
        level: levelMatch[1].toLowerCase() as 'easy' | 'medium' | 'hard' | 'very_hard',
        rationale: rationaleMatch?.[1] || 'Analysis completed',
        confidence: (confidenceMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

async function analyseJob(title: string, description: string, requirements?: string | null, retries = 2): Promise<InterviewDifficultyAnalysis> {
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
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Analyse this job posting and predict the interview difficulty level. Return ONLY valid JSON:\n\n${jobContent}`,
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
      const validLevels = ['easy', 'medium', 'hard', 'very_hard'];
      if (!validLevels.includes(result.level)) {
        result.level = 'medium';
      }
      result.rationale = truncateAtWordBoundary(result.rationale || 'Analysis completed', 350);
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
  console.log(`🚀 Starting Interview Difficulty backfill (limit: ${limit})...\n`);

  // Fetch jobs without Interview Difficulty data (approved and expired)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements')
    .is('interview_difficulty_level', null)
    .in('status', ['approved', 'expired'])
    .limit(limit);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No jobs need Interview Difficulty analysis');
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
          interview_difficulty_level: analysis.level,
          interview_difficulty_rationale: analysis.rationale,
          interview_difficulty_confidence: analysis.confidence,
          interview_difficulty_analysed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`  ✅ ${analysis.level} (${analysis.confidence}) - ${analysis.rationale.slice(0, 60)}...`);
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
