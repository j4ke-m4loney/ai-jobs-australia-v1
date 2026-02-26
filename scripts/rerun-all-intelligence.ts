/**
 * Re-run ALL AJA Intelligence analyses for existing jobs
 * This script re-analyses jobs that already have data (to fix truncation issues)
 *
 * Run with: npx tsx scripts/rerun-all-intelligence.ts
 * Or with a limit: npx tsx scripts/rerun-all-intelligence.ts 10
 * Or for all jobs: npx tsx scripts/rerun-all-intelligence.ts all
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import { truncateAtWordBoundary } from "./utils/truncate";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !anthropicApiKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

// ============ ANALYSIS TYPES ============

interface RoleSummaryAnalysis {
  one_liner: string;
  plain_english: string;
  confidence: "high" | "medium" | "low";
}

interface AIFocusAnalysis {
  percentage: number;
  rationale: string;
  confidence: "high" | "medium" | "low";
}

interface InterviewDifficultyAnalysis {
  level: "easy" | "medium" | "hard" | "very_hard";
  rationale: string;
  confidence: "high" | "medium" | "low";
}

interface WhoForAnalysis {
  bullets: string[];
  confidence: "high" | "medium" | "low";
}

interface AutonomyVsProcessAnalysis {
  autonomy_level: "low" | "medium" | "high";
  process_load: "low" | "medium" | "high";
  rationale: string;
  confidence: "high" | "medium" | "low";
}

interface PromotionLikelihoodAnalysis {
  signal: "low" | "medium" | "high";
  rationale: string;
  confidence: "high" | "medium" | "low";
}

// ============ SYSTEM PROMPTS ============

const ROLE_SUMMARY_PROMPT = `You are an expert at summarising job roles in plain English for Australian job seekers.

Return a JSON object with this EXACT structure:
{
  "one_liner": "<string>",
  "plain_english": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL CHARACTER LIMITS - be concise:
- one_liner: MUST be under 200 characters.
- plain_english: MUST be under 700 characters.

Guidelines:
- one_liner: A catchy tagline summarising the role.
- plain_english: Explain what someone in this role does day-to-day, in simple terms.

Use Australian/British English spelling.`;

const AI_FOCUS_PROMPT = `You are an expert AI/ML job analyst. Analyse job postings to determine how AI/ML-focused the role is.

Return a JSON object with this EXACT structure:
{
  "percentage": <number 0-100>,
  "rationale": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Your rationale MUST be under 700 characters. This is a hard limit - be concise.

Scoring:
- 80-100: Core AI/ML role (ML Engineer, Data Scientist, AI Researcher)
- 60-79: Strong AI/ML component
- 40-59: Moderate AI/ML elements
- 20-39: Light AI/ML touch
- 0-19: Minimal/no AI/ML focus

Briefly explain your score. Be concise - mention only the most important AI/ML technologies or responsibilities.

Use Australian/British English spelling.`;

const INTERVIEW_DIFFICULTY_PROMPT = `You are an expert at predicting interview difficulty based on job postings.

Return a JSON object with this EXACT structure:
{
  "level": "<easy|medium|hard|very_hard>",
  "rationale": "<string>",
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Your rationale MUST be under 700 characters. This is a hard limit - be concise.

Difficulty levels:
- easy: Entry-level/junior roles, basic skills, 1-2 casual interviews
- medium: Mid-level roles, solid technical foundation, 2-3 interview rounds
- hard: Senior roles, deep expertise, coding challenges, system design, 3-4 rounds
- very_hard: Staff/Principal/Director+, world-class talent bar, 5+ rounds

Briefly explain your prediction. Be concise - mention only the key factors.

Use Australian/British English spelling.`;

const WHO_FOR_PROMPT = `You are an expert at identifying ideal candidates for job roles.

Return a JSON object with this EXACT structure:
{
  "bullets": ["<string>", "<string>", "<string>"],
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Each bullet MUST be under 120 characters. Keep them short and punchy.
Exactly 3 bullets required.

Example good bullets (under 120 chars):
- "Senior engineers wanting hands-on technical work over management"
- "Data scientists ready to move into production engineering"

Use Australian/British English spelling.`;

const WHO_NOT_FOR_PROMPT = `You are an expert at identifying who should NOT apply for a job role.

Return a JSON object with this EXACT structure:
{
  "bullets": ["<string>", "<string>", "<string>"],
  "confidence": "<high|medium|low>"
}

⚠️ CRITICAL: Each bullet MUST be under 120 characters. Keep them short and punchy.
Exactly 3 bullets required.

Example good bullets (under 120 chars):
- "Those seeking work-life balance - expect long hours during launches"
- "Engineers preferring stable, well-documented codebases"

Use Australian/British English spelling.`;

const AUTONOMY_VS_PROCESS_PROMPT = `You are an expert at analysing job postings to determine the autonomy vs process balance of a role. This helps "builders" understand how much independence they'll have vs bureaucratic overhead.

Return a JSON object with this EXACT structure:
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

const PROMOTION_LIKELIHOOD_PROMPT = `You are an expert at analysing job postings to assess the likelihood of career progression and promotion opportunities.

Return a JSON object with this EXACT structure:
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

Keep the rationale concise, highlighting the key progression signals (or lack thereof) found in the posting.

Use Australian/British English spelling.`;

// ============ TRACKING ============

// Track all truncation errors so we can report at the end
const truncationErrors: {
  jobTitle: string;
  field: string;
  length: number;
  limit: number;
}[] = [];

// ============ HELPER FUNCTIONS ============

/**
 * Validates text length - logs ERROR if exceeded (should not happen with good prompts)
 */
function validateAndTruncate(
  text: string,
  maxLength: number,
  fieldName: string,
  jobTitle: string,
): string {
  if (!text) return "";

  if (text.length > maxLength) {
    console.error(
      `    ❌ ERROR: ${fieldName} exceeded limit (${text.length}/${maxLength} chars)`,
    );
    truncationErrors.push({
      jobTitle,
      field: fieldName,
      length: text.length,
      limit: maxLength,
    });
    return truncateAtWordBoundary(text, maxLength);
  }

  return text;
}

/**
 * Validates array items - logs ERROR if any exceeded (should not happen with good prompts)
 */
function validateAndTruncateArray(
  items: string[],
  maxLength: number,
  fieldName: string,
  jobTitle: string,
): string[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .slice(0, 3)
    .map((item, index) => {
      if (item && item.length > maxLength) {
        console.error(
          `    ❌ ERROR: ${fieldName}[${index}] exceeded limit (${item.length}/${maxLength} chars)`,
        );
        truncationErrors.push({
          jobTitle,
          field: `${fieldName}[${index}]`,
          length: item.length,
          limit: maxLength,
        });
        return truncateAtWordBoundary(item, maxLength);
      }
      return item || "";
    })
    .filter((item) => item.length > 0);
}

function cleanAndParseJSON<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  let jsonStr = jsonMatch[0];
  jsonStr = jsonStr
    .replace(/[\r\n]+/g, " ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  // Try parsing as-is first
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Strip control characters and curly/smart quotes, then retry
    const sanitised = jsonStr
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .replace(/\t/g, " ")
      .replace(/[\u201C\u201D]/g, '\\"')
      .replace(/[\u2018\u2019]/g, "'");

    return JSON.parse(sanitised);
  }
}

async function analyseWithRetry<T>(
  jobContent: string,
  systemPrompt: string,
  userPrompt: string,
  retries = 2,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{ role: "user", content: `${userPrompt}\n\n${jobContent}` }],
        system: systemPrompt,
      });

      const textContent = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );

      if (!textContent) {
        throw new Error("No text content in response");
      }

      return cleanAndParseJSON<T>(textContent.text);
    } catch (err) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw err;
      }
    }
  }
  throw new Error("All retries failed");
}

// ============ MAIN FUNCTION ============

async function rerunAllIntelligence(limit: number = 10) {
  console.log(
    `🚀 Re-running ALL AJA Intelligence analyses (limit: ${limit})...\n`,
  );

  // Fetch approved jobs that are MISSING any intelligence data
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, description, requirements")
    .eq("status", "approved")
    .or(
      "role_summary_one_liner.is.null,ai_focus_percentage.is.null,interview_difficulty_level.is.null,who_role_is_for_bullets.is.null,who_role_is_not_for_bullets.is.null,autonomy_level.is.null,promotion_likelihood_signal.is.null",
    )
    .limit(limit);

  if (error) {
    console.error("Error fetching jobs:", error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log("✅ No jobs found to re-analyse");
    return;
  }

  console.log(`Found ${jobs.length} jobs to re-analyse\n`);

  let successCount = 0;
  let failCount = 0;

  for (const job of jobs) {
    try {
      console.log(`\n📊 Analysing: ${job.title}...`);

      const jobContent = `
Job Title: ${job.title}

Job Description:
${job.description.slice(0, 3000)}

${job.requirements ? `Requirements:\n${job.requirements.slice(0, 1000)}` : ""}
`.trim();

      // Run all analyses in parallel - use allSettled so partial results are saved
      const analysisNames = [
        "roleSummary",
        "aiFocus",
        "interviewDifficulty",
        "whoFor",
        "whoNotFor",
        "autonomyVsProcess",
        "promotionLikelihood",
      ];
      const results = await Promise.allSettled([
        analyseWithRetry<RoleSummaryAnalysis>(
          jobContent,
          ROLE_SUMMARY_PROMPT,
          "Summarise this job posting in plain English. Return ONLY valid JSON:",
        ),
        analyseWithRetry<AIFocusAnalysis>(
          jobContent,
          AI_FOCUS_PROMPT,
          "Analyse this job posting and determine its AI/ML focus level. Return ONLY valid JSON:",
        ),
        analyseWithRetry<InterviewDifficultyAnalysis>(
          jobContent,
          INTERVIEW_DIFFICULTY_PROMPT,
          "Analyse this job posting and predict the interview difficulty level. Return ONLY valid JSON:",
        ),
        analyseWithRetry<WhoForAnalysis>(
          jobContent,
          WHO_FOR_PROMPT,
          "Analyse this job posting and identify who would be ideal for this role. Return ONLY valid JSON:",
        ),
        analyseWithRetry<WhoForAnalysis>(
          jobContent,
          WHO_NOT_FOR_PROMPT,
          "Analyse this job posting and identify who should NOT apply for this role. Return ONLY valid JSON:",
        ),
        analyseWithRetry<AutonomyVsProcessAnalysis>(
          jobContent,
          AUTONOMY_VS_PROCESS_PROMPT,
          "Analyse this job posting to determine the autonomy vs process balance. Return ONLY valid JSON:",
        ),
        analyseWithRetry<PromotionLikelihoodAnalysis>(
          jobContent,
          PROMOTION_LIKELIHOOD_PROMPT,
          "Analyse this job posting to assess the promotion/career progression likelihood. Return ONLY valid JSON:",
        ),
      ]);

      // Extract results, logging failures but continuing with partial data
      const getValue = <T>(index: number): T | null => {
        const result = results[index];
        if (result.status === "fulfilled") return result.value as T;
        console.error(
          `    ⚠️ ${analysisNames[index]} failed: ${result.reason?.message || result.reason}`,
        );
        return null;
      };

      const roleSummary = getValue<RoleSummaryAnalysis>(0);
      const aiFocus = getValue<AIFocusAnalysis>(1);
      const interviewDifficulty = getValue<InterviewDifficultyAnalysis>(2);
      const whoFor = getValue<WhoForAnalysis>(3);
      const whoNotFor = getValue<WhoForAnalysis>(4);
      const autonomyVsProcess = getValue<AutonomyVsProcessAnalysis>(5);
      const promotionLikelihood = getValue<PromotionLikelihoodAnalysis>(6);

      const failedCount = results.filter((r) => r.status === "rejected").length;
      const succeededCount = results.length - failedCount;

      if (succeededCount === 0) {
        console.error(`  ❌ All 7 analyses failed - skipping job`);
        failCount++;
        continue;
      }

      // Build update data only for successful analyses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {};

      if (roleSummary) {
        updateData.role_summary_one_liner = validateAndTruncate(
          roleSummary.one_liner || "Role summary available",
          300,
          "one_liner",
          job.title,
        );
        updateData.role_summary_plain_english = validateAndTruncate(
          roleSummary.plain_english || "Analysis completed",
          1000,
          "plain_english",
          job.title,
        );
        updateData.role_summary_confidence = roleSummary.confidence || "medium";
        updateData.role_summary_analysed_at = new Date().toISOString();
      }

      if (aiFocus) {
        updateData.ai_focus_percentage = Math.max(
          0,
          Math.min(100, Math.round(aiFocus.percentage)),
        );
        updateData.ai_focus_rationale = validateAndTruncate(
          aiFocus.rationale || "Analysis completed",
          1000,
          "ai_focus_rationale",
          job.title,
        );
        updateData.ai_focus_confidence = aiFocus.confidence || "medium";
        updateData.ai_focus_analysed_at = new Date().toISOString();
      }

      if (interviewDifficulty) {
        updateData.interview_difficulty_level = [
          "easy",
          "medium",
          "hard",
          "very_hard",
        ].includes(interviewDifficulty.level)
          ? interviewDifficulty.level
          : "medium";
        updateData.interview_difficulty_rationale = validateAndTruncate(
          interviewDifficulty.rationale || "Analysis completed",
          1000,
          "interview_rationale",
          job.title,
        );
        updateData.interview_difficulty_confidence =
          interviewDifficulty.confidence || "medium";
        updateData.interview_difficulty_analysed_at = new Date().toISOString();
      }

      if (whoFor) {
        updateData.who_role_is_for_bullets = validateAndTruncateArray(
          whoFor.bullets || [],
          250,
          "who_for_bullets",
          job.title,
        );
        updateData.who_role_is_for_confidence = whoFor.confidence || "medium";
        updateData.who_role_is_for_analysed_at = new Date().toISOString();
      }

      if (whoNotFor) {
        updateData.who_role_is_not_for_bullets = validateAndTruncateArray(
          whoNotFor.bullets || [],
          250,
          "who_not_for_bullets",
          job.title,
        );
        updateData.who_role_is_not_for_confidence =
          whoNotFor.confidence || "medium";
        updateData.who_role_is_not_for_analysed_at = new Date().toISOString();
      }

      if (autonomyVsProcess) {
        updateData.autonomy_level = ["low", "medium", "high"].includes(
          autonomyVsProcess.autonomy_level,
        )
          ? autonomyVsProcess.autonomy_level
          : "medium";
        updateData.process_load = ["low", "medium", "high"].includes(
          autonomyVsProcess.process_load,
        )
          ? autonomyVsProcess.process_load
          : "medium";
        updateData.autonomy_vs_process_rationale = validateAndTruncate(
          autonomyVsProcess.rationale || "Analysis completed",
          1000,
          "autonomy_vs_process_rationale",
          job.title,
        );
        updateData.autonomy_vs_process_confidence =
          autonomyVsProcess.confidence || "medium";
        updateData.autonomy_vs_process_analysed_at = new Date().toISOString();
      }

      if (promotionLikelihood) {
        updateData.promotion_likelihood_signal = [
          "low",
          "medium",
          "high",
        ].includes(promotionLikelihood.signal)
          ? promotionLikelihood.signal
          : "medium";
        updateData.promotion_likelihood_rationale = validateAndTruncate(
          promotionLikelihood.rationale || "Analysis completed",
          1000,
          "promotion_likelihood_rationale",
          job.title,
        );
        updateData.promotion_likelihood_confidence =
          promotionLikelihood.confidence || "medium";
        updateData.promotion_likelihood_analysed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", job.id);

      if (updateError) {
        console.error(`  ❌ Failed to update: ${updateError.message}`);
        failCount++;
      } else if (failedCount > 0) {
        console.log(
          `  ⚠️ ${succeededCount}/7 analyses saved (${failedCount} failed - will retry on next run)`,
        );
        if (updateData.role_summary_one_liner)
          console.log(
            `     📝 Role: ${updateData.role_summary_one_liner.slice(0, 50)}...`,
          );
        if (updateData.ai_focus_percentage != null)
          console.log(`     🎯 AI Focus: ${updateData.ai_focus_percentage}%`);
        if (updateData.interview_difficulty_level)
          console.log(
            `     📋 Interview: ${updateData.interview_difficulty_level}`,
          );
        if (updateData.autonomy_level)
          console.log(
            `     🎯 Autonomy: ${updateData.autonomy_level}, Process: ${updateData.process_load}`,
          );
        if (updateData.promotion_likelihood_signal)
          console.log(
            `     📈 Promotion: ${updateData.promotion_likelihood_signal}`,
          );
        successCount++;
      } else {
        console.log(`  ✅ All 7 analyses complete`);
        console.log(
          `     📝 Role: ${updateData.role_summary_one_liner.slice(0, 50)}...`,
        );
        console.log(`     🎯 AI Focus: ${updateData.ai_focus_percentage}%`);
        console.log(
          `     📋 Interview: ${updateData.interview_difficulty_level}`,
        );
        console.log(
          `     🎯 Autonomy: ${updateData.autonomy_level}, Process: ${updateData.process_load}`,
        );
        console.log(
          `     📈 Promotion: ${updateData.promotion_likelihood_signal}`,
        );
        successCount++;
      }

      // Small delay to avoid rate limiting (7 API calls per job)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`  ❌ Analysis failed:`, err);
      failCount++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎉 Re-analysis complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  // Report truncation errors
  if (truncationErrors.length > 0) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `⚠️  TRUNCATION ERRORS: ${truncationErrors.length} fields exceeded limits`,
    );
    console.log(
      `   These fields had text cut off (prompts need adjustment):\n`,
    );

    truncationErrors.forEach((err) => {
      console.log(
        `   • "${err.jobTitle.slice(0, 40)}..." → ${err.field}: ${err.length}/${err.limit} chars`,
      );
    });

    console.log(
      `\n   Action: Review prompts to ensure Claude stays within limits.`,
    );
  } else {
    console.log(`\n   ✅ No truncation errors - all text within limits!`);
  }
}

// Run with optional limit argument (default: all jobs)
const limitArg = process.argv[2];
const limit = limitArg && limitArg !== "all" ? parseInt(limitArg) || 10000 : 10000;
rerunAllIntelligence(limit);
