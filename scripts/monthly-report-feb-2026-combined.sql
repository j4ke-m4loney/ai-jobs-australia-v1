-- ============================================================
-- AI Jobs Australia - Monthly Report: February 2026 (MTD)
-- Single combined query - run all at once in Supabase SQL Editor
-- ============================================================

WITH
-- 1. HEADLINE NUMBERS
headlines AS (
  SELECT
    '01_HEADLINES' AS section,
    'jobs_posted_this_month' AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18'
  UNION ALL
  SELECT '01_HEADLINES', 'jobs_approved_this_month',
    COUNT(*)::text
  FROM jobs
  WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18' AND status = 'approved'
  UNION ALL
  SELECT '01_HEADLINES', 'total_active_jobs',
    COUNT(*)::text
  FROM jobs WHERE status = 'approved'
  UNION ALL
  SELECT '01_HEADLINES', 'currently_featured',
    COUNT(*)::text
  FROM jobs WHERE status = 'approved' AND is_featured = true AND featured_until > NOW()
  UNION ALL
  SELECT '01_HEADLINES', 'jobs_approved_jan_2026',
    COUNT(*)::text
  FROM jobs WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01' AND status = 'approved'
),

-- 2. JOBS BY CATEGORY
by_category AS (
  SELECT
    '02_CATEGORY' AS section,
    COALESCE(category, 'Not specified') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY category
),

-- 3. JOBS BY STATE
by_state AS (
  SELECT
    '03_STATE' AS section,
    COALESCE(
      CASE
        WHEN location ~* '\bNSW\b' OR location ~* '\bSydney\b' THEN 'NSW'
        WHEN location ~* '\bVIC\b' OR location ~* '\bMelbourne\b' THEN 'VIC'
        WHEN location ~* '\bQLD\b' OR location ~* '\bBrisbane\b' THEN 'QLD'
        WHEN location ~* '\bWA\b' OR location ~* '\bPerth\b' THEN 'WA'
        WHEN location ~* '\bSA\b' OR location ~* '\bAdelaide\b' THEN 'SA'
        WHEN location ~* '\bTAS\b' OR location ~* '\bHobart\b' THEN 'TAS'
        WHEN location ~* '\bACT\b' OR location ~* '\bCanberra\b' THEN 'ACT'
        WHEN location ~* '\bNT\b' OR location ~* '\bDarwin\b' THEN 'NT'
        WHEN location_type = 'remote' THEN 'Remote'
        ELSE NULL
      END,
      'Not specified'
    ) AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY metric
),

-- 4. LOCATION TYPE
by_location_type AS (
  SELECT
    '04_LOCATION_TYPE' AS section,
    COALESCE(location_type, 'Not specified') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY location_type
),

-- 5. EMPLOYMENT TYPE
by_job_type AS (
  SELECT
    '05_JOB_TYPE' AS section,
    COALESCE(job_type, 'Not specified') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY job_type
),

-- 6a. SALARY OVERVIEW (annual, disclosed only)
salary_overview AS (
  SELECT '06a_SALARY', 'jobs_with_salary', COUNT(*)::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  UNION ALL
  SELECT '06a_SALARY', 'avg_min_salary', ROUND(AVG(salary_min))::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  UNION ALL
  SELECT '06a_SALARY', 'avg_max_salary', ROUND(AVG(salary_max))::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  UNION ALL
  SELECT '06a_SALARY', 'avg_midpoint', ROUND(AVG((salary_min + salary_max) / 2.0))::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  UNION ALL
  SELECT '06a_SALARY', 'lowest_min', MIN(salary_min)::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  UNION ALL
  SELECT '06a_SALARY', 'highest_max', MAX(salary_max)::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
),

-- 6b. SALARY BY CATEGORY
salary_by_cat AS (
  SELECT
    '06b_SALARY_BY_CAT' AS section,
    COALESCE(category, 'Unknown') AS metric,
    COUNT(*) || ' jobs | avg_min=' || ROUND(AVG(salary_min))::text || ' | avg_max=' || ROUND(AVG(salary_max))::text || ' | midpoint=' || ROUND(AVG((salary_min + salary_max) / 2.0))::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  GROUP BY category
),

-- 6c. SALARY BY STATE
salary_by_state AS (
  SELECT
    '06c_SALARY_BY_STATE' AS section,
    CASE
      WHEN location ~* '\bNSW\b' OR location ~* '\bSydney\b' THEN 'NSW'
      WHEN location ~* '\bVIC\b' OR location ~* '\bMelbourne\b' THEN 'VIC'
      WHEN location ~* '\bQLD\b' OR location ~* '\bBrisbane\b' THEN 'QLD'
      WHEN location ~* '\bWA\b' OR location ~* '\bPerth\b' THEN 'WA'
      WHEN location ~* '\bSA\b' OR location ~* '\bAdelaide\b' THEN 'SA'
      WHEN location ~* '\bTAS\b' OR location ~* '\bHobart\b' THEN 'TAS'
      WHEN location ~* '\bACT\b' OR location ~* '\bCanberra\b' THEN 'ACT'
      WHEN location ~* '\bNT\b' OR location ~* '\bDarwin\b' THEN 'NT'
      ELSE 'Other'
    END AS metric,
    COUNT(*) || ' jobs | avg_min=' || ROUND(AVG(salary_min))::text || ' | avg_max=' || ROUND(AVG(salary_max))::text || ' | midpoint=' || ROUND(AVG((salary_min + salary_max) / 2.0))::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_period = 'year' AND show_salary = true
  GROUP BY metric
),

-- 7. TOP HIRING COMPANIES
top_companies AS (
  SELECT
    '07_TOP_COMPANIES' AS section,
    c.name AS metric,
    COUNT(*)::text AS value
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  WHERE j.status = 'approved' AND j.created_at >= '2026-02-01' AND j.created_at < '2026-02-18'
  GROUP BY c.name
  ORDER BY COUNT(*) DESC
  LIMIT 15
),

-- 8. AI FOCUS DISTRIBUTION
ai_focus AS (
  SELECT
    '08_AI_FOCUS' AS section,
    CASE
      WHEN ai_focus_percentage >= 80 THEN 'Core AI/ML (80-100%)'
      WHEN ai_focus_percentage >= 60 THEN 'Strong AI/ML (60-79%)'
      WHEN ai_focus_percentage >= 40 THEN 'Moderate AI/ML (40-59%)'
      WHEN ai_focus_percentage >= 20 THEN 'Light AI/ML (20-39%)'
      ELSE 'Minimal AI/ML (0-19%)'
    END AS metric,
    COUNT(*) || ' jobs | avg_score=' || ROUND(AVG(ai_focus_percentage), 1)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND ai_focus_percentage IS NOT NULL
  GROUP BY metric
),

-- 8b. AVG AI FOCUS
avg_ai_focus AS (
  SELECT
    '08b_AVG_AI_FOCUS' AS section,
    'overall_avg' AS metric,
    ROUND(AVG(ai_focus_percentage), 1)::text || ' (from ' || COUNT(*)::text || ' jobs)' AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND ai_focus_percentage IS NOT NULL
),

-- 9. INTERVIEW DIFFICULTY
interview_diff AS (
  SELECT
    '09_INTERVIEW_DIFF' AS section,
    COALESCE(interview_difficulty_level, 'Not analysed') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY interview_difficulty_level
),

-- 10. AUTONOMY LEVEL
autonomy AS (
  SELECT
    '10_AUTONOMY' AS section,
    COALESCE(autonomy_level, 'Not analysed') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY autonomy_level
),

-- 11. PROMOTION LIKELIHOOD
promotion AS (
  SELECT
    '11_PROMOTION' AS section,
    COALESCE(promotion_likelihood_signal, 'Not analysed') AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY promotion_likelihood_signal
),

-- 12. SALARY TRANSPARENCY
salary_transparency AS (
  SELECT '12_TRANSPARENCY', 'total_approved',
    COUNT(*)::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  UNION ALL
  SELECT '12_TRANSPARENCY', 'showing_salary',
    COUNT(*)::text
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
    AND show_salary = true AND salary_min IS NOT NULL
),

-- 13. REMOTE BY CATEGORY
remote_by_cat AS (
  SELECT
    '13_REMOTE_BY_CAT' AS section,
    COALESCE(category, 'Unknown') AS metric,
    COUNT(*) || ' total | ' ||
    COUNT(*) FILTER (WHERE location_type = 'remote') || ' remote | ' ||
    COUNT(*) FILTER (WHERE location_type = 'hybrid') || ' hybrid | ' ||
    COUNT(*) FILTER (WHERE location_type = 'onsite') || ' onsite' AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY category
),

-- 14. TOP JOB TITLES
top_titles AS (
  SELECT
    '14_TOP_TITLES' AS section,
    title AS metric,
    COUNT(*)::text AS value
  FROM jobs
  WHERE status = 'approved' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  GROUP BY title
  ORDER BY COUNT(*) DESC
  LIMIT 20
),

-- 15. MONTH-OVER-MONTH
mom_jan AS (
  SELECT
    '15_MOM' AS section,
    'jan_approved' AS metric, COUNT(*)::text AS value
  FROM jobs WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01' AND status = 'approved'
  UNION ALL
  SELECT '15_MOM', 'jan_with_salary',
    COUNT(*)::text
  FROM jobs WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01' AND status = 'approved' AND show_salary = true AND salary_min IS NOT NULL
  UNION ALL
  SELECT '15_MOM', 'jan_unique_companies',
    COUNT(DISTINCT company_id)::text
  FROM jobs WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01' AND status = 'approved'
  UNION ALL
  SELECT '15_MOM', 'feb_approved',
    COUNT(*)::text
  FROM jobs WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18' AND status = 'approved'
  UNION ALL
  SELECT '15_MOM', 'feb_with_salary',
    COUNT(*)::text
  FROM jobs WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18' AND status = 'approved' AND show_salary = true AND salary_min IS NOT NULL
  UNION ALL
  SELECT '15_MOM', 'feb_unique_companies',
    COUNT(DISTINCT company_id)::text
  FROM jobs WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18' AND status = 'approved'
),

-- 16. PLATFORM GROWTH
platform AS (
  SELECT '16_PLATFORM', 'total_job_seekers', COUNT(*)::text FROM profiles WHERE user_type = 'job_seeker'
  UNION ALL
  SELECT '16_PLATFORM', 'total_employers', COUNT(*)::text FROM profiles WHERE user_type = 'employer'
  UNION ALL
  SELECT '16_PLATFORM', 'new_seekers_feb', COUNT(*)::text FROM profiles WHERE user_type = 'job_seeker' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  UNION ALL
  SELECT '16_PLATFORM', 'new_employers_feb', COUNT(*)::text FROM profiles WHERE user_type = 'employer' AND created_at >= '2026-02-01' AND created_at < '2026-02-18'
  UNION ALL
  SELECT '16_PLATFORM', 'active_intelligence_subs', COUNT(*)::text FROM subscriptions WHERE plan_type = 'intelligence' AND status = 'active'
  UNION ALL
  SELECT '16_PLATFORM', 'newsletters_sent_feb', COUNT(*)::text FROM newsletter_campaigns WHERE sent_at >= '2026-02-01' AND sent_at < '2026-02-18'
)

-- COMBINE ALL
SELECT * FROM headlines
UNION ALL SELECT * FROM by_category
UNION ALL SELECT * FROM by_state
UNION ALL SELECT * FROM by_location_type
UNION ALL SELECT * FROM by_job_type
UNION ALL SELECT * FROM salary_overview
UNION ALL SELECT * FROM salary_by_cat
UNION ALL SELECT * FROM salary_by_state
UNION ALL SELECT * FROM top_companies
UNION ALL SELECT * FROM ai_focus
UNION ALL SELECT * FROM avg_ai_focus
UNION ALL SELECT * FROM interview_diff
UNION ALL SELECT * FROM autonomy
UNION ALL SELECT * FROM promotion
UNION ALL SELECT * FROM salary_transparency
UNION ALL SELECT * FROM remote_by_cat
UNION ALL SELECT * FROM top_titles
UNION ALL SELECT * FROM mom_jan
UNION ALL SELECT * FROM platform
ORDER BY section, metric;
