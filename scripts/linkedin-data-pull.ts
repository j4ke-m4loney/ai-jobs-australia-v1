/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Date range for February 2026
  const fromDate = '2026-02-01';
  const toDate = '2026-02-26';

  // Pull all approved Feb jobs with relevant fields
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      id, title, category, location, location_type,
      salary_min, salary_max, salary_period, show_salary,
      ai_focus_percentage, ai_focus_confidence,
      interview_difficulty_level,
      autonomy_level, process_load,
      promotion_likelihood_signal,
      role_summary_one_liner,
      company_id,
      companies ( name )
    `)
    .eq('status', 'approved')
    .gte('created_at', fromDate)
    .lt('created_at', toDate);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log('No jobs found');
    process.exit(0);
  }

  console.log(`\n📊 Total approved Feb jobs: ${jobs.length}\n`);

  // ============================================================
  // 1. LEADERSHIP / MANAGEMENT ROLES
  // ============================================================
  const leadershipKeywords = /\b(head of|director|vp|vice president|chief|lead|principal|manager|senior manager|group lead|team lead|staff|distinguished)\b/i;
  const leadershipJobs = jobs.filter(j => leadershipKeywords.test(j.title));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`1. LEADERSHIP & MANAGEMENT ROLES`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total: ${leadershipJobs.length} out of ${jobs.length} (${(leadershipJobs.length / jobs.length * 100).toFixed(1)}%)`);
  console.log(`\nBreakdown by seniority keyword:`);

  const seniorityBuckets: Record<string, typeof jobs> = {};
  for (const j of leadershipJobs) {
    const titleLower = j.title.toLowerCase();
    let bucket = 'Other Senior';
    if (/\b(head of|director|vp|vice president|chief)\b/i.test(titleLower)) bucket = 'Executive (Head/Director/VP/Chief)';
    else if (/\b(principal|staff|distinguished)\b/i.test(titleLower)) bucket = 'Principal/Staff/Distinguished';
    else if (/\b(lead|team lead|group lead)\b/i.test(titleLower)) bucket = 'Lead/Team Lead';
    else if (/\b(manager|senior manager)\b/i.test(titleLower)) bucket = 'Manager/Senior Manager';
    if (!seniorityBuckets[bucket]) seniorityBuckets[bucket] = [];
    seniorityBuckets[bucket].push(j);
  }

  for (const [bucket, bjobs] of Object.entries(seniorityBuckets).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${bucket}: ${bjobs.length} roles`);
    for (const j of bjobs) {
      const company = (j.companies as any)?.name || 'Unknown';
      const salary = j.show_salary && j.salary_min && j.salary_max && j.salary_period === 'year'
        ? `$${Math.round(j.salary_min / 1000)}K-$${Math.round(j.salary_max / 1000)}K`
        : 'Salary not disclosed';
      console.log(`    - ${j.title} @ ${company} (${salary})`);
    }
  }

  // Leadership salary stats
  const leadershipWithSalary = leadershipJobs.filter(j => j.show_salary && j.salary_min && j.salary_max && j.salary_period === 'year');
  if (leadershipWithSalary.length > 0) {
    const avgMid = leadershipWithSalary.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2, 0) / leadershipWithSalary.length;
    console.log(`\n  Leadership avg salary midpoint: $${Math.round(avgMid).toLocaleString()} (${leadershipWithSalary.length} with salary disclosed)`);
  }

  // Leadership interview difficulty
  console.log(`\n  Interview difficulty for leadership roles:`);
  const leadershipDifficulty: Record<string, number> = {};
  for (const j of leadershipJobs) {
    const d = j.interview_difficulty_level || 'not_analysed';
    leadershipDifficulty[d] = (leadershipDifficulty[d] || 0) + 1;
  }
  for (const [d, count] of Object.entries(leadershipDifficulty).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${d}: ${count}`);
  }

  // ============================================================
  // 2. UNDERRATED CATEGORIES (not ML, Data Science, or AI General)
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`2. BEYOND ML & DATA SCIENCE — EMERGING CATEGORIES`);
  console.log(`${'='.repeat(60)}`);

  const emergingCategories = ['AI Governance', 'AI Automation', 'Strategy & Transformation', 'Product', 'Infrastructure', 'Teaching & Research', 'Sales'];
  for (const cat of emergingCategories) {
    const catJobs = jobs.filter(j => j.category === cat);
    if (catJobs.length === 0) continue;

    const withSalary = catJobs.filter(j => j.show_salary && j.salary_min && j.salary_max && j.salary_period === 'year');
    const avgMid = withSalary.length > 0
      ? withSalary.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2, 0) / withSalary.length
      : null;

    const remote = catJobs.filter(j => j.location_type === 'remote').length;
    const hybrid = catJobs.filter(j => j.location_type === 'hybrid').length;
    const onsite = catJobs.filter(j => j.location_type === 'onsite').length;

    const difficulties: Record<string, number> = {};
    const autonomyLevels: Record<string, number> = {};
    const promotionLevels: Record<string, number> = {};

    for (const j of catJobs) {
      if (j.interview_difficulty_level) difficulties[j.interview_difficulty_level] = (difficulties[j.interview_difficulty_level] || 0) + 1;
      if (j.autonomy_level) autonomyLevels[j.autonomy_level] = (autonomyLevels[j.autonomy_level] || 0) + 1;
      if (j.promotion_likelihood_signal) promotionLevels[j.promotion_likelihood_signal] = (promotionLevels[j.promotion_likelihood_signal] || 0) + 1;
    }

    const avgAiFocus = catJobs.filter(j => j.ai_focus_percentage != null).reduce((sum, j) => sum + j.ai_focus_percentage, 0) / catJobs.filter(j => j.ai_focus_percentage != null).length;

    console.log(`\n  📁 ${cat}: ${catJobs.length} roles`);
    console.log(`     Salary: ${avgMid ? `$${Math.round(avgMid).toLocaleString()} avg midpoint (${withSalary.length} disclosed)` : 'No salaries disclosed'}`);
    console.log(`     Location: ${remote} remote / ${hybrid} hybrid / ${onsite} onsite`);
    console.log(`     Avg AI Focus: ${avgAiFocus.toFixed(0)}%`);
    console.log(`     Interview difficulty: ${Object.entries(difficulties).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log(`     Autonomy: ${Object.entries(autonomyLevels).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log(`     Promotion signal: ${Object.entries(promotionLevels).map(([k, v]) => `${k}=${v}`).join(', ')}`);

    // Show companies hiring in this category
    const companies = catJobs.map(j => (j.companies as any)?.name).filter(Boolean);
    const companyCounts: Record<string, number> = {};
    for (const c of companies) companyCounts[c] = (companyCounts[c] || 0) + 1;
    const topCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log(`     Top companies: ${topCompanies.map(([name, count]) => `${name} (${count})`).join(', ')}`);
  }

  // ============================================================
  // 3. CROSS-TAB: INTERVIEW DIFFICULTY × CATEGORY (all categories)
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`3. INTERVIEW DIFFICULTY BY CATEGORY`);
  console.log(`${'='.repeat(60)}`);

  const categories = [...new Set(jobs.map(j => j.category).filter(Boolean))].sort();
  for (const cat of categories) {
    const catJobs = jobs.filter(j => j.category === cat && j.interview_difficulty_level);
    if (catJobs.length === 0) continue;
    const counts: Record<string, number> = {};
    for (const j of catJobs) counts[j.interview_difficulty_level] = (counts[j.interview_difficulty_level] || 0) + 1;
    const hardPct = ((counts['hard'] || 0) + (counts['very_hard'] || 0)) / catJobs.length * 100;
    console.log(`  ${cat.padEnd(30)} | ${catJobs.length} roles | ${hardPct.toFixed(0)}% hard/very hard | ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }

  // ============================================================
  // 4. CROSS-TAB: AUTONOMY × CATEGORY
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`4. AUTONOMY BY CATEGORY`);
  console.log(`${'='.repeat(60)}`);

  for (const cat of categories) {
    const catJobs = jobs.filter(j => j.category === cat && j.autonomy_level);
    if (catJobs.length === 0) continue;
    const counts: Record<string, number> = {};
    for (const j of catJobs) counts[j.autonomy_level] = (counts[j.autonomy_level] || 0) + 1;
    const highPct = (counts['high'] || 0) / catJobs.length * 100;
    console.log(`  ${cat.padEnd(30)} | ${catJobs.length} roles | ${highPct.toFixed(0)}% high autonomy | ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }

  // ============================================================
  // 5. CROSS-TAB: PROMOTION × CATEGORY
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`5. PROMOTION LIKELIHOOD BY CATEGORY`);
  console.log(`${'='.repeat(60)}`);

  for (const cat of categories) {
    const catJobs = jobs.filter(j => j.category === cat && j.promotion_likelihood_signal);
    if (catJobs.length === 0) continue;
    const counts: Record<string, number> = {};
    for (const j of catJobs) counts[j.promotion_likelihood_signal] = (counts[j.promotion_likelihood_signal] || 0) + 1;
    const highPct = (counts['high'] || 0) / catJobs.length * 100;
    console.log(`  ${cat.padEnd(30)} | ${catJobs.length} roles | ${highPct.toFixed(0)}% high promotion | ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }

  // ============================================================
  // 6. BRAND DEMAND vs SUPPLY (company searches from report vs listings)
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`6. COMPANY LISTINGS COUNT (for demand/supply comparison)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  (Compare with PostHog search data: Quantium=12, EY=5, NTT Data=4, Bankwest=4, Mantel Group=4)`);

  const companySearched = ['Quantium', 'EY', 'NTT Data', 'Bankwest', 'Mantel Group'];
  for (const name of companySearched) {
    const count = jobs.filter(j => (j.companies as any)?.name?.toLowerCase().includes(name.toLowerCase())).length;
    console.log(`  ${name.padEnd(20)} | ${count} listings posted`);
  }

  // ============================================================
  // 7. SALARY BY SENIORITY LEVEL
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`7. SALARY BY SENIORITY LEVEL`);
  console.log(`${'='.repeat(60)}`);

  const seniorityLevels = [
    { label: 'Junior/Graduate/Intern', pattern: /\b(junior|graduate|intern|entry.level|trainee)\b/i },
    { label: 'Mid-level (no seniority prefix)', pattern: null }, // catch-all
    { label: 'Senior', pattern: /\bsenior\b/i },
    { label: 'Lead/Principal/Staff', pattern: /\b(lead|principal|staff|distinguished)\b/i },
    { label: 'Head/Director/VP/Chief', pattern: /\b(head of|director|vp|vice president|chief|cto|cdo)\b/i },
    { label: 'Manager', pattern: /\bmanager\b/i },
  ];

  for (const level of seniorityLevels) {
    let filtered: typeof jobs;
    if (level.pattern === null) {
      // Mid-level = doesn't match any other pattern
      const allPatterns = seniorityLevels.filter(l => l.pattern).map(l => l.pattern!);
      filtered = jobs.filter(j => !allPatterns.some(p => p.test(j.title)));
    } else {
      filtered = jobs.filter(j => level.pattern!.test(j.title));
    }

    const withSalary = filtered.filter(j => j.show_salary && j.salary_min && j.salary_max && j.salary_period === 'year');
    const avgMid = withSalary.length > 0
      ? withSalary.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2, 0) / withSalary.length
      : null;

    console.log(`  ${level.label.padEnd(35)} | ${filtered.length} roles | ${withSalary.length} with salary | ${avgMid ? `$${Math.round(avgMid).toLocaleString()} avg midpoint` : 'No salary data'}`);
  }

  // ============================================================
  // 8. MOST UNIQUE / SURPRISING ROLE TITLES
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`8. INTERESTING / NON-STANDARD JOB TITLES`);
  console.log(`${'='.repeat(60)}`);

  const commonTitles = /\b(data scientist|data engineer|ml engineer|machine learning engineer|ai engineer|software engineer|data analyst)\b/i;
  const unusualJobs = jobs.filter(j => !commonTitles.test(j.title));
  console.log(`  ${unusualJobs.length} roles with non-standard titles (out of ${jobs.length}):\n`);
  for (const j of unusualJobs.slice(0, 30)) {
    const company = (j.companies as any)?.name || 'Unknown';
    console.log(`  - ${j.title} @ ${company} [${j.category}]`);
  }

  // ============================================================
  // 9. AI FOCUS SCORE EXTREMES
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`9. AI FOCUS SCORE — HIGHEST & LOWEST`);
  console.log(`${'='.repeat(60)}`);

  const withAiFocus = jobs.filter(j => j.ai_focus_percentage != null).sort((a, b) => b.ai_focus_percentage - a.ai_focus_percentage);
  console.log(`\n  Top 5 most AI-focused:`);
  for (const j of withAiFocus.slice(0, 5)) {
    console.log(`    ${j.ai_focus_percentage}% — ${j.title} @ ${(j.companies as any)?.name} [${j.category}]`);
  }
  console.log(`\n  Bottom 5 least AI-focused (still on an AI job board):`);
  for (const j of withAiFocus.slice(-5).reverse()) {
    console.log(`    ${j.ai_focus_percentage}% — ${j.title} @ ${(j.companies as any)?.name} [${j.category}]`);
  }

  // ============================================================
  // 10. WHICH CATEGORIES PAY THE MOST vs LEAST (full breakdown)
  // ============================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`10. FULL SALARY BY CATEGORY (all categories with data)`);
  console.log(`${'='.repeat(60)}`);

  for (const cat of categories) {
    const catJobs = jobs.filter(j => j.category === cat && j.show_salary && j.salary_min && j.salary_max && j.salary_period === 'year');
    if (catJobs.length === 0) continue;
    const avgMid = catJobs.reduce((sum, j) => sum + (j.salary_min + j.salary_max) / 2, 0) / catJobs.length;
    const minSalary = Math.min(...catJobs.map(j => j.salary_min));
    const maxSalary = Math.max(...catJobs.map(j => j.salary_max));
    console.log(`  ${cat.padEnd(30)} | ${catJobs.length} roles | $${Math.round(avgMid).toLocaleString()} midpoint | $${Math.round(minSalary / 1000)}K-$${Math.round(maxSalary / 1000)}K range`);
  }

  console.log(`\n✅ Done\n`);
}

run().catch(console.error);
