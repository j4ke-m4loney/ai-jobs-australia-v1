import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';

export interface SkillsMatchAnalysis {
  percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert career advisor analysing how well a candidate's skills match a job posting. Use the provided tool to submit your analysis.

Scoring guidelines:
- 80-100: Excellent match - candidate has most/all required skills
- 60-79: Strong match - candidate has core skills, missing some nice-to-haves
- 40-59: Moderate match - candidate has some relevant skills but gaps exist
- 20-39: Weak match - candidate missing several key skills
- 0-19: Poor match - candidate lacks most required skills

Skill matching rules:
- Consider skill synonyms (e.g., "ML" = "Machine Learning", "JS" = "JavaScript")
- Consider related skills (e.g., "PyTorch" implies "Python" knowledge)
- Weight skills by importance - requirements mentioned first or emphasised are more critical
- Only include skills in matched_skills if the candidate actually has them
- Only include skills in missing_skills if they're clearly required by the job
- Keep matched_skills and missing_skills to the most important 3-5 skills each

Confidence levels:
- high: Clear skill requirements in job posting, easy to match
- medium: Some ambiguity in requirements or candidate skills
- low: Vague job requirements or very limited candidate skills`;

const skillsMatchTool = {
  name: 'submit_skills_match' as const,
  description: 'Submit the skills match analysis results',
  input_schema: {
    type: 'object' as const,
    required: ['percentage', 'matched_skills', 'missing_skills', 'rationale', 'confidence'],
    properties: {
      percentage: {
        type: 'number' as const,
        description: 'Match score from 0-100',
        minimum: 0,
        maximum: 100,
      },
      matched_skills: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Skills the candidate has that match the JD (max 5)',
        maxItems: 5,
      },
      missing_skills: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Key skills required by the JD that the candidate lacks (max 5)',
        maxItems: 5,
      },
      rationale: {
        type: 'string' as const,
        description: 'Short, punchy rationale (150-350 chars). Complete sentences. Australian English.',
        maxLength: 400,
      },
      confidence: {
        type: 'string' as const,
        enum: ['high', 'medium', 'low'],
        description: 'Confidence level of the analysis',
      },
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { userSkills, jobTitle, jobDescription, jobRequirements } = await request.json();

    if (!userSkills || !Array.isArray(userSkills)) {
      return NextResponse.json(
        { error: 'userSkills must be an array' },
        { status: 400 }
      );
    }

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: 'jobTitle and jobDescription are required' },
        { status: 400 }
      );
    }

    if (userSkills.length === 0) {
      return NextResponse.json({
        percentage: 0,
        matched_skills: [],
        missing_skills: [],
        rationale: 'No skills provided. Add skills to your profile to see how well you match this role.',
        confidence: 'low' as const,
      });
    }

    const jobContent = `
Job Title: ${jobTitle}

Job Description:
${jobDescription}

${jobRequirements ? `Requirements:\n${jobRequirements}` : ''}
`.trim();

    const candidateSkills = userSkills.join(', ');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      tools: [skillsMatchTool],
      tool_choice: { type: 'tool', name: 'submit_skills_match' },
      messages: [
        {
          role: 'user',
          content: `Analyse how well this candidate's skills match the job posting.

CANDIDATE'S SKILLS:
${candidateSkills}

JOB POSTING:
${jobContent}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract tool use result — guaranteed structured JSON
    const toolUse = response.content.find(
      (block) => block.type === 'tool_use' && block.name === 'submit_skills_match'
    );

    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json(
        { error: 'No structured response from analysis' },
        { status: 500 }
      );
    }

    const result = toolUse.input as SkillsMatchAnalysis;

    // Validate and sanitise
    if (typeof result.percentage !== 'number' || result.percentage < 0 || result.percentage > 100) {
      result.percentage = Math.max(0, Math.min(100, result.percentage || 0));
    }

    if (!Array.isArray(result.matched_skills)) result.matched_skills = [];
    if (!Array.isArray(result.missing_skills)) result.missing_skills = [];

    if (typeof result.rationale !== 'string') {
      result.rationale = 'Unable to generate analysis rationale.';
    } else if (result.rationale.length > 350) {
      result.rationale = result.rationale.slice(0, 347).replace(/\s+\S*$/, '...');
    }

    if (!['high', 'medium', 'low'].includes(result.confidence)) {
      result.confidence = 'medium';
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analysing skills match:', error);
    return NextResponse.json(
      { error: 'Failed to analyse skills match' },
      { status: 500 }
    );
  }
}
