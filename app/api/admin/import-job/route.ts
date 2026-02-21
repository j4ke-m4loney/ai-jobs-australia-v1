import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchAndExtractText, extractJobData } from '@/lib/job-import/extract-job-data';
import { matchCompany } from '@/lib/job-import/match-company';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { url, rawText, adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    if (!url && !rawText) {
      return NextResponse.json(
        { error: 'Either a URL or raw text is required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', adminId)
      .single();

    if (adminError || adminData?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorised — admin access required' },
        { status: 403 }
      );
    }

    let text: string;
    let sourceUrl: string | undefined;

    if (url) {
      try {
        text = await fetchAndExtractText(url);
        sourceUrl = url;
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        return NextResponse.json(
          {
            error: `Could not fetch the URL: ${message}`,
            suggestion: 'The site may block automated requests. Try pasting the job listing text instead.',
          },
          { status: 422 }
        );
      }
    } else {
      text = rawText.trim();
      if (text.length < 50) {
        return NextResponse.json(
          { error: 'The pasted text is too short to extract job data from.' },
          { status: 400 }
        );
      }
    }

    const extracted = await extractJobData(text, sourceUrl);

    // Match extracted company name against existing companies in the DB
    let companyMatch = null;
    try {
      const { data: companies } = await supabaseAdmin
        .from('companies')
        .select('id, name')
        .order('name');

      if (companies && companies.length > 0) {
        companyMatch = await matchCompany(extracted.companyName, companies);
      }
    } catch (matchError) {
      console.error('Company matching failed (non-blocking):', matchError);
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      companyMatch,
    });
  } catch (error) {
    console.error('Job import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to extract job data: ${message}` },
      { status: 500 }
    );
  }
}
