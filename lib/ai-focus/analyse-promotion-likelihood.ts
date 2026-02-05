import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface PromotionLikelihoodAnalysis {
  signal: 'low' | 'medium' | 'high';
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at analysing job postings to assess the likelihood of career progression and promotion opportunities.

You must return a JSON object with exactly this structure:
{
  "signal": "<low|medium|high>",
  "rationale": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL REQUIREMENTS:
1. Your rationale MUST be between 150-350 characters. Keep it SHORT and PUNCHY.
2. ALWAYS write complete sentences. Never end mid-thought.
3. Get to the point immediately - no filler phrases like "This job posting indicates..."

HIGH PROMOTION LIKELIHOOD SIGNALS:
- "Growth opportunities", "career progression", "leadership pipeline"
- "Fast-growing company", "rapidly expanding", "scaling team"
- "New team", "greenfield", "building from scratch"
- "Mentorship", "professional development", "training budget"
- "Clear promotion path", "internal mobility", "career ladder"
- Startup/scale-up environment
- "Hypergrowth", "Series A/B/C", "recently funded"
- Small team with ambitious plans
- "Path to lead", "grow into management"

MEDIUM PROMOTION LIKELIHOOD SIGNALS:
- Standard corporate progression expectations
- "Development opportunities" mentioned briefly
- Mid-sized company with some growth
- Role has natural progression (Junior → Mid → Senior)
- Learning budget but no explicit promotion path

LOW PROMOTION LIKELIHOOD SIGNALS:
- "Mature team", "stable environment", "well-established"
- "Maintain existing systems", "support role"
- "Flat structure", "small company" (limited upward mobility)
- No mention of growth or progression anywhere
- "Contractor", "fixed-term", "contract role"
- Large enterprise with slow promotion cycles
- Role described as terminal/standalone
- "Specialist" with no management track

SCORING GUIDELINES:
- Score HIGH if multiple explicit growth/progression signals
- Score MEDIUM if some development opportunities but no clear path
- Score LOW if no growth signals or explicit stability focus
- Consider company stage (startup vs enterprise)
- Factor in role level - senior/staff roles have less upward mobility by nature
- Be conservative if signals are mixed or unclear

Confidence levels:
- high: Clear, explicit career progression language in the posting
- medium: Some growth indicators but not definitive
- low: Limited information about advancement opportunities

Keep the rationale concise but informative, highlighting the key progression signals (or lack thereof) found in the posting.

Use Australian/British English spelling.`;

export async function analysePromotionLikelihood(
  title: string,
  description: string,
  requirements?: string | null
): Promise<PromotionLikelihoodAnalysis> {
  const jobContent = `
Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements}` : ''}
`.trim();

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyse this job posting to assess the promotion/career progression likelihood. Return ONLY valid JSON:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as PromotionLikelihoodAnalysis;

  // Validate the response
  const validSignals = ['low', 'medium', 'high'];
  if (!validSignals.includes(result.signal)) {
    result.signal = 'medium';
  }

  if (typeof result.rationale !== 'string' || result.rationale.length > 1000) {
    // Truncate if necessary (should not happen with good prompts)
    result.rationale = result.rationale?.slice(0, 1000) || 'Analysis completed';
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
