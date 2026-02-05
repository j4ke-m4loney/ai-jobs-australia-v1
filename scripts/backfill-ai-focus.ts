/**
 * Backfill AI Focus scores for existing jobs
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-ai-focus.ts
 * Or: npx tsx scripts/backfill-ai-focus.ts
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

interface AIFocusAnalysis {
  percentage: number;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert AI/ML job analyst. Your task is to analyse job postings and determine how AI/ML-focused the role is.

You must return a JSON object with exactly this structure:
{
  "percentage": <number 0-100>,
  "rationale": "<string max 350 chars>",
  "confidence": "<high|medium|low>"
}

Scoring guidelines:
- 80-100: Core AI/ML role (ML Engineer, Data Scientist, AI Researcher, etc.)
- 60-79: Strong AI/ML component (roles that heavily use or develop AI/ML)
- 40-59: Moderate AI/ML elements (roles with some AI/ML responsibilities)
- 20-39: Light AI/ML touch (roles that interact with AI/ML occasionally)
- 0-19: Minimal/no AI/ML focus (traditional tech roles with no AI component)

Confidence levels:
- high: Clear indicators in title and description
- medium: Some ambiguity or limited information
- low: Very limited information or unclear requirements

Keep the rationale concise and factual, focusing on specific AI/ML technologies, responsibilities, or skills mentioned.`;

function cleanAndParseJSON(text: string): AIFocusAnalysis {
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
    const percentageMatch = text.match(/percentage["\s:]+(\d+)/i);
    const rationaleMatch = text.match(/rationale["\s:]+["']([^"']+)["']/i);
    const confidenceMatch = text.match(/confidence["\s:]+["']?(high|medium|low)["']?/i);

    if (percentageMatch) {
      return {
        percentage: parseInt(percentageMatch[1]),
        rationale: rationaleMatch?.[1] || 'Analysis completed',
        confidence: (confidenceMatch?.[1] as 'high' | 'medium' | 'low') || 'medium',
      };
    }

    throw new Error('Could not parse JSON from response');
  }
}

async function analyseJob(title: string, description: string, requirements?: string | null, retries = 2): Promise<AIFocusAnalysis> {
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
            content: `Analyse this job posting and determine its AI/ML focus level. Return ONLY valid JSON:\n\n${jobContent}`,
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
      result.percentage = Math.max(0, Math.min(100, Math.round(result.percentage)));
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
  console.log(`🚀 Starting AI Focus backfill (limit: ${limit})...\n`);

  // Fetch jobs without AI Focus data (approved and expired)
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, description, requirements')
    .is('ai_focus_percentage', null)
    .in('status', ['approved', 'expired'])
    .limit(limit);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('✅ No jobs need AI Focus analysis');
    return;
  }

  console.log(`Found ${jobs.length} jobs to analyse\n`);

  for (const job of jobs) {
    try {
      console.log(`Analysing: ${job.title}...`);

      const analysis = await analyseJob(job.title, job.description, job.requirements);

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          ai_focus_percentage: analysis.percentage,
          ai_focus_rationale: analysis.rationale,
          ai_focus_confidence: analysis.confidence,
          ai_focus_analysed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
      } else {
        console.log(`  ✅ ${analysis.percentage}% (${analysis.confidence}) - ${analysis.rationale.slice(0, 60)}...`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`  ❌ Analysis failed:`, err);
    }
  }

  console.log('\n🎉 Backfill complete!');
}

// Run with optional limit argument (0 or 'all' = no limit)
const limitArg = process.argv[2];
const limit = limitArg === 'all' || limitArg === '0' ? 1000 : (parseInt(limitArg) || 10);
backfillJobs(limit);
