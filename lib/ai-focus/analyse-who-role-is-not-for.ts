import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface WhoRoleIsNotForAnalysis {
  bullets: string[];
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at identifying who should NOT apply for a job role. Your goal is to help job seekers quickly self-select OUT if the role isn't right for them.

You must return a JSON object with exactly this structure:
{
  "bullets": ["<string max 140 chars>", "<string max 140 chars>", "<string max 140 chars>"],
  "confidence": "<high|medium|low>"
}

Guidelines:
- Write exactly 3 bullet points describing WHO should NOT apply for this role
- Each bullet should help someone self-assess: "Should I skip this role?"
- Be honest but not discouraging - frame as "mismatch" not "failure"
- Focus on work style mismatches, career stage misalignment, or expectation gaps
- Warn about demanding aspects, culture mismatches, or skill gaps that would cause struggle

Examples of good bullets:
- "Those seeking work-life balance - expect 50+ hour weeks during product launches"
- "Engineers preferring stable, established codebases with clear documentation"
- "People uncomfortable with ambiguity and frequent pivots in direction"
- "Those wanting pure research roles - this is heavily applied/production-focused"
- "Candidates expecting mentorship - this is a solo contributor role"

Confidence levels:
- high: Job description clearly indicates potential mismatches
- medium: Some ambiguity but reasonable inferences can be made
- low: Very vague job description, hard to determine red flags

Use Australian/British English spelling (analyse, optimise, organisation, etc.).`;

export async function analyseWhoRoleIsNotFor(
  title: string,
  description: string,
  requirements?: string | null
): Promise<WhoRoleIsNotForAnalysis> {
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
        content: `Analyse this job posting and identify who should NOT apply for this role:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as WhoRoleIsNotForAnalysis;

  // Validate and sanitise the response
  if (!Array.isArray(result.bullets)) {
    result.bullets = [];
  }

  // Ensure we have exactly 3 bullets, truncated to 140 chars each
  result.bullets = result.bullets.slice(0, 3).map(bullet =>
    typeof bullet === 'string' ? bullet.slice(0, 140) : ''
  );

  // Pad with empty strings if we don't have 3 bullets
  while (result.bullets.length < 3) {
    result.bullets.push('');
  }

  // Filter out empty bullets
  result.bullets = result.bullets.filter(b => b.length > 0);

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
