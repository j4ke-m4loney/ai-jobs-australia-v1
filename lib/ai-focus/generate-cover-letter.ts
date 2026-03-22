import Anthropic from '@anthropic-ai/sdk';
import { anthropic } from '@/lib/anthropic';

export interface CoverLetterResult {
  cover_letter: string;
  word_count: number;
}

const SYSTEM_PROMPT = `You write cover letters that sound like they were written by a smart, articulate human — not by AI. You write for Australian job seekers across all roles: ML engineers, data scientists, AI governance, sales, analysts, product managers, and more.

Your cover letters get interviews because they are specific, concise, and read like a person talking — not a template.

STRUCTURE:

PARAGRAPH 1 — THE HOOK (2 sentences max):
Open with your single most impressive, relevant accomplishment stated as a fact. Connect it directly to what this company needs. Example: "At [Company], I built a fraud detection pipeline that reduced false positives by 35% — the kind of work that maps directly to what [Target Company] is tackling with [their product/initiative]."

PARAGRAPH 2 — THE PROOF (3-4 sentences):
Pick ONE project from the CV that is most relevant to this role. Tell the story briefly: what was the problem, what did you do, what happened as a result. Use specific numbers from the CV if available. Do not list skills — show them in action.

PARAGRAPH 3 — WHY THEM (2-3 sentences):
Name something specific about the company or role from the job description. Explain what about it connects to your own work or interests. This should feel genuine, not like flattery.

PARAGRAPH 4 — THE CLOSE (1 sentence):
One direct sentence inviting a conversation. Example: "Happy to chat more about how this experience could apply to your team."

FORMAT:
- Start with "Dear Hiring Manager,"
- End with "Regards," then "[Your Name]"
- No addresses, dates, or subject lines
- No preamble before "Dear"

VOICE AND TONE:
- Write at a Year 10 reading level. Short sentences. Active voice.
- Sound like a competent professional sending an email, not a formal decree.
- SHOW don't TELL. Never say "I am passionate" — instead describe what you built. Never say "proven track record" — instead state the track record. Never say "I am confident I can" — instead say what you will do.
- No corporate buzzwords: "leverage", "utilise", "drive impactful outcomes", "cutting-edge", "groundbreaking", "transformative", "uniquely positioned", "spearheaded", "seasoned".
- No filler transitions: "Furthermore", "Moreover", "In addition", "Additionally".
- No sycophancy: "I was thrilled", "I was elated", "incredible company".
- Do not start any sentence with "I am" more than once in the entire letter.

RULES:
- 200-300 words. Tight and punchy.
- Australian English spelling (analyse, organise, behaviour, colour, centre).
- NEVER fabricate anything not in the CV.
- Pick only 1-2 skills/projects most relevant to THIS role. Ignore the rest.
- Adapt tone: startup = casual and direct, enterprise = professional but warm, research = precise and thoughtful.
- NEVER use em dashes (—) anywhere in the letter. Use commas, full stops, or restructure the sentence instead.

Return ONLY the cover letter text.`;

export async function generateCoverLetter(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  companyName?: string | null,
  requirements?: string | null
): Promise<CoverLetterResult> {
  const jobContent = `
Job Title: ${jobTitle}
${companyName ? `Company: ${companyName}` : ''}

Job Description:
${jobDescription}

${requirements ? `Requirements:\n${requirements}` : ''}
`.trim();

  // Limit resume text to avoid token overflow
  const trimmedResume = resumeText.length > 8000
    ? resumeText.slice(0, 8000) + '\n[CV truncated]'
    : resumeText;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Write a cover letter for a wildlife biologist applying to a Conservation Programme Manager role at Reef Alliance. Their CV mentions leading a coral reef monitoring programme across 12 sites, developing an early-warning model for bleaching events that gave rangers 3 weeks' notice, and managing a team of 8 field researchers.`,
      },
      {
        role: 'assistant',
        content: `Dear Hiring Manager,

Last wet season, the early-warning model I built gave our rangers three weeks' notice before a bleaching event hit the outer reef. That extra time meant we relocated 40% of our coral nursery stock before water temperatures peaked — the kind of proactive conservation work that Reef Alliance's programme needs at scale.

I developed that model as part of a monitoring programme I ran across 12 sites on the Great Barrier Reef. The challenge was combining satellite SST data with in-water sensor readings to produce something field teams could actually act on. I managed 8 researchers across those sites, and the biggest lesson was that the science only matters if the people on the ground can use it. So I built the alert system around their existing workflow rather than asking them to learn new tools.

Reef Alliance's focus on community-led conservation is what drew me to this role. Most of my best fieldwork has happened when local rangers and Traditional Owners are leading the priorities, and your partnership model in the Torres Strait reflects that approach.

Happy to chat about how this experience could translate to your programme.

Regards,
[Your Name]`,
      },
      {
        role: 'user',
        content: `Good. Now write a cover letter for this completely different candidate and role. Use the same writing style (direct, specific, human) but draw ONLY from the CV and job posting below. Do not reuse any details from the previous example.

CANDIDATE'S CV:
${trimmedResume}

JOB POSTING:
${jobContent}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  if (response.stop_reason === 'max_tokens') {
    throw new Error('Response truncated — cover letter generation failed');
  }

  const textContent = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Anthropic response');
  }

  // Strip any preamble and clean up formatting
  let coverLetter = textContent.text.trim();

  // Remove any em dashes that slipped through
  coverLetter = coverLetter.replace(/\s*—\s*/g, ', ');
  const greetingMatch = coverLetter.match(/^([\s\S]*?)(Dear\s)/i);
  if (greetingMatch && greetingMatch.index !== undefined) {
    const preamble = greetingMatch[1].trim();
    // If there's text before "Dear" that looks like a preamble (not part of the letter), remove it
    if (preamble.length > 0 && preamble.length < 200) {
      coverLetter = coverLetter.slice(greetingMatch.index + greetingMatch[1].length).trim();
    }
  }
  const wordCount = coverLetter.split(/\s+/).length;

  return {
    cover_letter: coverLetter,
    word_count: wordCount,
  };
}
