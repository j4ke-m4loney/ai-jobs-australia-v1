import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface WhoRoleIsForAnalysis {
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

export async function analyseWhoRoleIsFor(
  title: string,
  description: string,
  requirements?: string | null
): Promise<WhoRoleIsForAnalysis> {
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
        content: `Analyse this job posting and identify who would be ideal for this role:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as WhoRoleIsForAnalysis;

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
