import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface DiscoveredJob {
  title: string;
  url: string;
  confidence: 'high' | 'medium' | 'low';
}

const IDENTIFY_JOBS_TOOL: Anthropic.Messages.Tool = {
  name: 'report_ai_jobs',
  description:
    'Report AI/ML/Data Science job listings found on a career page.',
  input_schema: {
    type: 'object' as const,
    properties: {
      jobs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The job title as shown on the page',
            },
            url: {
              type: 'string',
              description:
                'The full URL to the individual job listing. Must be an absolute URL.',
            },
            confidence: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description:
                'How confident you are this is an AI/ML/Data Science role',
            },
          },
          required: ['title', 'url', 'confidence'],
        },
        description:
          'List of AI/ML/Data Science job listings found. Empty array if none found.',
      },
    },
    required: ['jobs'],
  },
};

const SYSTEM_PROMPT = `You are an expert at identifying AI, Machine Learning, and Data Science job listings on career pages for an AUSTRALIAN job board.

Given career page content, identify job listings that have any meaningful AI/ML component AND are located in Australia.

LOCATION FILTER (strict):
- ONLY include jobs based in Australia. Look for Australian cities/states: Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Hobart, Darwin, NSW, VIC, QLD, WA, SA, ACT, TAS, NT.
- Skip ALL jobs in other countries. If no location is mentioned, skip the job.

AI/ML RELEVANCE:
- Think about what percentage of the role involves AI/ML work (building models, working with ML systems, data science, NLP, computer vision, LLMs, etc.)
- Include the role if you estimate it has 30% or more AI/ML focus
- This means roles that partially involve AI/ML should still be included — they don't need to be pure AI roles
- Use your judgement based on the job title and any visible description
- "Research" in consulting, market research, or insights contexts is NOT AI research. AI research means ML/deep learning/AI systems research.
- When in doubt, leave it out — false negatives are better than false positives

Confidence levels:
- "high": 60%+ AI/ML focus, confirmed Australian location
- "medium": 30-60% AI/ML focus, or Australian location is probable but not confirmed
- "low": Under 30% AI/ML focus — do NOT include these

Rules:
- Only return jobs with FULL absolute URLs (not relative paths)
- If a URL is relative (e.g. /careers/job/123), construct the full URL using the base domain
- Return an empty array if no relevant Australian jobs are found`;

/**
 * Use Claude Haiku to identify AI/ML job listings on a career page.
 */
export async function identifyAIJobs(
  pageContent: string,
  pageUrl: string,
  searchKeywords: string
): Promise<DiscoveredJob[]> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    tools: [IDENTIFY_JOBS_TOOL],
    tool_choice: { type: 'tool', name: 'report_ai_jobs' },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Career page URL: ${pageUrl}
Search keywords: ${searchKeywords}

Career page content:
${pageContent}`,
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === 'tool_use'
  );

  if (!toolUseBlock) {
    console.error('No tool use response from Claude for job identification');
    return [];
  }

  const result = toolUseBlock.input as { jobs: DiscoveredJob[] };
  return result.jobs || [];
}
