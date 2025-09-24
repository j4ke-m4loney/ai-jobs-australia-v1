import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      applicantId,
      resumeUrl,
      coverLetterUrl
    } = await request.json();

    console.log('📝 Application API - Creating application:', {
      jobId,
      applicantId,
      hasResumeUrl: !!resumeUrl,
      hasCoverLetterUrl: !!coverLetterUrl
    });

    if (!jobId || !applicantId) {
      return NextResponse.json(
        { error: 'Job ID and Applicant ID are required' },
        { status: 400 }
      );
    }

    // Get job and employer details for email notification
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        company_name,
        employer_id
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      console.error('❌ Job not found:', jobError);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get applicant details from profiles and auth.users
    const { data: applicantData, error: applicantError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', applicantId)
      .single();

    if (applicantError || !applicantData) {
      console.error('❌ Applicant not found:', applicantError);
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Get applicant email from auth.users table
    const { data: applicantUserData, error: applicantUserError } = await supabaseAdmin
      .auth.admin.getUserById(applicantId);

    const applicantEmail = applicantUserData?.user?.email;

    // Check if application already exists
    const { data: existingApplication } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', applicantId)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // Create the application
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: applicantId,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        status: 'submitted'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('❌ Failed to create application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    console.log('✅ Application created successfully:', application.id);

    // Get employer's email from auth.users table
    const { data: employerUserData, error: employerUserError } = await supabaseAdmin
      .auth.admin.getUserById(jobData.employer_id);

    const employerEmail = employerUserData?.user?.email;

    // Check employer's notification preferences
    const { data: employerPrefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('email_applications')
      .eq('user_id', jobData.employer_id)
      .single();

    // Send email notification to employer if they have the preference enabled (default: true)
    const shouldSendEmail = !employerPrefs || employerPrefs.email_applications !== false;

    if (shouldSendEmail && !employerUserError && employerEmail) {
      try {
        // Get employer profile information
        const { data: employerProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', jobData.employer_id)
          .single();

        const employerName = employerProfile?.first_name && employerProfile?.last_name
          ? `${employerProfile.first_name} ${employerProfile.last_name}`.trim()
          : employerProfile?.first_name || employerProfile?.last_name || 'Employer';

        const applicantName = applicantData?.first_name && applicantData?.last_name
          ? `${applicantData.first_name} ${applicantData.last_name}`.trim()
          : applicantData?.first_name || applicantData?.last_name || 'Job Seeker';

        await emailService.sendJobApplicationNotification({
          employerName,
          employerEmail: employerEmail,
          jobTitle: jobData.title,
          jobId: jobData.id,
          applicantName,
          applicantEmail: applicantEmail || 'Unknown',
          applicationDate: new Date().toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/applications`
        });

        console.log('✅ Application notification email sent to employer');
      } catch (emailError) {
        console.error('❌ Failed to send application notification email:', emailError);
        // Don't fail the request if email fails - application was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        created_at: application.created_at
      }
    });

  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    const type = searchParams.get('type'); // 'employer' or 'applicant'

    console.log('📋 Applications API - GET request:', { userId, jobId, type });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('job_applications').select(`
      id,
      status,
      created_at,
      updated_at,
      resume_url,
      cover_letter_url,
      jobs (
        id,
        title,
        company_name,
        location,
        employer_id
      ),
      profiles (
        user_id,
        first_name,
        last_name
      )
    `);

    if (type === 'employer') {
      // Get applications for jobs posted by this employer
      query = query.eq('jobs.employer_id', userId);
    } else {
      // Get applications made by this user
      query = query.eq('applicant_id', userId);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    console.log(`✅ Retrieved ${applications?.length || 0} applications`);

    return NextResponse.json({
      applications: applications || []
    });

  } catch (error) {
    console.error('Error in applications GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}