-- ============================================================
-- AI Jobs Australia - Monthly Report: February 2026 (MTD)
-- Run in Supabase SQL Editor
-- Period: 1 Feb 2026 - 17 Feb 2026
-- ============================================================

-- ============================================================
-- 1. HEADLINE NUMBERS
-- ============================================================
SELECT
  '1. HEADLINE NUMBERS' AS section,
  COUNT(*) FILTER (WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18') AS jobs_posted_this_month,
  COUNT(*) FILTER (WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18' AND status = 'approved') AS jobs_approved_this_month,
  COUNT(*) FILTER (WHERE status = 'approved') AS total_active_jobs,
  COUNT(*) FILTER (WHERE status = 'approved' AND is_featured = true AND featured_until > NOW()) AS currently_featured,
  COUNT(*) FILTER (WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01' AND status = 'approved') AS jobs_approved_last_month
FROM jobs;

-- ============================================================
-- 2. JOBS BY CATEGORY
-- ============================================================
SELECT
  '2. JOBS BY CATEGORY' AS section,
  category,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY category
ORDER BY job_count DESC;

-- ============================================================
-- 3. JOBS BY STATE (extracted from location text)
-- ============================================================
SELECT
  '3. JOBS BY STATE' AS section,
  COALESCE(
    CASE
      WHEN location ~* '\bNSW\b' THEN 'NSW'
      WHEN location ~* '\bVIC\b' THEN 'VIC'
      WHEN location ~* '\bQLD\b' THEN 'QLD'
      WHEN location ~* '\bWA\b' THEN 'WA'
      WHEN location ~* '\bSA\b' THEN 'SA'
      WHEN location ~* '\bTAS\b' THEN 'TAS'
      WHEN location ~* '\bACT\b' THEN 'ACT'
      WHEN location ~* '\bNT\b' THEN 'NT'
      WHEN location ~* '\bSydney\b' THEN 'NSW'
      WHEN location ~* '\bMelbourne\b' THEN 'VIC'
      WHEN location ~* '\bBrisbane\b' THEN 'QLD'
      WHEN location ~* '\bPerth\b' THEN 'WA'
      WHEN location ~* '\bAdelaide\b' THEN 'SA'
      WHEN location ~* '\bHobart\b' THEN 'TAS'
      WHEN location ~* '\bCanberra\b' THEN 'ACT'
      WHEN location ~* '\bDarwin\b' THEN 'NT'
      WHEN location_type = 'remote' THEN 'Remote'
      ELSE NULL
    END,
    'Not specified'
  ) AS derived_state,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY derived_state
ORDER BY job_count DESC;

-- ============================================================
-- 4. JOBS BY LOCATION TYPE (Remote / Hybrid / Onsite)
-- ============================================================
SELECT
  '4. LOCATION TYPE' AS section,
  COALESCE(location_type, 'Not specified') AS location_type,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY location_type
ORDER BY job_count DESC;

-- ============================================================
-- 5. JOBS BY EMPLOYMENT TYPE
-- ============================================================
SELECT
  '5. EMPLOYMENT TYPE' AS section,
  COALESCE(job_type, 'Not specified') AS job_type,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY job_type
ORDER BY job_count DESC;

-- ============================================================
-- 6. SALARY INSIGHTS (annual salaries only, where disclosed)
-- ============================================================
SELECT
  '6a. SALARY OVERVIEW' AS section,
  COUNT(*) AS jobs_with_salary,
  ROUND(AVG(salary_min)) AS avg_min_salary,
  ROUND(AVG(salary_max)) AS avg_max_salary,
  ROUND(AVG((salary_min + salary_max) / 2.0)) AS avg_midpoint,
  MIN(salary_min) AS lowest_min,
  MAX(salary_max) AS highest_max
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
  AND salary_min IS NOT NULL
  AND salary_max IS NOT NULL
  AND salary_period = 'year'
  AND show_salary = true;

-- Salary by category
SELECT
  '6b. SALARY BY CATEGORY' AS section,
  category,
  COUNT(*) AS jobs_with_salary,
  ROUND(AVG(salary_min)) AS avg_min,
  ROUND(AVG(salary_max)) AS avg_max,
  ROUND(AVG((salary_min + salary_max) / 2.0)) AS avg_midpoint
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
  AND salary_min IS NOT NULL
  AND salary_max IS NOT NULL
  AND salary_period = 'year'
  AND show_salary = true
GROUP BY category
ORDER BY avg_midpoint DESC;

-- Salary by state (extracted from location text)
SELECT
  '6c. SALARY BY STATE' AS section,
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
  END AS derived_state,
  COUNT(*) AS jobs_with_salary,
  ROUND(AVG(salary_min)) AS avg_min,
  ROUND(AVG(salary_max)) AS avg_max,
  ROUND(AVG((salary_min + salary_max) / 2.0)) AS avg_midpoint
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
  AND salary_min IS NOT NULL
  AND salary_max IS NOT NULL
  AND salary_period = 'year'
  AND show_salary = true
GROUP BY derived_state
ORDER BY avg_midpoint DESC;

-- ============================================================
-- 7. TOP HIRING COMPANIES
-- ============================================================
SELECT
  '7. TOP HIRING COMPANIES' AS section,
  c.name AS company_name,
  COUNT(*) AS jobs_posted
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.status = 'approved'
  AND j.created_at >= '2026-02-01'
  AND j.created_at < '2026-02-18'
GROUP BY c.name
ORDER BY jobs_posted DESC
LIMIT 15;

-- ============================================================
-- 8. AI FOCUS SCORE DISTRIBUTION
-- ============================================================
SELECT
  '8. AI FOCUS DISTRIBUTION' AS section,
  CASE
    WHEN ai_focus_percentage >= 80 THEN 'Core AI/ML (80-100%)'
    WHEN ai_focus_percentage >= 60 THEN 'Strong AI/ML (60-79%)'
    WHEN ai_focus_percentage >= 40 THEN 'Moderate AI/ML (40-59%)'
    WHEN ai_focus_percentage >= 20 THEN 'Light AI/ML (20-39%)'
    ELSE 'Minimal AI/ML (0-19%)'
  END AS ai_focus_band,
  COUNT(*) AS job_count,
  ROUND(AVG(ai_focus_percentage), 1) AS avg_score_in_band
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
  AND ai_focus_percentage IS NOT NULL
GROUP BY
  CASE
    WHEN ai_focus_percentage >= 80 THEN 'Core AI/ML (80-100%)'
    WHEN ai_focus_percentage >= 60 THEN 'Strong AI/ML (60-79%)'
    WHEN ai_focus_percentage >= 40 THEN 'Moderate AI/ML (40-59%)'
    WHEN ai_focus_percentage >= 20 THEN 'Light AI/ML (20-39%)'
    ELSE 'Minimal AI/ML (0-19%)'
  END
ORDER BY avg_score_in_band DESC;

-- Average AI Focus Score
SELECT
  '8b. AVG AI FOCUS SCORE' AS section,
  ROUND(AVG(ai_focus_percentage), 1) AS overall_avg_ai_focus,
  COUNT(*) AS jobs_analysed
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
  AND ai_focus_percentage IS NOT NULL;

-- ============================================================
-- 9. INTERVIEW DIFFICULTY DISTRIBUTION
-- ============================================================
SELECT
  '9. INTERVIEW DIFFICULTY' AS section,
  COALESCE(interview_difficulty_level, 'Not analysed') AS difficulty,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY interview_difficulty_level
ORDER BY
  CASE interview_difficulty_level
    WHEN 'easy' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'hard' THEN 3
    WHEN 'very_hard' THEN 4
    ELSE 5
  END;

-- ============================================================
-- 10. AUTONOMY vs PROCESS
-- ============================================================
SELECT
  '10. AUTONOMY LEVEL' AS section,
  COALESCE(autonomy_level, 'Not analysed') AS autonomy,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY autonomy_level
ORDER BY job_count DESC;

-- ============================================================
-- 11. PROMOTION LIKELIHOOD
-- ============================================================
SELECT
  '11. PROMOTION LIKELIHOOD' AS section,
  COALESCE(promotion_likelihood_signal, 'Not analysed') AS promotion_signal,
  COUNT(*) AS job_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY promotion_likelihood_signal
ORDER BY job_count DESC;

-- ============================================================
-- 12. SALARY TRANSPARENCY RATE
-- ============================================================
SELECT
  '12. SALARY TRANSPARENCY' AS section,
  COUNT(*) AS total_approved_jobs,
  COUNT(*) FILTER (WHERE show_salary = true AND salary_min IS NOT NULL) AS jobs_showing_salary,
  ROUND(
    COUNT(*) FILTER (WHERE show_salary = true AND salary_min IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) AS transparency_rate_pct
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18';

-- ============================================================
-- 13. REMOTE WORK BY CATEGORY
-- ============================================================
SELECT
  '13. REMOTE WORK BY CATEGORY' AS section,
  category,
  COUNT(*) AS total_jobs,
  COUNT(*) FILTER (WHERE location_type = 'remote') AS remote_jobs,
  ROUND(
    COUNT(*) FILTER (WHERE location_type = 'remote') * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) AS remote_pct,
  COUNT(*) FILTER (WHERE location_type = 'hybrid') AS hybrid_jobs,
  ROUND(
    COUNT(*) FILTER (WHERE location_type = 'hybrid') * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) AS hybrid_pct
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY category
ORDER BY total_jobs DESC;

-- ============================================================
-- 14. MOST COMMON JOB TITLES (normalised)
-- ============================================================
SELECT
  '14. TOP JOB TITLES' AS section,
  title,
  COUNT(*) AS occurrences
FROM jobs
WHERE status = 'approved'
  AND created_at >= '2026-02-01'
  AND created_at < '2026-02-18'
GROUP BY title
ORDER BY occurrences DESC
LIMIT 20;

-- ============================================================
-- 15. MONTH-OVER-MONTH COMPARISON
-- ============================================================
SELECT
  '15. MONTH-OVER-MONTH' AS section,
  'January 2026' AS period,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_jobs,
  COUNT(*) FILTER (WHERE status = 'approved' AND show_salary = true AND salary_min IS NOT NULL) AS with_salary,
  ROUND(AVG(CASE WHEN salary_period = 'year' AND show_salary = true THEN (salary_min + salary_max) / 2.0 END)) AS avg_salary_midpoint,
  COUNT(DISTINCT company_id) FILTER (WHERE status = 'approved') AS unique_companies
FROM jobs
WHERE created_at >= '2026-01-01' AND created_at < '2026-02-01'

UNION ALL

SELECT
  '15. MONTH-OVER-MONTH' AS section,
  'February 2026 (MTD)' AS period,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_jobs,
  COUNT(*) FILTER (WHERE status = 'approved' AND show_salary = true AND salary_min IS NOT NULL) AS with_salary,
  ROUND(AVG(CASE WHEN salary_period = 'year' AND show_salary = true THEN (salary_min + salary_max) / 2.0 END)) AS avg_salary_midpoint,
  COUNT(DISTINCT company_id) FILTER (WHERE status = 'approved') AS unique_companies
FROM jobs
WHERE created_at >= '2026-02-01' AND created_at < '2026-02-18';

-- ============================================================
-- 16. PLATFORM GROWTH METRICS
-- ============================================================
SELECT
  '16. PLATFORM GROWTH' AS section,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'job_seeker') AS total_job_seekers,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'employer') AS total_employers,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'job_seeker' AND created_at >= '2026-02-01' AND created_at < '2026-02-18') AS new_seekers_this_month,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'employer' AND created_at >= '2026-02-01' AND created_at < '2026-02-18') AS new_employers_this_month,
  (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'intelligence' AND status = 'active') AS active_intelligence_subs,
  (SELECT COUNT(*) FROM newsletter_campaigns WHERE sent_at >= '2026-02-01' AND sent_at < '2026-02-18') AS newsletters_sent_this_month;

-- ============================================================
-- 17. APPLICATION ACTIVITY
-- ============================================================
SELECT
  '17. APPLICATION ACTIVITY' AS section,
  COUNT(*) AS total_applications_this_month,
  COUNT(DISTINCT applicant_id) AS unique_applicants,
  COUNT(DISTINCT job_id) AS jobs_applied_to,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT job_id), 0), 1) AS avg_applications_per_job
FROM job_applications
WHERE created_at >= '2026-02-01'
  AND created_at < '2026-02-18';
