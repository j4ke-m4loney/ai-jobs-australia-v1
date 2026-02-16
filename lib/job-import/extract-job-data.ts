import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';
import { VALID_CATEGORY_SLUGS } from './categories';

export interface ExtractedJobData {
  // Job Basics
  jobTitle: string;
  locationAddress: string;
  locationType: 'in-person' | 'fully-remote' | 'hybrid' | 'on-the-road';

  // Job Details
  jobTypes: string[];

  // Pay
  payType: 'fixed' | 'range' | 'maximum' | 'minimum' | null;
  payRangeMin: number | null;
  payRangeMax: number | null;
  payAmount: number | null;
  payPeriod: 'hour' | 'day' | 'week' | 'month' | 'year' | null;
  salaryIsEstimated: boolean;

  // Highlights (max 80 chars each, no emojis, no em dashes)
  highlight1: string; // Main function/s of the job
  highlight2: string; // Years of experience (use + not "plus", - not "to")
  highlight3: string; // Skills needed

  // Describe Job
  jobDescription: string;
  requirements: string;

  // Application Settings
  applicationMethod: 'external' | 'email';
  applicationUrl: string;
  applicationEmail: string;

  // Company Info
  companyName: string;
  companyWebsite: string;

  // Admin suggestions
  category: string;
  aiFocusPercentage: number;
}

const MAX_TEXT_LENGTH = 15000;

/**
 * Direct fetch + cheerio extraction. Returns extracted text (may be empty/short).
 */
async function directFetch(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(url, {
    method: 'GET',
    signal: controller.signal,
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, header, footer, iframe, noscript, svg, form, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  // Try to get the main content area first
  let text = '';
  const mainSelectors = ['main', '[role="main"]', 'article', '.job-description', '.job-details', '#job-content'];
  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 200) {
      text = el.text();
      break;
    }
  }

  // Fallback to body
  if (!text) {
    text = $('body').text();
  }

  // Clean up whitespace: collapse multiple spaces/newlines
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Truncate to limit
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return text;
}

/**
 * Strip markdown formatting to produce clean plain text for Claude to process.
 */
function stripMarkdown(md: string): string {
  return md
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove code fences
    .replace(/```[\s\S]*?```/g, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove list markers but keep text
    .replace(/^[\s]*[-*+]\s+/gm, '- ')
    .replace(/^[\s]*\d+\.\s+/gm, '');
}

/**
 * Fallback fetch using Jina Reader API for JS-rendered pages.
 */
async function jinaFetch(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(`https://r.jina.ai/${url}`, {
    method: 'GET',
    signal: controller.signal,
    headers: {
      Accept: 'text/plain',
    },
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Jina Reader failed: HTTP ${response.status}`);
  }

  const raw = await response.text();
  let text = stripMarkdown(raw);
  text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return text;
}

/**
 * Fetch a URL and extract the main text content.
 * Tries direct fetch + cheerio first, falls back to Jina Reader for JS-rendered sites.
 */
export async function fetchAndExtractText(url: string): Promise<string> {
  // Try direct fetch + cheerio first
  try {
    const text = await directFetch(url);
    if (text.length >= 50) return text;
  } catch {
    // Fall through to Jina fallback
  }

  // Fallback: use Jina Reader for JS-rendered sites
  const text = await jinaFetch(url);

  if (text.length < 50) {
    throw new Error(
      'Could not extract meaningful text from the page. The site may block automated requests.'
    );
  }

  return text;
}

const SYSTEM_PROMPT = `You are an expert job listing data extractor for an Australian AI jobs board. Extract structured data from job listing text by calling the extract_job_data tool.

Field guidelines:
- jobTitle: The job title
- locationAddress: Format as 'Suburb/City, STATE' using the most specific location (e.g. Parramatta, NSW NOT Sydney, NSW). Multiple locations joined with ' | '. Standard abbreviations: NSW, VIC, QLD, WA, SA, TAS, ACT, NT. Use 'Australia' if unknown.
- locationType: 'in-person', 'fully-remote', 'hybrid', or 'on-the-road'
- jobTypes: Array of 'full-time', 'part-time', 'permanent', 'fixed-term', 'contract', 'casual', 'internship', 'graduate'
- payType: Always provide — use 'range' when estimating
- payRangeMin/payRangeMax: Annual AUD salary bounds
- payPeriod: 'year', 'hour', 'day', or null
- salaryIsEstimated: true if you estimated the salary, false if explicitly stated
- highlight1: Max 80 chars — main function/s of the job. No emojis, no em dashes.
- highlight2: Max 80 chars — years of experience. Use + not 'plus', - not 'to' (e.g. '5+ years ML experience').
- highlight3: Max 80 chars — key skills. No emojis, no em dashes.
- jobDescription: Extract using EXACT original text, word for word. Do NOT rewrite, paraphrase, or summarise. Skip scraped navigation/headers/footers. Wrap in clean HTML (<p>, <ul>, <li>, <strong>).
- requirements: Extract using EXACT original text. Wrap in HTML. Empty string if already in jobDescription.
- applicationUrl: Application URL if found, or empty string
- applicationEmail: Application email if found, or empty string
- companyName: The hiring company name
- companyWebsite: Company website URL if found, or empty string
- category: Best match from: ai-ml-architect, ai-governance, analyst, annotation, computer-vision, data-engineer, data-science, engineering, infrastructure, marketing, machine-learning, product, sales, software-development, teaching-research, strategy-transformation, ai-automation
- aiFocusPercentage: 0-100 how AI/ML focused this role is

IMPORTANT RULES:
- For salary: convert to annual AUD if given in other periods. If salary is NOT mentioned, estimate a realistic range based on role, seniority, experience, and Australian market rates. Set payType to "range" and salaryIsEstimated to true. NEVER leave all salary fields null.
- For jobDescription and requirements: use the EXACT words from the original listing. Do NOT rewrite, paraphrase, or summarise. Identify relevant content, skip website chrome/navigation, and wrap in HTML tags.
- If the role is remote-eligible or mentions "work from home", set locationType to "fully-remote" or "hybrid" as appropriate.`;

const EXTRACT_JOB_TOOL: Anthropic.Messages.Tool = {
  name: 'extract_job_data',
  description: 'Submit extracted job listing data.',
  input_schema: {
    type: 'object' as const,
    properties: {
      jobTitle: { type: 'string' },
      locationAddress: { type: 'string' },
      locationType: { type: 'string', enum: ['in-person', 'fully-remote', 'hybrid', 'on-the-road'] },
      jobTypes: { type: 'array', items: { type: 'string' } },
      payType: { type: 'string' },
      payRangeMin: { type: 'number' },
      payRangeMax: { type: 'number' },
      payAmount: { type: 'number' },
      payPeriod: { type: 'string' },
      salaryIsEstimated: { type: 'boolean' },
      highlight1: { type: 'string' },
      highlight2: { type: 'string' },
      highlight3: { type: 'string' },
      jobDescription: { type: 'string' },
      requirements: { type: 'string' },
      applicationMethod: { type: 'string', enum: ['external', 'email'] },
      applicationUrl: { type: 'string' },
      applicationEmail: { type: 'string' },
      companyName: { type: 'string' },
      companyWebsite: { type: 'string' },
      category: { type: 'string' },
      aiFocusPercentage: { type: 'number' },
    },
    required: [
      'jobTitle', 'locationAddress', 'locationType', 'jobTypes',
      'salaryIsEstimated', 'highlight1', 'highlight2', 'highlight3',
      'jobDescription', 'requirements', 'applicationMethod',
      'applicationUrl', 'applicationEmail', 'companyName', 'companyWebsite',
      'category', 'aiFocusPercentage',
    ],
  },
};

/**
 * Extract structured job data from text using Claude.
 */
export async function extractJobData(
  text: string,
  sourceUrl?: string
): Promise<ExtractedJobData> {
  const userMessage = sourceUrl
    ? `Extract job listing data from this page content (source: ${sourceUrl}):\n\n${text}`
    : `Extract job listing data from this text:\n\n${text}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    tools: [EXTRACT_JOB_TOOL],
    tool_choice: { type: 'tool', name: 'extract_job_data' },
    messages: [{ role: 'user', content: userMessage }],
    system: SYSTEM_PROMPT,
  });

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
  );
  if (!toolUseBlock) {
    throw new Error('No tool use response from Claude');
  }

  const raw = toolUseBlock.input as Record<string, unknown>;

  // Validate and sanitise
  const result: ExtractedJobData = {
    jobTitle: String(raw.jobTitle || '').trim(),
    locationAddress: String(raw.locationAddress || 'Australia').trim(),
    locationType: ['in-person', 'fully-remote', 'hybrid', 'on-the-road'].includes(String(raw.locationType))
      ? (raw.locationType as ExtractedJobData['locationType'])
      : 'in-person',
    jobTypes: Array.isArray(raw.jobTypes) && raw.jobTypes.length > 0
      ? raw.jobTypes.slice(0, 4)
      : ['full-time'],
    payType: ['fixed', 'range', 'maximum', 'minimum'].includes(String(raw.payType))
      ? (raw.payType as ExtractedJobData['payType'])
      : null,
    payRangeMin: typeof raw.payRangeMin === 'number' ? raw.payRangeMin : null,
    payRangeMax: typeof raw.payRangeMax === 'number' ? raw.payRangeMax : null,
    payAmount: typeof raw.payAmount === 'number' ? raw.payAmount : null,
    payPeriod: ['hour', 'day', 'week', 'month', 'year'].includes(String(raw.payPeriod))
      ? (raw.payPeriod as ExtractedJobData['payPeriod'])
      : null,
    salaryIsEstimated: Boolean(raw.salaryIsEstimated),
    highlight1: String(raw.highlight1 || '').slice(0, 80).trim(),
    highlight2: String(raw.highlight2 || '').slice(0, 80).trim(),
    highlight3: String(raw.highlight3 || '').slice(0, 80).trim(),
    jobDescription: String(raw.jobDescription || ''),
    requirements: String(raw.requirements || ''),
    applicationMethod: raw.applicationMethod === 'email' ? 'email' : 'external',
    applicationUrl: String(raw.applicationUrl || '').trim(),
    applicationEmail: String(raw.applicationEmail || '').trim(),
    companyName: String(raw.companyName || '').trim(),
    companyWebsite: String(raw.companyWebsite || '').trim(),
    category: (VALID_CATEGORY_SLUGS as readonly string[]).includes(String(raw.category)) ? String(raw.category) : 'machine-learning',
    aiFocusPercentage: typeof raw.aiFocusPercentage === 'number'
      ? Math.max(0, Math.min(100, Math.round(raw.aiFocusPercentage)))
      : 50,
  };

  // Safety net: ensure salary is never null — use a conservative default if Claude failed to estimate
  if (result.payType === null && result.payRangeMin === null && result.payRangeMax === null && result.payAmount === null) {
    result.payType = 'range';
    result.payRangeMin = 60000;
    result.payRangeMax = 90000;
    result.payPeriod = 'year';
    result.salaryIsEstimated = true;
  }

  if (!result.jobTitle) {
    throw new Error('Could not extract a job title from the content');
  }

  return result;
}
