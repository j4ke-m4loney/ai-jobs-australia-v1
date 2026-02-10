import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface InterviewDifficultyAnalysis {
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

export async function analyseInterviewDifficulty(
  title: string,
  description: string,
  requirements?: string | null
): Promise<InterviewDifficultyAnalysis> {
  const jobContent = `
Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements}` : ''}
`.trim();

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Analyse this job posting and predict the interview difficulty level:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as InterviewDifficultyAnalysis;

  // Validate the response
  const validLevels = ['easy', 'medium', 'hard', 'very_hard'];
  if (!validLevels.includes(result.level)) {
    result.level = 'medium';
  }

  if (typeof result.rationale !== 'string' || result.rationale.length > 350) {
    // Truncate if necessary
    result.rationale = (result.rationale || 'Analysis completed').slice(0, 350);
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
