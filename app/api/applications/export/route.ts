import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Export applications as CSV for a specific job.
 * Requires jobId and userId (employer must own the job).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch job details (title + company name) for the filename
    const { data: jobDetails } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name, employer_id, companies(name)')
      .eq('id', jobId)
      .single();

    if (!jobDetails) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify job ownership if userId provided
    if (userId && jobDetails.employer_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const jobTitle = jobDetails.title || 'Job';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyName = jobDetails.company_name || (jobDetails.companies as any)?.name || 'Company';

    // Fetch applications
    let query = supabaseAdmin
      .from('job_applications')
      .select('id, status, created_at, applicant_id')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Failed to fetch applications for export:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Build CSV helper
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build clean filename: "Company - Job Title - Applications - 2026-03-28.csv"
    const sanitise = (str: string) =>
      str.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitise(companyName)} - ${sanitise(jobTitle)} - Applications - ${dateStr}.csv`;

    if (!applications || applications.length === 0) {
      const csv = 'Name,Email,Phone,Location,Status,Applied Date\n';
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Fetch profiles and emails
    const applicantIds = [...new Set(applications.map(a => a.applicant_id))];

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, last_name, phone, location')
      .in('user_id', applicantIds);

    const profilesMap = new Map();
    (profiles || []).forEach(p => profilesMap.set(p.user_id, p));

    // Fetch emails from auth.users
    const emailMap = new Map<string, string>();
    for (const applicantId of applicantIds) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(applicantId);
      if (userData?.user?.email) {
        emailMap.set(applicantId, userData.user.email);
      }
    }

    const dataHeader = 'Name,Email,Phone,Location,Status,Applied Date';
    const rows = applications.map(app => {
      const profile = profilesMap.get(app.applicant_id);
      const name = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Unknown';
      const email = emailMap.get(app.applicant_id) || '';
      const phone = profile?.phone || '';
      const location = profile?.location || '';
      const statusText = app.status.charAt(0).toUpperCase() + app.status.slice(1);
      const appliedDate = new Date(app.created_at).toLocaleDateString('en-AU');

      return [name, email, phone, location, statusText, appliedDate]
        .map(escapeCSV)
        .join(',');
    });

    const csv = dataHeader + '\n' + rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in applications export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
