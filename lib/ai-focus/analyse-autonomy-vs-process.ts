import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface AutonomyVsProcessAnalysis {
  autonomy_level: 'low' | 'medium' | 'high';
  process_load: 'low' | 'medium' | 'high';
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert at analysing job postings to determine the autonomy vs process balance of a role. This helps "builders" understand how much independence they'll have vs bureaucratic overhead.

You must return a JSON object with exactly this structure:
{
  "autonomy_level": "<low|medium|high>",
  "process_load": "<low|medium|high>",
  "rationale": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Your rationale MUST be under 700 characters. This is a hard limit - be concise.

AUTONOMY SIGNALS (indicators of independence and ownership):
- "Define", "Own", "Decide", "Lead", "Drive"
- "Build", "Create", "Shape", "Architect", "Pioneer"
- "End-to-end ownership", "Technical decision-maker"
- "Self-directed", "Entrepreneurial"
- Small team size, startup environment
- Direct access to stakeholders/customers

PROCESS SIGNALS (indicators of bureaucracy and oversight):
- "Align", "Report", "Governance", "Compliance"
- "Stakeholder management", "Approval process", "Committee"
- "Documentation requirements", "Sign-off", "Review cycles"
- "Cross-functional alignment", "Change management"
- Large enterprise, regulated industry
- Multiple reporting lines, matrix organisation

SCORING GUIDELINES:
- Score both dimensions INDEPENDENTLY (high autonomy can still have high process)
- High autonomy: Role owns decisions, builds things end-to-end, minimal oversight
- Medium autonomy: Some ownership but within defined boundaries
- Low autonomy: Mostly executing others' decisions, heavy oversight
- High process: Lots of governance, approvals, documentation, stakeholders
- Medium process: Standard corporate processes, some flexibility
- Low process: Minimal bureaucracy, ship fast, iterate quickly

Confidence levels:
- high: Clear signals in job posting about working style
- medium: Some indicators but not definitive
- low: Limited information about work environment

Keep the rationale concise, highlighting the key signals found in the posting.

Use Australian/British English spelling.`;

export async function analyseAutonomyVsProcess(
  title: string,
  description: string,
  requirements?: string | null
): Promise<AutonomyVsProcessAnalysis> {
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
        content: `Analyse this job posting to determine the autonomy vs process balance. Return ONLY valid JSON:\n\n${jobContent}`,
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

  const result = JSON.parse(jsonMatch[0]) as AutonomyVsProcessAnalysis;

  // Validate the response
  const validLevels = ['low', 'medium', 'high'];
  if (!validLevels.includes(result.autonomy_level)) {
    result.autonomy_level = 'medium';
  }
  if (!validLevels.includes(result.process_load)) {
    result.process_load = 'medium';
  }

  // Validate rationale length - log warning if exceeded
  if (result.rationale && result.rationale.length > 700) {
    console.error(`⚠️ Rationale exceeded 700 chars (${result.rationale.length})`);
  }

  if (typeof result.rationale !== 'string' || result.rationale.length > 1000) {
    // Truncate if necessary (DB allows 1000, so we have buffer)
    result.rationale = (result.rationale || 'Analysis completed').slice(0, 1000);
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
