-- Fix typo in blog post slug: "data-cience" -> "data-science"
--
-- Background: this post appeared in GSC's "Crawled - currently not indexed"
-- report. Google won't index a misspelled slug because nobody links to or
-- searches for "data cience". Fixing the slug + adding a permanent redirect
-- in next.config.ts preserves any existing link equity.
--
-- Run order: execute this SQL first (atomic single-row UPDATE), then deploy
-- the next.config.ts redirect. Brief window where the old URL 404s before
-- the redirect deploy is acceptable — the new URL is live immediately.

-- Sanity check before update — should return exactly 1 row
SELECT id, slug, title, status
FROM blog_posts
WHERE slug = 'how-many-references-for-a-resume-for-ai-and-data-cience-in-australia';

-- Apply the fix
UPDATE blog_posts
SET slug = 'how-many-references-for-a-resume-for-ai-and-data-science-in-australia'
WHERE slug = 'how-many-references-for-a-resume-for-ai-and-data-cience-in-australia';

-- Confirm the new slug is in place
SELECT id, slug, title, status
FROM blog_posts
WHERE slug = 'how-many-references-for-a-resume-for-ai-and-data-science-in-australia';
