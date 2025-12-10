-- Fix the slug for the data scientist blog post if it exists
UPDATE blog_posts
SET slug = 'your-guide-to-data-scientist-jobs-in-australia'
WHERE title LIKE '%Data Science Jobs in Australia%'
  OR slug LIKE '%your-guide-to%data%';
