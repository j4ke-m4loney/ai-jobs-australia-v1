import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get admin ID from request header
    const adminId = request.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
    }

    // Verify admin permissions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', adminId)
      .single();

    if (adminError || adminData?.user_type !== 'admin') {
      console.error('Admin verification failed:', adminError);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get period from query params (default to monthly)
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly';

    // Fetch all profiles with created_at timestamps
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Aggregate data based on period
    const aggregatedData = aggregateUserData(profiles, period);

    return NextResponse.json({ data: aggregatedData });
  } catch (error) {
    console.error('Error in user-growth API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface Profile {
  created_at: string;
}

interface GrowthDataPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

function aggregateUserData(profiles: Profile[], period: string): GrowthDataPoint[] {
  const now = new Date();
  const dataMap = new Map<string, number>();

  // Count new users per period
  profiles.forEach(profile => {
    const date = new Date(profile.created_at);
    const key = getDateKey(date, period);
    dataMap.set(key, (dataMap.get(key) || 0) + 1);
  });

  // Generate date range based on period
  const dateRange = generateDateRange(now, period);

  // Build final data array with cumulative totals
  let cumulativeTotal = 0;
  const result: GrowthDataPoint[] = dateRange.map(dateKey => {
    const newUsers = dataMap.get(dateKey) || 0;
    cumulativeTotal += newUsers;

    return {
      date: dateKey,
      newUsers,
      totalUsers: cumulativeTotal,
    };
  });

  return result;
}

function getDateKey(date: Date, period: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      // Get ISO week number
      const weekNum = getWeekNumber(date);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'yearly':
      return `${year}`;
    default:
      return `${year}-${month}`;
  }
}

function generateDateRange(endDate: Date, period: string): string[] {
  const range: string[] = [];
  let currentDate = new Date(endDate);

  let count: number;
  let incrementFn: (date: Date) => Date;

  switch (period) {
    case 'daily':
      count = 30; // Last 30 days
      incrementFn = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
      };
      break;
    case 'weekly':
      count = 12; // Last 12 weeks
      incrementFn = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      };
      break;
    case 'monthly':
      count = 12; // Last 12 months
      incrementFn = (date) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      };
      break;
    case 'yearly':
      count = 5; // Last 5 years
      incrementFn = (date) => {
        const newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
      };
      break;
    default:
      count = 12;
      incrementFn = (date) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      };
  }

  for (let i = 0; i < count; i++) {
    range.unshift(getDateKey(currentDate, period));
    currentDate = incrementFn(currentDate);
  }

  return range;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
