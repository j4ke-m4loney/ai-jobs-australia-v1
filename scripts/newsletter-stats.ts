/**
 * Newsletter Stats Script
 * Run with: npx tsx scripts/newsletter-stats.ts
 *
 * Pulls interesting statistics from the database for newsletter intro content
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface JobStats {
  totalJobs: number;
  jobsThisWeek: number;
  jobsLastWeek: number;
  weekOverWeekChange: number;
  byCategory: Record<string, number>;
  byLocationType: Record<string, number>;
  byLocation: Record<string, number>;
  byJobType: Record<string, number>;
  salaryStats: {
    avgMin: number;
    avgMax: number;
    highestMax: number;
    lowestMin: number;
    jobsWithSalary: number;
    jobsWithoutSalary: number;
  };
  salaryByCategory: Record<string, { avgMin: number; avgMax: number; count: number }>;
  salaryByLocationType: Record<string, { avgMin: number; avgMax: number; count: number }>;
  topCompanies: Array<{ name: string; jobCount: number }>;
  remotePercentage: number;
  hybridPercentage: number;
  onsitePercentage: number;
}

async function getNewsletterStats(): Promise<JobStats> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get all approved jobs
  const { data: allJobs, error: allJobsError } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      category,
      location,
      location_type,
      job_type,
      salary_min,
      salary_max,
      show_salary,
      created_at,
      company_id,
      companies (
        name
      )
    `)
    .eq('status', 'approved');

  if (allJobsError) {
    console.error('Error fetching jobs:', allJobsError);
    throw allJobsError;
  }

  const jobs = allJobs || [];

  // Jobs this week
  const jobsThisWeek = jobs.filter(j => new Date(j.created_at) >= oneWeekAgo);

  // Jobs last week (for comparison)
  const jobsLastWeek = jobs.filter(j => {
    const createdAt = new Date(j.created_at);
    return createdAt >= twoWeeksAgo && createdAt < oneWeekAgo;
  });

  // Week over week change
  const weekOverWeekChange = jobsLastWeek.length > 0
    ? ((jobsThisWeek.length - jobsLastWeek.length) / jobsLastWeek.length) * 100
    : 0;

  // By category
  const byCategory: Record<string, number> = {};
  jobsThisWeek.forEach(j => {
    const cat = j.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  // By location type
  const byLocationType: Record<string, number> = {};
  jobsThisWeek.forEach(j => {
    const loc = j.location_type || 'unknown';
    byLocationType[loc] = (byLocationType[loc] || 0) + 1;
  });

  // By location (extract city/state from location string)
  const byLocation: Record<string, number> = {};
  jobsThisWeek.forEach(j => {
    const location = j.location || 'Unknown';
    byLocation[location] = (byLocation[location] || 0) + 1;
  });

  // By job type (job_type is an array — count each type separately)
  const byJobType: Record<string, number> = {};
  jobsThisWeek.forEach(j => {
    const types = Array.isArray(j.job_type) ? j.job_type : [j.job_type || 'unknown'];
    types.forEach(t => { byJobType[t] = (byJobType[t] || 0) + 1; });
  });

  // Salary stats (from jobs with salary shown)
  const jobsWithSalary = jobsThisWeek.filter(j => j.show_salary && (j.salary_min || j.salary_max));
  const salaryMins = jobsWithSalary.filter(j => j.salary_min).map(j => j.salary_min);
  const salaryMaxs = jobsWithSalary.filter(j => j.salary_max).map(j => j.salary_max);

  const avgMin = salaryMins.length > 0 ? salaryMins.reduce((a, b) => a + b, 0) / salaryMins.length : 0;
  const avgMax = salaryMaxs.length > 0 ? salaryMaxs.reduce((a, b) => a + b, 0) / salaryMaxs.length : 0;
  const highestMax = salaryMaxs.length > 0 ? Math.max(...salaryMaxs) : 0;
  const lowestMin = salaryMins.length > 0 ? Math.min(...salaryMins) : 0;

  // Salary by category
  const salaryByCategory: Record<string, { avgMin: number; avgMax: number; count: number }> = {};
  jobsWithSalary.forEach(j => {
    const cat = j.category || 'other';
    if (!salaryByCategory[cat]) {
      salaryByCategory[cat] = { avgMin: 0, avgMax: 0, count: 0 };
    }
    salaryByCategory[cat].count++;
    if (j.salary_min) salaryByCategory[cat].avgMin += j.salary_min;
    if (j.salary_max) salaryByCategory[cat].avgMax += j.salary_max;
  });
  // Calculate averages
  Object.keys(salaryByCategory).forEach(cat => {
    const data = salaryByCategory[cat];
    if (data.count > 0) {
      data.avgMin = Math.round(data.avgMin / data.count);
      data.avgMax = Math.round(data.avgMax / data.count);
    }
  });

  // Salary by location type
  const salaryByLocationType: Record<string, { avgMin: number; avgMax: number; count: number }> = {};
  jobsWithSalary.forEach(j => {
    const loc = j.location_type || 'unknown';
    if (!salaryByLocationType[loc]) {
      salaryByLocationType[loc] = { avgMin: 0, avgMax: 0, count: 0 };
    }
    salaryByLocationType[loc].count++;
    if (j.salary_min) salaryByLocationType[loc].avgMin += j.salary_min;
    if (j.salary_max) salaryByLocationType[loc].avgMax += j.salary_max;
  });
  // Calculate averages
  Object.keys(salaryByLocationType).forEach(loc => {
    const data = salaryByLocationType[loc];
    if (data.count > 0) {
      data.avgMin = Math.round(data.avgMin / data.count);
      data.avgMax = Math.round(data.avgMax / data.count);
    }
  });

  // Top companies
  const companyJobCounts: Record<string, { name: string; count: number }> = {};
  jobsThisWeek.forEach(j => {
    const companyName = (j.companies as { name: string }[] | null)?.[0]?.name || 'Unknown';
    if (!companyJobCounts[companyName]) {
      companyJobCounts[companyName] = { name: companyName, count: 0 };
    }
    companyJobCounts[companyName].count++;
  });
  const topCompanies = Object.values(companyJobCounts)
    .filter(c => c.name !== 'Unknown')
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(c => ({ name: c.name, jobCount: c.count }));

  // Location type percentages
  const totalThisWeek = jobsThisWeek.length;
  const remoteCount = byLocationType['remote'] || 0;
  const hybridCount = byLocationType['hybrid'] || 0;
  const onsiteCount = byLocationType['onsite'] || 0;

  return {
    totalJobs: jobs.length,
    jobsThisWeek: totalThisWeek,
    jobsLastWeek: jobsLastWeek.length,
    weekOverWeekChange: Math.round(weekOverWeekChange),
    byCategory,
    byLocationType,
    byLocation,
    byJobType,
    salaryStats: {
      avgMin: Math.round(avgMin),
      avgMax: Math.round(avgMax),
      highestMax,
      lowestMin,
      jobsWithSalary: jobsWithSalary.length,
      jobsWithoutSalary: totalThisWeek - jobsWithSalary.length,
    },
    salaryByCategory,
    salaryByLocationType,
    topCompanies,
    remotePercentage: totalThisWeek > 0 ? Math.round((remoteCount / totalThisWeek) * 100) : 0,
    hybridPercentage: totalThisWeek > 0 ? Math.round((hybridCount / totalThisWeek) * 100) : 0,
    onsitePercentage: totalThisWeek > 0 ? Math.round((onsiteCount / totalThisWeek) * 100) : 0,
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount}`;
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    'ai': 'AI',
    'ml': 'Machine Learning',
    'data-science': 'Data Science',
    'engineering': 'Engineering',
    'research': 'Research',
  };
  return names[category] || category;
}

async function main() {
  console.log('\n📊 AI Jobs Australia - Newsletter Stats\n');
  console.log('='.repeat(50));

  try {
    const stats = await getNewsletterStats();

    // Summary
    console.log('\n📈 THIS WEEK\'S SUMMARY');
    console.log('-'.repeat(50));
    console.log(`Total jobs posted this week: ${stats.jobsThisWeek}`);
    console.log(`Jobs last week: ${stats.jobsLastWeek}`);
    console.log(`Week-over-week change: ${stats.weekOverWeekChange > 0 ? '+' : ''}${stats.weekOverWeekChange}%`);
    console.log(`Total approved jobs on platform: ${stats.totalJobs}`);

    // Location Type Breakdown
    console.log('\n🏢 WORK ARRANGEMENT');
    console.log('-'.repeat(50));
    console.log(`Remote: ${stats.byLocationType['remote'] || 0} jobs (${stats.remotePercentage}%)`);
    console.log(`Hybrid: ${stats.byLocationType['hybrid'] || 0} jobs (${stats.hybridPercentage}%)`);
    console.log(`On-site: ${stats.byLocationType['onsite'] || 0} jobs (${stats.onsitePercentage}%)`);

    // Category Breakdown
    console.log('\n📂 BY CATEGORY');
    console.log('-'.repeat(50));
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const percentage = Math.round((count / stats.jobsThisWeek) * 100);
        console.log(`${formatCategoryName(cat)}: ${count} jobs (${percentage}%)`);
      });

    // Location Breakdown
    console.log('\n📍 BY LOCATION');
    console.log('-'.repeat(50));
    Object.entries(stats.byLocation)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)  // Top 10 locations
      .forEach(([location, count]) => {
        console.log(`${location}: ${count} jobs`);
      });

    // Salary Stats
    console.log('\n💰 SALARY INSIGHTS');
    console.log('-'.repeat(50));
    console.log(`Jobs showing salary: ${stats.salaryStats.jobsWithSalary} of ${stats.jobsThisWeek}`);
    if (stats.salaryStats.jobsWithSalary > 0) {
      console.log(`Average salary range: ${formatCurrency(stats.salaryStats.avgMin)} - ${formatCurrency(stats.salaryStats.avgMax)}`);
      console.log(`Highest salary: ${formatCurrency(stats.salaryStats.highestMax)}`);
      console.log(`Lowest salary: ${formatCurrency(stats.salaryStats.lowestMin)}`);
    }

    // Salary by Category
    if (Object.keys(stats.salaryByCategory).length > 0) {
      console.log('\n💵 SALARY BY CATEGORY');
      console.log('-'.repeat(50));
      Object.entries(stats.salaryByCategory)
        .sort((a, b) => b[1].avgMax - a[1].avgMax)
        .forEach(([cat, data]) => {
          console.log(`${formatCategoryName(cat)}: ${formatCurrency(data.avgMin)} - ${formatCurrency(data.avgMax)} (${data.count} jobs)`);
        });
    }

    // Salary by Location Type
    if (Object.keys(stats.salaryByLocationType).length > 0) {
      console.log('\n💵 SALARY BY WORK ARRANGEMENT');
      console.log('-'.repeat(50));
      Object.entries(stats.salaryByLocationType)
        .sort((a, b) => b[1].avgMax - a[1].avgMax)
        .forEach(([loc, data]) => {
          const locName = loc.charAt(0).toUpperCase() + loc.slice(1);
          console.log(`${locName}: ${formatCurrency(data.avgMin)} - ${formatCurrency(data.avgMax)} (${data.count} jobs)`);
        });
    }

    // Top Companies
    if (stats.topCompanies.length > 0) {
      console.log('\n🏆 TOP HIRING COMPANIES');
      console.log('-'.repeat(50));
      stats.topCompanies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}: ${company.jobCount} ${company.jobCount === 1 ? 'job' : 'jobs'}`);
      });
    }

    // Job Type
    console.log('\n⏰ JOB TYPE');
    console.log('-'.repeat(50));
    Object.entries(stats.byJobType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const typeName = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
        console.log(`${typeName}: ${count} jobs`);
      });

    // Newsletter Copy Suggestions
    console.log('\n✍️  SUGGESTED NEWSLETTER COPY');
    console.log('='.repeat(50));

    console.log('\n📝 Option 1 (Stats-focused):');
    console.log(`"${stats.jobsThisWeek} new AI jobs landed this week. ${stats.remotePercentage}% are remote-friendly. Average salary? ${formatCurrency(stats.salaryStats.avgMin)} - ${formatCurrency(stats.salaryStats.avgMax)}. Let's dive in."`);

    console.log('\n📝 Option 2 (Trend-focused):');
    if (stats.weekOverWeekChange !== 0) {
      const direction = stats.weekOverWeekChange > 0 ? 'up' : 'down';
      console.log(`"AI hiring is ${direction} ${Math.abs(stats.weekOverWeekChange)}% this week. ${Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ? formatCategoryName(Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0][0]) : 'AI'} roles are leading the charge. Here's what's new."`);
    } else {
      console.log(`"Steady week for AI hiring with ${stats.jobsThisWeek} new roles. Here's what's new."`);
    }

    console.log('\n📝 Option 3 (Location-focused):');
    const topLocation = Object.entries(stats.byLocation).sort((a, b) => b[1] - a[1])[0];
    if (topLocation) {
      console.log(`"${topLocation[0]} leads this week with ${topLocation[1]} new AI roles. Remote-friendly positions make up ${stats.remotePercentage}% of all listings. Here's the breakdown."`);
    }

    console.log('\n📝 Option 4 (Salary-focused):');
    if (stats.salaryStats.jobsWithSalary > 0) {
      const topPaidCategory = Object.entries(stats.salaryByCategory).sort((a, b) => b[1].avgMax - a[1].avgMax)[0];
      if (topPaidCategory) {
        console.log(`"${formatCategoryName(topPaidCategory[0])} roles are topping the salary charts this week at ${formatCurrency(topPaidCategory[1].avgMin)} - ${formatCurrency(topPaidCategory[1].avgMax)} on average. ${stats.jobsThisWeek} new positions to explore."`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Done! Use these stats in your newsletter intro.\n');

  } catch (error) {
    console.error('Error fetching stats:', error);
    process.exit(1);
  }
}

main();
