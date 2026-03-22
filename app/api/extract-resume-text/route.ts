import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractPdfText } from '@/lib/pdf-utils';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/extract-resume-text
 * Downloads the user's default resume from Supabase storage,
 * extracts text using pdf-parse, caches it in user_documents.resume_text,
 * and returns the text.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get the user's default resume
    const { data: doc, error: docError } = await supabase
      .from('user_documents')
      .select('id, file_path, resume_text')
      .eq('user_id', userId)
      .eq('document_type', 'resume')
      .eq('is_default', true)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'No default resume found. Please upload a resume in your dashboard.' },
        { status: 404 }
      );
    }

    // Return cached text if available
    if (doc.resume_text) {
      return NextResponse.json({
        text: doc.resume_text,
        documentId: doc.id,
        cached: true,
      });
    }

    // Download the PDF from Supabase storage
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

    // Convert Blob to Buffer and extract text
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const resumeText = await extractPdfText(buffer);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from your resume. Please ensure it is not a scanned image.' },
        { status: 422 }
      );
    }

    // Cache the extracted text (best-effort, don't fail if this errors)
    const { error: updateError } = await supabase
      .from('user_documents')
      .update({ resume_text: resumeText })
      .eq('id', doc.id);

    if (updateError) {
      console.error('Failed to cache resume text:', updateError);
      // Continue — we still have the text
    }

    return NextResponse.json({
      text: resumeText,
      documentId: doc.id,
      cached: false,
    });
  } catch (error) {
    console.error('Error extracting resume text:', error);
    return NextResponse.json(
      { error: 'Failed to extract resume text' },
      { status: 500 }
    );
  }
}
