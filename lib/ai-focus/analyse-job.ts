import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface AIFocusAnalysis {
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

export async function analyseJobAIFocus(
  title: string,
  description: string,
  requirements?: string | null
): Promise<AIFocusAnalysis> {
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
        content: `Analyse this job posting and determine its AI/ML focus level:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as AIFocusAnalysis;

  // Validate the response
  if (
    typeof result.percentage !== 'number' ||
    result.percentage < 0 ||
    result.percentage > 100
  ) {
    throw new Error('Invalid percentage in AI Focus analysis');
  }

  if (typeof result.rationale !== 'string' || result.rationale.length > 350) {
    // Truncate if necessary
    result.rationale = result.rationale.slice(0, 350);
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
