import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCoverLetter } from '@/lib/ai-focus/generate-cover-letter';
import { extractPdfText } from '@/lib/pdf-utils';
import { checkAndIncrementUsage, getCoverLetterCountForJob, MAX_COVER_LETTERS_PER_JOB } from '@/lib/usage-limits';
import { checkRateLimit } from '@/lib/rate-limit';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/generate-cover-letter
 * Generates a tailored cover letter using the user's CV and a job description.
 * Caches results and enforces per-job and monthly generation limits.
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

    // Rate limit: 5 requests per minute per user
    const rateLimit = checkRateLimit(`cover_letter:${userId}`, 5, 60 * 1000);
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

    // Get the user's default resume
    const { data: baseDoc, error: baseDocError } = await supabase
      .from('user_documents')
      .select('id, file_path')
      .eq('user_id', userId)
      .eq('document_type', 'resume')
      .eq('is_default', true)
      .single();

    if (baseDocError || !baseDoc) {
      return NextResponse.json(
        { error: 'no_resume', message: 'No default resume found. Upload a resume in your dashboard.' },
        { status: 404 }
      );
    }

    // Check for cached cover letter (serve the most recent one if user navigates back)
    try {
      const { data: cachedLetters } = await supabase
        .from('cover_letters')
        .select('cover_letter, word_count, generation_number')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .eq('resume_document_id', baseDoc.id)
        .order('generation_number', { ascending: false })
        .limit(1);

      // Only serve cache on first load (not regeneration). Client sends regenerate flag.
      const { regenerate } = await request.clone().json().catch(() => ({ regenerate: false }));

      if (!regenerate && cachedLetters && cachedLetters.length > 0) {
        const cached = cachedLetters[0];
        return NextResponse.json({
          cover_letter: cached.cover_letter,
          word_count: cached.word_count,
          generation_number: cached.generation_number,
          max_generations: MAX_COVER_LETTERS_PER_JOB,
          cached: true,
        });
      }
    } catch {
      // Table may not exist yet
    }

    // Check per-job generation cap (server-side)
    const jobGenCount = await getCoverLetterCountForJob(supabase, userId, jobId, baseDoc.id);
    if (jobGenCount >= MAX_COVER_LETTERS_PER_JOB) {
      return NextResponse.json(
        { error: 'job_limit', message: `You've reached the limit of ${MAX_COVER_LETTERS_PER_JOB} cover letters for this job.`, generation_number: jobGenCount, max_generations: MAX_COVER_LETTERS_PER_JOB },
        { status: 429 }
      );
    }

    // Check monthly usage cap
    const usage = await checkAndIncrementUsage(supabase, userId, 'cover_letter');
    if (usage && !usage.allowed) {
      return NextResponse.json(
        { error: 'monthly_limit', message: `You've reached your monthly limit of ${usage.limit} cover letters. Resets next month.`, currentCount: usage.currentCount, limit: usage.limit },
        { status: 429 }
      );
    }

    // Get resume text
    let cachedResumeText: string | null = null;
    try {
      const { data: textDoc } = await supabase
        .from('user_documents')
        .select('resume_text')
        .eq('id', baseDoc.id)
        .single();
      cachedResumeText = textDoc?.resume_text ?? null;
    } catch {
      // Column may not exist yet
    }

    let resumeText = cachedResumeText;

    if (!resumeText) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resumes')
        .download(baseDoc.file_path);

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
          { error: 'Could not extract text from your resume.' },
          { status: 422 }
        );
      }

      // Cache extracted text (best-effort)
      try {
        await supabase
          .from('user_documents')
          .update({ resume_text: resumeText })
          .eq('id', baseDoc.id);
      } catch {
        // Column may not exist yet
      }
    }

    // Get job details
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

    const companies = job.companies as unknown as { name: string } | { name: string }[] | null;
    const companyName = Array.isArray(companies) ? companies[0]?.name : companies?.name;

    const result = await generateCoverLetter(
      resumeText,
      job.title,
      job.description,
      companyName,
      job.requirements
    );

    const newGenNumber = jobGenCount + 1;

    // Cache the generated cover letter (best-effort)
    try {
      await supabase
        .from('cover_letters')
        .upsert({
          user_id: userId,
          job_id: jobId,
          resume_document_id: baseDoc.id,
          generation_number: newGenNumber,
          cover_letter: result.cover_letter,
          word_count: result.word_count,
        }, {
          onConflict: 'user_id,job_id,resume_document_id,generation_number',
        });
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      ...result,
      generation_number: newGenNumber,
      max_generations: MAX_COVER_LETTERS_PER_JOB,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}
