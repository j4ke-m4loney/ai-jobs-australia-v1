-- Career pages to monitor for AI job listings
CREATE TABLE public.career_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  search_keywords TEXT DEFAULT 'AI, machine learning, data science',
  check_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (check_frequency IN ('daily', 'weekly')),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_content_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Queue table between discovery and extraction steps
CREATE TABLE public.discovered_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_page_id UUID REFERENCES public.career_pages(id) ON DELETE CASCADE,
  job_url TEXT NOT NULL,
  job_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending_extraction'
    CHECK (status IN ('pending_extraction', 'imported', 'dismissed', 'failed')),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  failure_reason TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_url)
);

-- Enable RLS
ALTER TABLE public.career_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_jobs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role bypasses RLS)
CREATE POLICY "Admin full access to career_pages"
  ON public.career_pages FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to discovered_jobs"
  ON public.discovered_jobs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
