import { anthropic } from '@/lib/anthropic';

export interface MatchScoreAnalysis {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  keywords_to_add: string[];
  experience_fit: 'strong' | 'moderate' | 'stretch';
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert Australian recruiter specialising in AI, ML, and data science roles. Compare the candidate's CV against the job description and provide a match assessment using the provided tool.

Scoring guidelines:
- 85-100: Exceptional match — candidate exceeds most requirements
- 70-84: Strong match — candidate meets core requirements with minor gaps
- 50-69: Moderate match — candidate has foundational skills but notable gaps
- 30-49: Weak match — significant skills gaps but some transferable experience
- 0-29: Poor match — candidate lacks most required skills

Field guidelines:
- matched_skills: Skills from the CV that directly match JD requirements (max 8)
- missing_skills: Key skills required by the JD that are absent from the CV (max 6)
- keywords_to_add: Specific terms from the JD the candidate should add to their application (max 5)
- experience_fit: "strong" = years and level align, "moderate" = close but not exact, "stretch" = would be a level-up
- summary: 150-400 chars. Personalised, actionable. Use Australian English. No filler phrases. Complete sentences only.
- confidence: "high" = clear info in both CV and JD, "medium" = some ambiguity, "low" = very limited info`;

// Tool definition for structured output
const matchScoreTool = {
  name: 'submit_match_score' as const,
  description: 'Submit the CV-to-job match score analysis results',
  input_schema: {
    type: 'object' as const,
    required: ['match_percentage', 'matched_skills', 'missing_skills', 'keywords_to_add', 'experience_fit', 'summary', 'confidence'],
    properties: {
      match_percentage: {
        type: 'number' as const,
        description: 'Match score from 0-100',
        minimum: 0,
        maximum: 100,
      },
      matched_skills: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Skills from the CV that match the JD (max 8)',
        maxItems: 8,
      },
      missing_skills: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Key skills required by the JD that are absent from the CV (max 6)',
        maxItems: 6,
      },
      keywords_to_add: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Specific terms from the JD to add to the application (max 5)',
        maxItems: 5,
      },
      experience_fit: {
        type: 'string' as const,
        enum: ['strong', 'moderate', 'stretch'],
        description: 'How well the candidate\'s experience level aligns',
      },
      summary: {
        type: 'string' as const,
        description: 'Personalised, actionable assessment (150-400 chars, Australian English)',
        maxLength: 500,
      },
      confidence: {
        type: 'string' as const,
        enum: ['high', 'medium', 'low'],
        description: 'Confidence level of the analysis',
      },
    },
  },
};

export async function analyseMatchScore(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  companyName?: string | null,
  requirements?: string | null
): Promise<MatchScoreAnalysis> {
  const jobContent = `
Job Title: ${jobTitle}
${companyName ? `Company: ${companyName}` : ''}

Job Description:
${jobDescription}

${requirements ? `Requirements:\n${requirements}` : ''}
`.trim();

  // Limit resume text to avoid token overflow (roughly 8000 chars ≈ 2000 tokens)
  const trimmedResume = resumeText.length > 8000
    ? resumeText.slice(0, 8000) + '\n[CV truncated for analysis]'
    : resumeText;

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    tools: [matchScoreTool],
    tool_choice: { type: 'tool', name: 'submit_match_score' },
    messages: [
      {
        role: 'user',
        content: `Compare this candidate's CV against the job posting and provide a match assessment.

CANDIDATE'S CV:
${trimmedResume}

JOB POSTING:
${jobContent}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract the tool use result — guaranteed structured JSON
  const toolUse = response.content.find(
    (block) => block.type === 'tool_use' && block.name === 'submit_match_score'
  );

  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('No tool use result in Anthropic response');
  }

  const result = toolUse.input as MatchScoreAnalysis;

  // Validate and sanitise
  if (typeof result.match_percentage !== 'number' || result.match_percentage < 0 || result.match_percentage > 100) {
    result.match_percentage = Math.max(0, Math.min(100, result.match_percentage || 0));
  }

  if (!Array.isArray(result.matched_skills)) result.matched_skills = [];
  if (!Array.isArray(result.missing_skills)) result.missing_skills = [];
  if (!Array.isArray(result.keywords_to_add)) result.keywords_to_add = [];

  if (!['strong', 'moderate', 'stretch'].includes(result.experience_fit)) {
    result.experience_fit = 'moderate';
  }

  if (typeof result.summary !== 'string') {
    result.summary = 'Unable to generate match summary.';
  } else if (result.summary.length > 500) {
    result.summary = result.summary.slice(0, 497).replace(/\s+\S*$/, '...');
  }

  if (!['high', 'medium', 'low'].includes(result.confidence)) {
    result.confidence = 'medium';
  }

  return result;
}
