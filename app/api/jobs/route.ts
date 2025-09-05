import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use anon key for now - we'll pass the user token in the request
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    // Extract user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Map the job form data to database schema
    const jobRecord = {
      employer_id: user.id,
      title: jobData.jobTitle,
      description: jobData.jobDescription,
      requirements: jobData.requirements,
      location: jobData.locationAddress,
      location_type: mapLocationType(jobData.locationType),
      job_type: mapJobType(jobData.jobType),
      category: 'ai', // Default category, could be determined from title/description
      salary_min: getSalaryMin(jobData.payConfig),
      salary_max: getSalaryMax(jobData.payConfig),
      application_method: jobData.applicationMethod,
      application_url: jobData.applicationUrl,
      application_email: jobData.applicationEmail,
      is_featured: jobData.pricingTier === 'featured' || jobData.pricingTier === 'annual',
      status: 'pending', // Jobs start as pending approval
      payment_status: 'completed', // For now, assume payment is completed
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    // Insert the job into the database
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobRecord)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    
    if (!employerId) {
      return NextResponse.json({ error: 'employerId parameter required' }, { status: 400 });
    }

    // Fetch jobs for the employer
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          description,
          website,
          logo_url
        )
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    return NextResponse.json({ jobs: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions to map form data to database schema
function mapLocationType(locationType: string): string {
  const mapping: { [key: string]: string } = {
    'fully-remote': 'remote',
    'in-person': 'onsite',
    'hybrid': 'hybrid',
    'on-the-road': 'onsite', // Map to onsite as closest match
  };
  return mapping[locationType] || 'onsite';
}

function mapJobType(jobType: string): string {
  const mapping: { [key: string]: string } = {
    'full-time': 'full-time',
    'part-time': 'part-time',
    'permanent': 'full-time', // Map to full-time as closest match
    'fixed-term': 'contract',
    'subcontract': 'contract',
    'casual': 'part-time',
    'temp-to-perm': 'contract',
    'contract': 'contract',
    'internship': 'internship',
    'volunteer': 'internship', // Map to internship as closest match
    'graduate': 'full-time',
  };
  return mapping[jobType] || 'full-time';
}

function getSalaryMin(payConfig: any): number | null {
  if (!payConfig.showPay) return null;
  
  if (payConfig.payType === 'range' && payConfig.payRangeMin) {
    return convertToAnnualSalary(payConfig.payRangeMin, payConfig.payPeriod);
  }
  if (payConfig.payType === 'minimum' && payConfig.payAmount) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }
  
  return null;
}

function getSalaryMax(payConfig: any): number | null {
  if (!payConfig.showPay) return null;
  
  if (payConfig.payType === 'range' && payConfig.payRangeMax) {
    return convertToAnnualSalary(payConfig.payRangeMax, payConfig.payPeriod);
  }
  if (payConfig.payType === 'maximum' && payConfig.payAmount) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }
  
  return null;
}

function convertToAnnualSalary(amount: number, period: string): number {
  const multipliers: { [key: string]: number } = {
    'hour': 2080, // 40 hours/week * 52 weeks
    'day': 260, // ~260 working days per year
    'week': 52,
    'month': 12,
    'year': 1,
  };
  
  return Math.round(amount * (multipliers[period] || 1));
}