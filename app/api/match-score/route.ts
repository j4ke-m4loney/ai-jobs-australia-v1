import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyseMatchScore } from '@/lib/ai-focus/analyse-match-score';
import { extractPdfText } from '@/lib/pdf-utils';
import { checkAndIncrementUsage } from '@/lib/usage-limits';
import { checkRateLimit } from '@/lib/rate-limit';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/match-score
 * Computes a personalised match score between a user's CV and a job listing.
 * Returns cached result if available, otherwise runs Claude analysis.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, jobId } = await request.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'userId and jobId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Rate limit: 10 requests per minute per user
    const rateLimit = checkRateLimit(`match_score:${userId}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    // Verify user has an active intelligence subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan_type')
      .eq('user_id', userId)
      .eq('plan_type', 'intelligence')
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Active AJA Intelligence subscription required' },
        { status: 403 }
      );
    }

    // First check if the user has a default resume at all (simple query, no optional columns)
    const { data: baseDoc, error: baseDocError } = await supabase
      .from('user_documents')
      .select('id, file_path')
      .eq('user_id', userId)
      .eq('document_type', 'resume')
      .eq('is_default', true)
      .single();

    if (baseDocError || !baseDoc) {
      return NextResponse.json(
        { error: 'no_resume', message: 'No default resume found. Upload a resume in your dashboard to get match scores.' },
        { status: 404 }
      );
    }

    // Try to get cached resume_text if the column exists
    let cachedResumeText: string | null = null;
    try {
      const { data: textDoc } = await supabase
        .from('user_documents')
        .select('resume_text')
        .eq('id', baseDoc.id)
        .single();
      cachedResumeText = textDoc?.resume_text ?? null;
    } catch {
      // resume_text column may not exist yet
    }

    const doc = { ...baseDoc, resume_text: cachedResumeText };

    // Check for cached match score (table may not exist yet if migration hasn't run)
    try {
      const { data: cached } = await supabase
        .from('job_match_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .eq('resume_document_id', doc.id)
        .single();

      if (cached) {
        return NextResponse.json({
          match_percentage: cached.match_percentage,
          matched_skills: cached.matched_skills,
          missing_skills: cached.missing_skills,
          keywords_to_add: cached.keywords_to_add,
          experience_fit: cached.experience_fit,
          summary: cached.summary,
          confidence: cached.confidence,
          cached: true,
        });
      }
    } catch {
      // Table may not exist yet — continue without cache
    }

    // Check monthly usage cap (only for uncached calls that will hit Claude)
    const usage = await checkAndIncrementUsage(supabase, userId, 'match_score');
    if (usage && !usage.allowed) {
      return NextResponse.json(
        { error: 'monthly_limit', message: `You've reached your monthly limit of ${usage.limit} match scores. Resets next month.`, currentCount: usage.currentCount, limit: usage.limit },
        { status: 429 }
      );
    }

    // Get resume text (from cache or extract from PDF)
    let resumeText = doc.resume_text;

    if (!resumeText) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(doc.file_path);

      if (downloadError || !fileData) {
        console.error('Failed to download resume:', downloadError);
        return NextResponse.json(
          { error: 'Failed to download resume file' },
          { status: 500 }
        );
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      resumeText = await extractPdfText(buffer);

      if (!resumeText || resumeText.length < 50) {
        return NextResponse.json(
          { error: 'Could not extract text from your resume. Ensure it is not a scanned image.' },
          { status: 422 }
        );
      }

      // Cache the extracted text (best-effort, column may not exist yet)
      try {
        await supabase
          .from('user_documents')
          .update({ resume_text: resumeText })
          .eq('id', doc.id);
      } catch {
        // Column may not exist yet
      }
    }

    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('title, description, requirements, companies(name)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Run the match analysis
    const companies = job.companies as unknown as { name: string } | { name: string }[] | null;
    const companyName = Array.isArray(companies) ? companies[0]?.name : companies?.name;
    const result = await analyseMatchScore(
      resumeText,
      job.title,
      job.description,
      companyName,
      job.requirements
    );

    // Cache the result in job_match_scores (best-effort, table may not exist yet)
    try {
      const { error: insertError } = await supabase
        .from('job_match_scores')
        .upsert({
          user_id: userId,
          job_id: jobId,
          resume_document_id: doc.id,
          match_percentage: result.match_percentage,
          matched_skills: result.matched_skills,
          missing_skills: result.missing_skills,
          keywords_to_add: result.keywords_to_add,
          experience_fit: result.experience_fit,
          summary: result.summary,
          confidence: result.confidence,
          analysed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,job_id,resume_document_id',
        });

      if (insertError) {
        console.error('Failed to cache match score:', insertError);
      }
    } catch {
      // Table may not exist yet — continue without caching
    }

    return NextResponse.json({
      ...result,
      cached: false,
    });
  } catch (error) {
    console.error('Error computing match score:', error);
    return NextResponse.json(
      { error: 'Failed to compute match score' },
      { status: 500 }
    );
  }
}
