-- Add storage policies to allow employers to download documents for their job applications

-- Policy to allow employers to view resumes for applications to their jobs
CREATE POLICY "Employers can view applicant resumes for their jobs" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND (
      ja.resume_url = name 
      OR ja.resume_url = REPLACE(name, auth.uid()::text || '/', '')
    )
  )
);

-- Policy to allow employers to view cover letters for applications to their jobs
CREATE POLICY "Employers can view applicant cover letters for their jobs" ON storage.objects FOR SELECT USING (
  bucket_id = 'cover-letters'
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND (
      ja.cover_letter_url = name
      OR ja.cover_letter_url = REPLACE(name, auth.uid()::text || '/', '')
    )
  )
);

-- Add indexes to improve performance of the policy checks
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_url ON job_applications(resume_url) WHERE resume_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_applications_cover_letter_url ON job_applications(cover_letter_url) WHERE cover_letter_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);