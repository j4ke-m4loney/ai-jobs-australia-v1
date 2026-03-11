-- Normalise all job category values to canonical kebab-case slugs
-- This fixes inconsistent data like "Strategy & Transformation" vs "strategy-transformation"
--
-- Run this in Supabase SQL Editor.
-- Run each step in order.

-- 1. Preview: Show all non-slug category values and what they'll be normalised to
SELECT
  category AS current_value,
  LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER(category), '&', '', 'g'),
            '[^a-z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'),
        '-+', '-', 'g'),
      '^-|-$', '', 'g')
  ) AS normalised_value,
  COUNT(*) AS job_count
FROM jobs
WHERE category IS NOT NULL
  AND category != LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER(category), '&', '', 'g'),
            '[^a-z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'),
        '-+', '-', 'g'),
      '^-|-$', '', 'g')
  )
GROUP BY category
ORDER BY category;

-- 2. Normalise all category values to kebab-case slugs
UPDATE jobs
SET category = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(LOWER(category), '&', '', 'g'),
          '[^a-z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'),
      '-+', '-', 'g'),
    '^-|-$', '', 'g')
)
WHERE category IS NOT NULL
  AND category != LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER(category), '&', '', 'g'),
            '[^a-z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'),
        '-+', '-', 'g'),
      '^-|-$', '', 'g')
  );

-- 3. Remap orphan 'ai' category to 'machine-learning' (no longer a valid category)
-- Preview first:
SELECT id, title, category FROM jobs WHERE category = 'ai';

-- Then update:
UPDATE jobs SET category = 'machine-learning' WHERE category = 'ai';

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
