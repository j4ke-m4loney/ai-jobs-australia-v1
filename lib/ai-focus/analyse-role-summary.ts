import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface RoleSummaryAnalysis {
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

export async function analyseRoleSummary(
  title: string,
  description: string,
  requirements?: string | null
): Promise<RoleSummaryAnalysis> {
  const jobContent = `
Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements}` : ''}
`.trim();

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Summarise this job posting in plain English:\n\n${jobContent}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract the text content from the response
  const textContent = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Anthropic response');
  }

  // Parse the JSON response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Anthropic response');
  }

  const result = JSON.parse(jsonMatch[0]) as RoleSummaryAnalysis;

  // Validate and sanitize the response
  if (typeof result.one_liner !== 'string' || result.one_liner.length > 160) {
    result.one_liner = (result.one_liner || '').slice(0, 160);
  }

  if (typeof result.plain_english !== 'string' || result.plain_english.length > 500) {
    result.plain_english = (result.plain_english || '').slice(0, 500);
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
