import { createClient } from '@supabase/supabase-js';
import { analyseJobAIFocus } from './analyse-job';
import { analyseInterviewDifficulty } from './analyse-interview-difficulty';
import { analyseRoleSummary } from './analyse-role-summary';
import { analyseWhoRoleIsFor } from './analyse-who-role-is-for';
import { analyseWhoRoleIsNotFor } from './analyse-who-role-is-not-for';
import { analyseAutonomyVsProcess } from './analyse-autonomy-vs-process';
import { analysePromotionLikelihood } from './analyse-promotion-likelihood';

// Helper function to create Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Triggers all 7 AJA Intelligence analyses for a job posting.
 * This should be called asynchronously after job approval.
 * Failures are logged but don't affect the approval flow.
 */
export async function triggerJobAnalysis(
  jobId: string,
  title: string,
  description: string,
  requirements?: string | null
): Promise<void> {
  try {
    console.log(`🤖 Starting job analysis for job ${jobId}`);

    // Run all 7 analyses in parallel
    const [
      aiFocusResult,
      interviewDifficultyResult,
      roleSummaryResult,
      whoRoleIsForResult,
      whoRoleIsNotForResult,
      autonomyVsProcessResult,
      promotionLikelihoodResult,
    ] = await Promise.allSettled([
      analyseJobAIFocus(title, description, requirements),
      analyseInterviewDifficulty(title, description, requirements),
      analyseRoleSummary(title, description, requirements),
      analyseWhoRoleIsFor(title, description, requirements),
      analyseWhoRoleIsNotFor(title, description, requirements),
      analyseAutonomyVsProcess(title, description, requirements),
      analysePromotionLikelihood(title, description, requirements),
    ]);

    // Build the update object based on successful results
    const updateData: Record<string, unknown> = {};

    if (aiFocusResult.status === 'fulfilled') {
      const analysis = aiFocusResult.value;
      updateData.ai_focus_percentage = analysis.percentage;
      updateData.ai_focus_rationale = analysis.rationale;
      updateData.ai_focus_confidence = analysis.confidence;
      updateData.ai_focus_analysed_at = new Date().toISOString();
      console.log(
        `✅ AI Focus analysis complete for job ${jobId}: ${analysis.percentage}% (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ AI Focus analysis failed for job ${jobId}:`, aiFocusResult.reason);
    }

    if (interviewDifficultyResult.status === 'fulfilled') {
      const analysis = interviewDifficultyResult.value;
      updateData.interview_difficulty_level = analysis.level;
      updateData.interview_difficulty_rationale = analysis.rationale;
      updateData.interview_difficulty_confidence = analysis.confidence;
      updateData.interview_difficulty_analysed_at = new Date().toISOString();
      console.log(
        `✅ Interview Difficulty analysis complete for job ${jobId}: ${analysis.level} (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Interview Difficulty analysis failed for job ${jobId}:`, interviewDifficultyResult.reason);
    }

    if (roleSummaryResult.status === 'fulfilled') {
      const analysis = roleSummaryResult.value;
      updateData.role_summary_one_liner = analysis.one_liner;
      updateData.role_summary_plain_english = analysis.plain_english;
      updateData.role_summary_confidence = analysis.confidence;
      updateData.role_summary_analysed_at = new Date().toISOString();
      console.log(
        `✅ Role Summary analysis complete for job ${jobId}: ${analysis.one_liner.slice(0, 50)}... (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Role Summary analysis failed for job ${jobId}:`, roleSummaryResult.reason);
    }

    if (whoRoleIsForResult.status === 'fulfilled') {
      const analysis = whoRoleIsForResult.value;
      updateData.who_role_is_for_bullets = analysis.bullets;
      updateData.who_role_is_for_confidence = analysis.confidence;
      updateData.who_role_is_for_analysed_at = new Date().toISOString();
      console.log(
        `✅ Who Role Is For analysis complete for job ${jobId}: ${analysis.bullets.length} bullets (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Who Role Is For analysis failed for job ${jobId}:`, whoRoleIsForResult.reason);
    }

    if (whoRoleIsNotForResult.status === 'fulfilled') {
      const analysis = whoRoleIsNotForResult.value;
      updateData.who_role_is_not_for_bullets = analysis.bullets;
      updateData.who_role_is_not_for_confidence = analysis.confidence;
      updateData.who_role_is_not_for_analysed_at = new Date().toISOString();
      console.log(
        `✅ Who Role Is NOT For analysis complete for job ${jobId}: ${analysis.bullets.length} bullets (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Who Role Is NOT For analysis failed for job ${jobId}:`, whoRoleIsNotForResult.reason);
    }

    if (autonomyVsProcessResult.status === 'fulfilled') {
      const analysis = autonomyVsProcessResult.value;
      updateData.autonomy_level = analysis.autonomy_level;
      updateData.process_load = analysis.process_load;
      updateData.autonomy_vs_process_rationale = analysis.rationale;
      updateData.autonomy_vs_process_confidence = analysis.confidence;
      updateData.autonomy_vs_process_analysed_at = new Date().toISOString();
      console.log(
        `✅ Autonomy vs Process analysis complete for job ${jobId}: autonomy=${analysis.autonomy_level}, process=${analysis.process_load} (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Autonomy vs Process analysis failed for job ${jobId}:`, autonomyVsProcessResult.reason);
    }

    if (promotionLikelihoodResult.status === 'fulfilled') {
      const analysis = promotionLikelihoodResult.value;
      updateData.promotion_likelihood_signal = analysis.signal;
      updateData.promotion_likelihood_rationale = analysis.rationale;
      updateData.promotion_likelihood_confidence = analysis.confidence;
      updateData.promotion_likelihood_analysed_at = new Date().toISOString();
      console.log(
        `✅ Promotion Likelihood analysis complete for job ${jobId}: ${analysis.signal} (${analysis.confidence} confidence)`
      );
    } else {
      console.error(`❌ Promotion Likelihood analysis failed for job ${jobId}:`, promotionLikelihoodResult.reason);
    }

    // Only update if we have some data
    if (Object.keys(updateData).length > 0) {
      const { error } = await getSupabaseAdmin()
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        console.error(`❌ Failed to save analysis results for job ${jobId}:`, error);
        return;
      }

      console.log(`✅ Job analysis saved for job ${jobId}`);
    }
  } catch (error) {
    console.error(`❌ Job analysis failed for job ${jobId}:`, error);
    // Don't rethrow - analysis failure shouldn't break job creation
  }
}

/**
 * Legacy function for backwards compatibility.
 * Triggers only AI Focus analysis.
 * @deprecated Use triggerJobAnalysis instead
 */
export async function triggerAIFocusAnalysis(
  jobId: string,
  title: string,
  description: string,
  requirements?: string | null
): Promise<void> {
  try {
    console.log(`🤖 Starting AI Focus analysis for job ${jobId}`);

    const analysis = await analyseJobAIFocus(title, description, requirements);

    const { error } = await getSupabaseAdmin()
      .from('jobs')
      .update({
        ai_focus_percentage: analysis.percentage,
        ai_focus_rationale: analysis.rationale,
        ai_focus_confidence: analysis.confidence,
        ai_focus_analysed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      console.error(`❌ Failed to save AI Focus analysis for job ${jobId}:`, error);
      return;
    }

    console.log(
      `✅ AI Focus analysis complete for job ${jobId}: ${analysis.percentage}% (${analysis.confidence} confidence)`
    );
  } catch (error) {
    console.error(`❌ AI Focus analysis failed for job ${jobId}:`, error);
    // Don't rethrow - analysis failure shouldn't break job creation
  }
}
