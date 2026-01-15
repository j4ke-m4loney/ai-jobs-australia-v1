-- Remove the CHECK constraint on the category column to allow custom categories
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_category_check;
