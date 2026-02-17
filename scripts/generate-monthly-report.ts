/**
 * Monthly Report Generator for AI Jobs Australia
 *
 * Pulls data from both Supabase and PostHog, outputs a complete data dump
 * and generates a markdown report draft.
 *
 * Usage:
 *   npx tsx scripts/generate-monthly-report.ts              # Current month
 *   npx tsx scripts/generate-monthly-report.ts 2026-02       # Specific month
 *   npx tsx scripts/generate-monthly-report.ts 2026-03       # March 2026
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   POSTHOG_PERSONAL_API_KEY    (phx_... key from PostHog settings)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY!;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!posthogApiKey) {
  console.error('❌ Missing POSTHOG_PERSONAL_API_KEY in .env.local');
  console.error('   Create one at: PostHog → Settings → Personal API Keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ---------------------------------------------------------------------------
// Date handling
// ---------------------------------------------------------------------------

function parsePeriod(arg?: string): { start: string; end: string; label: string; prevStart: string; prevEnd: string } {
  let year: number;
  let month: number;

  if (arg && /^\d{4}-\d{2}$/.test(arg)) {
    [year, month] = arg.split('-').map(Number);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const start = `${year}-${String(month).padStart(2, '0')}-01`;

  // End = first day of next month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  // Previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEnd = start;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const label = `${monthNames[month - 1]} ${year}`;

  return { start, end, label, prevStart, prevEnd };
}

// ---------------------------------------------------------------------------
// PostHog queries
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function posthogQuery(query: string): Promise<any[]> {
  const response = await fetch(`${posthogHost}/api/projects/@current/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${posthogApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query },
    }),
  });

  const data = await response.json();
  if (data.error) {
    console.error(`❌ PostHog query error: ${data.error}`);
    return [];
  }
  return data.results || [];
}

async function getPostHogData(start: string, end: string, prevStart: string, prevEnd: string) {
  console.log('📊 Querying PostHog...');

  // All queries in parallel
  const [
    eventCounts,
    dailyActivity,
    topApplyClicks,
    topSearchQueries,
    searchLocationFilters,
    topPages,
    topBlogPosts,
    toolsViews,
    signupBreakdown,
    referrers,
    uniqueVisitors,
    prevEventCounts,
    prevUniqueVisitors,
    intelligenceFunnel,
  ] = await Promise.all([
    // Current month event counts
    posthogQuery(`
      SELECT event, count() as cnt
      FROM events
      WHERE timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY event ORDER BY cnt DESC LIMIT 30
    `),

    // Daily activity
    posthogQuery(`
      SELECT toDate(timestamp) as day,
        countIf(event = '$pageview') as pageviews,
        countIf(event = 'apply_button_clicked') as apply_clicks,
        countIf(event = 'job_search') as searches,
        countIf(event = 'sign_up') as signups
      FROM events
      WHERE timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY day ORDER BY day
    `),

    // Top applied-to jobs
    posthogQuery(`
      SELECT properties.job_title as job_title,
        properties.company as company,
        properties.location as location,
        count() as clicks
      FROM events
      WHERE event = 'apply_button_clicked'
        AND timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY job_title, company, location
      ORDER BY clicks DESC LIMIT 20
    `),

    // Top search queries
    posthogQuery(`
      SELECT properties.search_query as query, count() as cnt
      FROM events
      WHERE event = 'job_search'
        AND timestamp >= '${start}' AND timestamp < '${end}'
        AND properties.search_query IS NOT NULL
        AND properties.search_query != ''
      GROUP BY query ORDER BY cnt DESC LIMIT 25
    `),

    // Search location filters
    posthogQuery(`
      SELECT properties.location_filter as location, count() as cnt
      FROM events
      WHERE event = 'job_search'
        AND timestamp >= '${start}' AND timestamp < '${end}'
        AND properties.location_filter IS NOT NULL
        AND properties.location_filter != ''
      GROUP BY location ORDER BY cnt DESC LIMIT 15
    `),

    // Top pages
    posthogQuery(`
      SELECT properties.$current_url as url, count() as views
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY url ORDER BY views DESC LIMIT 25
    `),

    // Top blog posts
    posthogQuery(`
      SELECT properties.$current_url as url, count() as views
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${start}' AND timestamp < '${end}'
        AND properties.$current_url LIKE '%aijobsaustralia.com.au/blog/%'
      GROUP BY url ORDER BY views DESC LIMIT 15
    `),

    // Tools page views
    posthogQuery(`
      SELECT properties.$current_url as url, count() as views
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${start}' AND timestamp < '${end}'
        AND properties.$current_url LIKE '%aijobsaustralia.com.au/tools%'
      GROUP BY url ORDER BY views DESC LIMIT 10
    `),

    // Signup breakdown
    posthogQuery(`
      SELECT properties.user_type as user_type,
        properties.auth_method as auth_method,
        count() as cnt
      FROM events
      WHERE event = 'sign_up'
        AND timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY user_type, auth_method ORDER BY cnt DESC
    `),

    // Referrers
    posthogQuery(`
      SELECT properties.$referring_domain as referrer, count() as cnt
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${start}' AND timestamp < '${end}'
        AND properties.$referring_domain IS NOT NULL
        AND properties.$referring_domain != ''
      GROUP BY referrer ORDER BY cnt DESC LIMIT 15
    `),

    // Unique visitors (current month)
    posthogQuery(`
      SELECT count(DISTINCT person_id) as unique_visitors
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${start}' AND timestamp < '${end}'
    `),

    // Previous month event counts
    posthogQuery(`
      SELECT
        countIf(event = '$pageview') as pageviews,
        countIf(event = 'apply_button_clicked') as apply_clicks,
        countIf(event = 'job_search') as searches,
        countIf(event = 'sign_up') as signups
      FROM events
      WHERE timestamp >= '${prevStart}' AND timestamp < '${prevEnd}'
    `),

    // Previous month unique visitors
    posthogQuery(`
      SELECT count(DISTINCT person_id) as unique_visitors
      FROM events
      WHERE event = '$pageview'
        AND timestamp >= '${prevStart}' AND timestamp < '${prevEnd}'
    `),

    // Intelligence funnel
    posthogQuery(`
      SELECT event, count() as cnt
      FROM events
      WHERE event IN ('intelligence_modal_viewed', 'intelligence_checkout_clicked', 'intelligence_subscribed', 'subscription_cancelled')
        AND timestamp >= '${start}' AND timestamp < '${end}'
      GROUP BY event
    `),
  ]);

  return {
    eventCounts,
    dailyActivity,
    topApplyClicks,
    topSearchQueries,
    searchLocationFilters,
    topPages,
    topBlogPosts,
    toolsViews,
    signupBreakdown,
    referrers,
    uniqueVisitors: uniqueVisitors[0]?.[0] || 0,
    prevEventCounts: prevEventCounts[0] || [0, 0, 0, 0],
    prevUniqueVisitors: prevUniqueVisitors[0]?.[0] || 0,
    intelligenceFunnel,
  };
}

// ---------------------------------------------------------------------------
// Supabase queries
// ---------------------------------------------------------------------------

async function getSupabaseData(start: string, end: string, prevStart: string, prevEnd: string) {
  console.log('🗄️  Querying Supabase...');

  // Jobs this month
  const { data: jobsThisMonth } = await supabase
    .from('jobs')
    .select('id, title, category, location, location_type, job_type, salary_min, salary_max, salary_period, show_salary, is_featured, featured_until, ai_focus_percentage, interview_difficulty_level, autonomy_level, promotion_likelihood_signal, company_id')
    .eq('status', 'approved')
    .gte('created_at', start)
    .lt('created_at', end);

  // Jobs last month
  const { data: jobsLastMonth } = await supabase
    .from('jobs')
    .select('id, company_id, show_salary, salary_min')
    .eq('status', 'approved')
    .gte('created_at', prevStart)
    .lt('created_at', prevEnd);

  // Total active jobs
  const { count: totalActiveJobs } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  // All posted this month (any status)
  const { count: totalPostedThisMonth } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start)
    .lt('created_at', end);

  // Companies for this month's jobs
  const companyIds = [...new Set((jobsThisMonth || []).map(j => j.company_id).filter(Boolean))];
  let companies: Record<string, string> = {};
  if (companyIds.length > 0) {
    const { data: companyData } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds);
    companies = Object.fromEntries((companyData || []).map(c => [c.id, c.name]));
  }

  // Platform stats
  const { count: totalJobSeekers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_type', 'job_seeker');

  const { count: totalEmployers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_type', 'employer');

  const { count: newSeekersThisMonth } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_type', 'job_seeker')
    .gte('created_at', start)
    .lt('created_at', end);

  const { count: newSeekersLastMonth } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_type', 'job_seeker')
    .gte('created_at', prevStart)
    .lt('created_at', prevEnd);

  const { count: activeIntelligenceSubs } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('plan_type', 'intelligence')
    .eq('status', 'active');

  return {
    jobsThisMonth: jobsThisMonth || [],
    jobsLastMonth: jobsLastMonth || [],
    totalActiveJobs: totalActiveJobs || 0,
    totalPostedThisMonth: totalPostedThisMonth || 0,
    companies,
    totalJobSeekers: totalJobSeekers || 0,
    totalEmployers: totalEmployers || 0,
    newSeekersThisMonth: newSeekersThisMonth || 0,
    newSeekersLastMonth: newSeekersLastMonth || 0,
    activeIntelligenceSubs: activeIntelligenceSubs || 0,
  };
}

// ---------------------------------------------------------------------------
// Analysis helpers
// ---------------------------------------------------------------------------

function deriveState(location: string | null, locationType: string | null): string {
  if (!location) return locationType === 'remote' ? 'Remote' : 'Not specified';
  const loc = location.toUpperCase();
  if (/\bNSW\b/.test(loc) || /\bSYDNEY\b/.test(loc)) return 'NSW';
  if (/\bVIC\b/.test(loc) || /\bMELBOURNE\b/.test(loc)) return 'VIC';
  if (/\bQLD\b/.test(loc) || /\bBRISBANE\b/.test(loc)) return 'QLD';
  if (/\bWA\b/.test(loc) || /\bPERTH\b/.test(loc)) return 'WA';
  if (/\bSA\b/.test(loc) || /\bADELAIDE\b/.test(loc)) return 'SA';
  if (/\bTAS\b/.test(loc) || /\bHOBART\b/.test(loc)) return 'TAS';
  if (/\bACT\b/.test(loc) || /\bCANBERRA\b/.test(loc)) return 'ACT';
  if (/\bNT\b/.test(loc) || /\bDARWIN\b/.test(loc)) return 'NT';
  if (locationType === 'remote') return 'Remote';
  return 'Not specified';
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function sortDesc(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${((n / total) * 100).toFixed(1)}%`;
}

function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(
  period: ReturnType<typeof parsePeriod>,
  ph: Awaited<ReturnType<typeof getPostHogData>>,
  sb: Awaited<ReturnType<typeof getSupabaseData>>,
): string {
  const jobs = sb.jobsThisMonth;
  const totalJobs = jobs.length;

  // Derive event totals from PostHog
  const eventMap = Object.fromEntries(ph.eventCounts.map(([e, c]: [string, number]) => [e, c]));
  const pageviews = eventMap['$pageview'] || 0;
  const applyClicks = eventMap['apply_button_clicked'] || 0;
  const searches = eventMap['job_search'] || 0;

  // Previous month
  const prevPageviews = ph.prevEventCounts[0] || 0;
  const prevApplyClicks = ph.prevEventCounts[1] || 0;
  const prevSearches = ph.prevEventCounts[2] || 0;

  // Days in period (for daily averages)
  const daysInMonth = ph.dailyActivity.length || 1;
  const prevDaysInMonth = new Date(
    parseInt(period.prevEnd.split('-')[0]),
    parseInt(period.prevEnd.split('-')[1]),
    0
  ).getDate();

  // Unique companies
  const uniqueCompanyIds = new Set(jobs.map(j => j.company_id).filter(Boolean));

  // Category breakdown
  const byCat = countBy(jobs, j => j.category || 'Not specified');

  // Location type
  const byLocType = countBy(jobs, j => j.location_type || 'Not specified');

  // State
  const byState = countBy(jobs, j => deriveState(j.location, j.location_type));

  // Job type
  const byJobType = countBy(jobs, j => j.job_type || 'Not specified');

  // Salary (annual, disclosed)
  const salaryJobs = jobs.filter(j =>
    j.salary_min && j.salary_max && j.salary_period === 'year' && j.show_salary
  );
  const avgMin = salaryJobs.length ? salaryJobs.reduce((s, j) => s + j.salary_min, 0) / salaryJobs.length : 0;
  const avgMax = salaryJobs.length ? salaryJobs.reduce((s, j) => s + j.salary_max, 0) / salaryJobs.length : 0;
  const avgMid = (avgMin + avgMax) / 2;

  // Salary by category
  const salaryByCat: Record<string, { count: number; totalMin: number; totalMax: number }> = {};
  for (const j of salaryJobs) {
    const cat = j.category || 'Unknown';
    if (!salaryByCat[cat]) salaryByCat[cat] = { count: 0, totalMin: 0, totalMax: 0 };
    salaryByCat[cat].count++;
    salaryByCat[cat].totalMin += j.salary_min;
    salaryByCat[cat].totalMax += j.salary_max;
  }

  // AI Focus
  const aiFocusJobs = jobs.filter(j => j.ai_focus_percentage != null);
  const avgAiFocus = aiFocusJobs.length
    ? aiFocusJobs.reduce((s, j) => s + j.ai_focus_percentage, 0) / aiFocusJobs.length
    : 0;

  // Interview difficulty
  const byDifficulty = countBy(jobs, j => j.interview_difficulty_level || 'Not analysed');

  // Autonomy
  const byAutonomy = countBy(
    jobs.filter(j => j.autonomy_level),
    j => j.autonomy_level
  );

  // Promotion
  const byPromotion = countBy(
    jobs.filter(j => j.promotion_likelihood_signal),
    j => j.promotion_likelihood_signal
  );

  // Top companies
  const companyJobCounts = countBy(jobs.filter(j => j.company_id), j => sb.companies[j.company_id] || 'Unknown');

  // Top titles
  const byTitle = countBy(jobs, j => j.title);

  // Salary transparency
  const transparencyRate = totalJobs > 0
    ? (salaryJobs.length / totalJobs * 100).toFixed(1)
    : '0';

  // Remote by category
  const remoteByCat: Record<string, { total: number; remote: number; hybrid: number; onsite: number }> = {};
  for (const j of jobs) {
    const cat = j.category || 'Unknown';
    if (!remoteByCat[cat]) remoteByCat[cat] = { total: 0, remote: 0, hybrid: 0, onsite: 0 };
    remoteByCat[cat].total++;
    if (j.location_type === 'remote') remoteByCat[cat].remote++;
    else if (j.location_type === 'hybrid') remoteByCat[cat].hybrid++;
    else remoteByCat[cat].onsite++;
  }

  // Intelligence funnel
  const funnelMap = Object.fromEntries(ph.intelligenceFunnel.map(([e, c]: [string, number]) => [e, c]));

  // ---------------------------------------------------------------------------
  // Build report
  // ---------------------------------------------------------------------------

  const lines: string[] = [];
  const line = (s: string = '') => lines.push(s);
  const heading = (s: string) => { line(); line(`## ${s}`); line(); };
  const subheading = (s: string) => { line(); line(`### ${s}`); line(); };
  const table = (headers: string[], rows: (string | number)[][]) => {
    line(`| ${headers.join(' | ')} |`);
    line(`| ${headers.map(() => '---').join(' | ')} |`);
    for (const row of rows) {
      line(`| ${row.join(' | ')} |`);
    }
    line();
  };

  line(`# The State of AI Jobs in Australia — ${period.label}`);
  line();
  line(`*AI Jobs Australia Monthly Report*`);
  line();
  line('---');

  heading('Headline Numbers');
  line(`- **${totalJobs}** new jobs approved`);
  line(`- **${sb.totalPostedThisMonth}** total jobs posted`);
  line(`- **${sb.totalActiveJobs}** total active jobs on the platform`);
  line(`- **${uniqueCompanyIds.size}** unique companies hiring`);
  line(`- **${ph.uniqueVisitors.toLocaleString()}** unique visitors`);
  line(`- **${pageviews.toLocaleString()}** page views`);
  line(`- **${searches.toLocaleString()}** job searches performed`);
  line(`- **${applyClicks.toLocaleString()}** apply button clicks`);
  line(`- **${sb.newSeekersThisMonth}** new verified job seekers signed up`);

  heading('Month-over-Month Comparison');
  const _prevMonthName = period.label.replace(/\d{4}/, '').trim();
  table(
    ['Metric', `Previous Month`, `${period.label}`, 'Change (daily avg)'],
    [
      ['Page views', prevPageviews.toLocaleString(), pageviews.toLocaleString(),
        `${prevPageviews > 0 ? ((pageviews / daysInMonth) / (prevPageviews / prevDaysInMonth) * 100 - 100).toFixed(0) : '—'}%`],
      ['Apply clicks', prevApplyClicks.toLocaleString(), applyClicks.toLocaleString(),
        `${prevApplyClicks > 0 ? ((applyClicks / daysInMonth) / (prevApplyClicks / prevDaysInMonth) * 100 - 100).toFixed(0) : '—'}%`],
      ['Searches', prevSearches.toLocaleString(), searches.toLocaleString(),
        `${prevSearches > 0 ? ((searches / daysInMonth) / (prevSearches / prevDaysInMonth) * 100 - 100).toFixed(0) : '—'}%`],
      ['Jobs approved', sb.jobsLastMonth.length.toString(), totalJobs.toString(),
        `${sb.jobsLastMonth.length > 0 ? ((totalJobs / daysInMonth) / (sb.jobsLastMonth.length / prevDaysInMonth) * 100 - 100).toFixed(0) : '—'}%`],
      ['New signups (verified)', (sb.newSeekersLastMonth || 0).toString(), sb.newSeekersThisMonth.toString(), '—'],
    ]
  );

  heading('Jobs by Category');
  table(
    ['Category', 'Jobs', 'Share'],
    sortDesc(byCat).map(([cat, count]) => [cat, count, pct(count, totalJobs)])
  );

  heading('Jobs by Location Type');
  table(
    ['Type', 'Jobs', 'Share'],
    sortDesc(byLocType).map(([t, count]) => [t, count, pct(count, totalJobs)])
  );

  heading('Jobs by State');
  table(
    ['State', 'Jobs', 'Share'],
    sortDesc(byState).map(([s, count]) => [s, count, pct(count, totalJobs)])
  );

  heading('Employment Type');
  table(
    ['Type', 'Jobs', 'Share'],
    sortDesc(byJobType).map(([t, count]) => [t, count, pct(count, totalJobs)])
  );

  heading('Salary Snapshot');
  line(`- **${salaryJobs.length}** jobs with disclosed annual salary (${transparencyRate}% transparency rate)`);
  if (salaryJobs.length > 0) {
    line(`- Average range: **${formatCurrency(avgMin)}** – **${formatCurrency(avgMax)}**`);
    line(`- Average midpoint: **${formatCurrency(avgMid)}**`);
    line(`- Lowest min: ${formatCurrency(Math.min(...salaryJobs.map(j => j.salary_min)))}`);
    line(`- Highest max: ${formatCurrency(Math.max(...salaryJobs.map(j => j.salary_max)))}`);

    subheading('Salary by Category');
    table(
      ['Category', 'Jobs', 'Avg Min', 'Avg Max', 'Midpoint'],
      Object.entries(salaryByCat)
        .sort((a, b) => (b[1].totalMin + b[1].totalMax) / (2 * b[1].count) - (a[1].totalMin + a[1].totalMax) / (2 * a[1].count))
        .map(([cat, d]) => [
          cat, d.count,
          formatCurrency(d.totalMin / d.count),
          formatCurrency(d.totalMax / d.count),
          formatCurrency((d.totalMin + d.totalMax) / (2 * d.count)),
        ])
    );
  }

  heading('Top Hiring Companies');
  table(
    ['Company', 'Jobs'],
    sortDesc(companyJobCounts).slice(0, 15).map(([name, count]) => [name, count])
  );

  heading('Top Job Titles');
  table(
    ['Title', 'Count'],
    sortDesc(byTitle).slice(0, 20).map(([title, count]) => [title, count])
  );

  heading('AI Focus Score Distribution');
  if (aiFocusJobs.length > 0) {
    line(`- Overall average: **${avgAiFocus.toFixed(1)}%** (from ${aiFocusJobs.length} jobs)`);
    const bands = [
      ['Core AI/ML (80-100%)', aiFocusJobs.filter(j => j.ai_focus_percentage >= 80)],
      ['Strong AI/ML (60-79%)', aiFocusJobs.filter(j => j.ai_focus_percentage >= 60 && j.ai_focus_percentage < 80)],
      ['Moderate AI/ML (40-59%)', aiFocusJobs.filter(j => j.ai_focus_percentage >= 40 && j.ai_focus_percentage < 60)],
      ['Light AI/ML (20-39%)', aiFocusJobs.filter(j => j.ai_focus_percentage >= 20 && j.ai_focus_percentage < 40)],
      ['Minimal AI/ML (0-19%)', aiFocusJobs.filter(j => j.ai_focus_percentage < 20)],
    ] as [string, typeof aiFocusJobs][];
    table(
      ['Band', 'Jobs', 'Share', 'Avg Score'],
      bands.filter(([, jobs]) => jobs.length > 0).map(([band, bJobs]) => [
        band, bJobs.length, pct(bJobs.length, aiFocusJobs.length),
        (bJobs.reduce((s, j) => s + j.ai_focus_percentage, 0) / bJobs.length).toFixed(1),
      ])
    );
  }

  heading('Interview Difficulty');
  table(
    ['Difficulty', 'Jobs', 'Share'],
    ['easy', 'medium', 'hard', 'very_hard', 'Not analysed']
      .filter(d => byDifficulty[d])
      .map(d => [d, byDifficulty[d], pct(byDifficulty[d], totalJobs)])
  );

  heading('Autonomy Level');
  table(
    ['Level', 'Jobs', 'Share'],
    sortDesc(byAutonomy).map(([level, count]) => [level, count, pct(count, Object.values(byAutonomy).reduce((a, b) => a + b, 0))])
  );

  heading('Promotion Likelihood');
  table(
    ['Signal', 'Jobs', 'Share'],
    sortDesc(byPromotion).map(([signal, count]) => [signal, count, pct(count, Object.values(byPromotion).reduce((a, b) => a + b, 0))])
  );

  heading('Remote Work by Category');
  table(
    ['Category', 'Total', 'Remote', 'Hybrid', 'Onsite'],
    Object.entries(remoteByCat)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, d]) => [
        cat, d.total,
        `${d.remote} (${pct(d.remote, d.total)})`,
        `${d.hybrid} (${pct(d.hybrid, d.total)})`,
        `${d.onsite} (${pct(d.onsite, d.total)})`,
      ])
  );

  // PostHog sections
  line('---');
  line();
  line('# Analytics Data (PostHog)');

  heading('Top Search Queries');
  table(
    ['Query', 'Searches'],
    ph.topSearchQueries.slice(0, 20).map(([q, c]: [string, number]) => [q || '(empty)', c])
  );

  heading('Search Location Filters');
  table(
    ['Location', 'Count'],
    ph.searchLocationFilters.map(([l, c]: [string, number]) => [l, c])
  );

  heading('Most Applied-To Jobs');
  table(
    ['Job Title', 'Company', 'Location', 'Clicks'],
    ph.topApplyClicks.slice(0, 15).map(([t, c, l, clicks]: [string, string, string, number]) => [t, c, l, clicks])
  );

  heading('Traffic Sources');
  table(
    ['Source', 'Visits'],
    ph.referrers.map(([r, c]: [string, number]) => [r === '$direct' ? 'Direct' : r, c])
  );

  heading('Top Blog Posts');
  table(
    ['URL', 'Views'],
    ph.topBlogPosts.map(([u, v]: [string, number]) => [
      (u || '').replace('https://www.aijobsaustralia.com.au/blog/', ''), v
    ])
  );

  heading('Tools Page Views');
  table(
    ['URL', 'Views'],
    ph.toolsViews.map(([u, v]: [string, number]) => [
      (u || '').replace('https://www.aijobsaustralia.com.au', ''), v
    ])
  );

  heading('Daily Activity');
  table(
    ['Date', 'Pageviews', 'Apply Clicks', 'Searches', 'Signups (PostHog)'],
    ph.dailyActivity.map(([d, pv, ac, s, su]: [string, number, number, number, number]) => [d, pv, ac, s, su])
  );

  heading('AJA Intelligence Funnel');
  line(`- Modal viewed: **${funnelMap['intelligence_modal_viewed'] || 0}**`);
  line(`- Checkout clicked: **${funnelMap['intelligence_checkout_clicked'] || 0}**`);
  line(`- Subscribed: **${funnelMap['intelligence_subscribed'] || 0}**`);
  line(`- Cancelled: **${funnelMap['subscription_cancelled'] || 0}**`);
  line(`- Active subscribers: **${sb.activeIntelligenceSubs}**`);

  heading('Platform Totals');
  line(`- Total job seekers: **${sb.totalJobSeekers}**`);
  line(`- Total employers: **${sb.totalEmployers}**`);
  line(`- New seekers this month: **${sb.newSeekersThisMonth}**`);
  line(`- New seekers last month: **${sb.newSeekersLastMonth}**`);

  line();
  line('---');
  line(`*Report generated on ${new Date().toISOString().split('T')[0]}*`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const period = parsePeriod(process.argv[2]);
  console.log(`\n📋 Generating monthly report for: ${period.label}`);
  console.log(`   Period: ${period.start} to ${period.end}`);
  console.log(`   Previous: ${period.prevStart} to ${period.prevEnd}\n`);

  const [ph, sb] = await Promise.all([
    getPostHogData(period.start, period.end, period.prevStart, period.prevEnd),
    getSupabaseData(period.start, period.end, period.prevStart, period.prevEnd),
  ]);

  console.log(`\n✅ Data collected:`);
  console.log(`   Supabase: ${sb.jobsThisMonth.length} approved jobs, ${Object.keys(sb.companies).length} companies`);
  console.log(`   PostHog: ${ph.eventCounts.reduce((s: number, [, c]: [string, number]) => s + c, 0).toLocaleString()} total events\n`);

  const report = generateReport(period, ph, sb);

  const filename = `report-${period.start.slice(0, 7)}-data.md`;
  const outputPath = path.join(__dirname, filename);
  fs.writeFileSync(outputPath, report);

  console.log(`📄 Report saved to: scripts/${filename}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the data in the markdown file`);
  console.log(`   2. Use it to write the public-facing blog post and employer report`);
  console.log(`   3. Generate the PDF: node scripts/generate-pdf.mjs`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
