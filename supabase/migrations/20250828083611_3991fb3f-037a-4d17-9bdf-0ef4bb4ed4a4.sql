-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  user_type TEXT CHECK (user_type IN ('job_seeker', 'employer', 'admin')) NOT NULL DEFAULT 'job_seeker',
  company_name TEXT,
  resume_url TEXT,
  cover_letter_url TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT [],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('onsite', 'remote', 'hybrid')) NOT NULL DEFAULT 'onsite',
  job_type TEXT CHECK (
    job_type IN (
      'full-time',
      'part-time',
      'contract',
      'internship'
    )
  ) NOT NULL DEFAULT 'full-time',
  category TEXT CHECK (
    category IN (
      'ai',
      'ml',
      'data-science',
      'engineering',
      'research'
    )
  ) NOT NULL DEFAULT 'ai',
  salary_min INTEGER,
  salary_max INTEGER,
  application_method TEXT CHECK (application_method IN ('external', 'email')) NOT NULL DEFAULT 'external',
  application_url TEXT,
  application_email TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT CHECK (
    status IN ('pending', 'approved', 'rejected', 'expired')
  ) NOT NULL DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed')) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter_url TEXT,
  status TEXT CHECK (
    status IN ('submitted', 'viewed', 'rejected', 'accepted')
  ) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Create policies for companies
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.companies FOR
INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update companies" ON public.companies FOR
UPDATE TO authenticated USING (true);
-- Create policies for jobs
CREATE POLICY "Approved jobs are viewable by authenticated users" ON public.jobs FOR
SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Employers can view their own jobs" ON public.jobs FOR
SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can create jobs" ON public.jobs FOR
INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own jobs" ON public.jobs FOR
UPDATE USING (auth.uid() = employer_id);
-- Create policies for job applications
CREATE POLICY "Job seekers can view their own applications" ON public.job_applications FOR
SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications FOR
SELECT USING (
    auth.uid() IN (
      SELECT employer_id
      FROM public.jobs
      WHERE id = job_id
    )
  );
CREATE POLICY "Job seekers can create applications" ON public.job_applications FOR
INSERT WITH CHECK (auth.uid() = applicant_id);
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE
UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE
UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE
UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_location_type ON public.jobs(location_type);
CREATE INDEX idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON public.job_applications(applicant_id);