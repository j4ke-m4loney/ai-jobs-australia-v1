import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import Anthropic from '@anthropic-ai/sdk';

export interface SkillsMatchAnalysis {
  percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert career advisor analysing how well a candidate's skills match a job posting.

You must return a JSON object with exactly this structure:
{
  "percentage": <number 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "rationale": "<string 150-350 chars>",
  "confidence": "<high|medium|low>"
}

CRITICAL REQUIREMENTS:
1. Your rationale MUST be between 150-350 characters. Keep it SHORT and PUNCHY.
2. ALWAYS write complete sentences. Never end mid-thought.
3. Get to the point immediately - no filler phrases.

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

Confidence levels:
- high: Clear skill requirements in job posting, easy to match
- medium: Some ambiguity in requirements or candidate skills
- low: Vague job requirements or very limited candidate skills

Keep matched_skills and missing_skills to the most important 3-5 skills each.`;

export async function POST(request: NextRequest) {
  try {
    const { userSkills, jobTitle, jobDescription, jobRequirements } = await request.json();

    // Validate input
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

    // If user has no skills, return a specific response
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

    // Check for truncation
    if (response.stop_reason === 'max_tokens') {
      console.error('Response truncated by max_tokens limit');
      return NextResponse.json(
        { error: 'Analysis response was truncated' },
        { status: 500 }
      );
    }

    // Extract the text content from the response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text content in response' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from response:', textContent.text);
      return NextResponse.json(
        { error: 'Could not parse analysis response' },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]) as SkillsMatchAnalysis;

    // Validate and sanitise the response
    if (
      typeof result.percentage !== 'number' ||
      result.percentage < 0 ||
      result.percentage > 100
    ) {
      result.percentage = Math.max(0, Math.min(100, result.percentage || 0));
    }

    if (!Array.isArray(result.matched_skills)) {
      result.matched_skills = [];
    }

    if (!Array.isArray(result.missing_skills)) {
      result.missing_skills = [];
    }

    if (typeof result.rationale !== 'string') {
      result.rationale = 'Unable to generate analysis rationale.';
    } else if (result.rationale.length > 350) {
      // Truncate at word boundary
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
