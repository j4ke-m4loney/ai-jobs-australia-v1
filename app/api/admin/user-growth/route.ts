import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Timezone constant for Australia/Sydney
const TIMEZONE = 'Australia/Sydney';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    // Calculate percentage change from previous period
    const currentPeriodSignups = aggregatedData.length > 0
      ? aggregatedData[aggregatedData.length - 1].newUsers
      : 0;

    const previousPeriodSignups = aggregatedData.length > 1
      ? aggregatedData[aggregatedData.length - 2].newUsers
      : 0;

    let percentageChange = 0;
    if (previousPeriodSignups === 0 && currentPeriodSignups > 0) {
      percentageChange = 100; // Special case: went from 0 to something
    } else if (previousPeriodSignups > 0) {
      percentageChange = ((currentPeriodSignups - previousPeriodSignups) / previousPeriodSignups) * 100;
    }

    return NextResponse.json({
      data: aggregatedData,
      percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal place
      previousPeriodSignups,
      currentPeriodSignups,
    });
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
  const dataMap = new Map<string, number>();

  // Generate date range based on period (using Sydney timezone)
  const dateRange = generateDateRange(period);

  // Get the first date key in our range
  const firstDateKey = dateRange[0];

  // Count all users and categorize them
  let baselineUsers = 0;
  profiles.forEach(profile => {
    const date = new Date(profile.created_at);
    const key = getDateKey(date, period);

    // If this date key is before our range, count as baseline
    if (key < firstDateKey) {
      baselineUsers++;
    } else if (dateRange.includes(key)) {
      // If within our range, add to the period count
      dataMap.set(key, (dataMap.get(key) || 0) + 1);
    }
  });

  // Build final data array with cumulative totals starting from baseline
  let cumulativeTotal = baselineUsers;
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

/**
 * Convert UTC date to Sydney timezone and extract date components
 */
function toSydneyDate(date: Date): { year: number; month: number; day: number } {
  const sydneyDateStr = date.toLocaleString('en-AU', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Parse the date string (format: "DD/MM/YYYY")
  const [day, month, year] = sydneyDateStr.split('/').map(Number);

  return { year, month, day };
}

/**
 * Get current date in Sydney timezone as date components
 */
function getSydneyToday(): { year: number; month: number; day: number } {
  const now = new Date();
  return toSydneyDate(now);
}

function getDateKey(date: Date, period: string): string {
  const sydney = toSydneyDate(date);
  const year = sydney.year;
  const month = String(sydney.month).padStart(2, '0');
  const day = String(sydney.day).padStart(2, '0');

  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      // Get ISO week number using Sydney date
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

function generateDateRange(period: string): string[] {
  const range: string[] = [];
  const today = getSydneyToday();

  switch (period) {
    case 'daily': {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        // Create a date i days ago
        const date = new Date(today.year, today.month - 1, today.day - i);
        const sydney = toSydneyDate(date);
        const key = `${sydney.year}-${String(sydney.month).padStart(2, '0')}-${String(sydney.day).padStart(2, '0')}`;
        range.push(key);
      }
      break;
    }
    case 'weekly': {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        // Create a date i weeks ago
        const date = new Date(today.year, today.month - 1, today.day - (i * 7));
        const weekNum = getWeekNumber(date);
        const sydney = toSydneyDate(date);
        const key = `${sydney.year}-W${String(weekNum).padStart(2, '0')}`;
        range.push(key);
      }
      break;
    }
    case 'monthly': {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        // Create a date i months ago
        const date = new Date(today.year, today.month - 1 - i, 1);
        const sydney = toSydneyDate(date);
        const key = `${sydney.year}-${String(sydney.month).padStart(2, '0')}`;
        range.push(key);
      }
      break;
    }
    case 'yearly': {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = today.year - i;
        const key = `${year}`;
        range.push(key);
      }
      break;
    }
    default:
      // Default to monthly
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.year, today.month - 1 - i, 1);
        const sydney = toSydneyDate(date);
        const key = `${sydney.year}-${String(sydney.month).padStart(2, '0')}`;
        range.push(key);
      }
  }

  return range;
}

function getWeekNumber(date: Date): number {
  // Get the date in Sydney timezone
  const sydney = toSydneyDate(date);
  const d = new Date(Date.UTC(sydney.year, sydney.month - 1, sydney.day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
