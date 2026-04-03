"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { ArrowLeft } from "lucide-react";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";
import { appendUtmParams } from "@/lib/utils";
import { trackExternalApply } from "@/lib/applications/track-external-apply";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: string[];
  category: "ai" | "ml" | "data-science" | "engineering" | "research";
  salary_min: number | null;
  salary_max: number | null;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
  // Optional fields that may not exist in all job records
  suburb?: string | null;
  state?: string | null;
  location_display?: string | null;
  application_method?: string;
  application_url?: string | null;
  application_email?: string | null;
  disable_utm_tracking?: boolean;
  status?: "pending" | "approved" | "rejected" | "expired";
  company_id?: string | null;
  highlights?: string[] | null;
  companies?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
  employer_questions?: Array<{
    id: string;
    question: string;
    required: boolean;
  }>;
}

export default function SavedJobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toggleSaveJob } = useSavedJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);

  // Fetch job details
  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return;

    setJobLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          description,
          website,
          logo_url
        )
      `)
      .eq("id", jobId)
      .eq("status", "approved")
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/jobseeker/saved-jobs");
    } else {
      setJob(data as Job);
    }
    setJobLoading(false);
  }, [jobId, router]);

  useEffect(() => {
    if (jobId && user) {
      fetchJobDetails();
    }
  }, [jobId, user, fetchJobDetails]);

  const handleUnsaveJob = async () => {
    if (!job) return;
    
    try {
      await toggleSaveJob(job.id);
      toast.success("Job removed from saved jobs");
      router.push("/jobseeker/saved-jobs");
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast.error("Failed to remove job");
    }
  };

  const handleApply = () => {
    if (!job || !user) return;

    // External: open URL or fallback to email
    if (job.application_method === "external") {
      if (job.application_url) {
        window.open(appendUtmParams(job.application_url, job.disable_utm_tracking), "_blank");
      } else if (job.application_email) {
        window.open(`mailto:${job.application_email}`);
      }
      trackExternalApply(supabase, job.id, user.id, 'external');
      setHasApplied(true);
      return;
    }

    // Email: open mailto link
    if (job.application_method === "email") {
      if (job.application_email) {
        window.open(`mailto:${job.application_email}`);
      }
      trackExternalApply(supabase, job.id, user.id, 'email');
      setHasApplied(true);
      return;
    }

    // Internal application — redirect to full apply page
    router.push(`/apply/${job.id}`);
  };

  const handleSaveClick = async () => {
    await handleUnsaveJob();
  };

  // Check if user has already applied
  const [hasApplied, setHasApplied] = useState(false);
  
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !jobId) return;
      
      const { data } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("applicant_id", user.id)
        .single();
      
      setHasApplied(!!data);
    };
    
    checkApplicationStatus();
  }, [user, jobId]);





  if (loading || jobLoading) {
    return (
      <JobSeekerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  if (!user || !job) {
    return null;
  }

  return (
    <JobSeekerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobseeker/saved-jobs")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Saved Jobs
          </Button>
        </div>

        {/* Job Details using centralized component */}
        <JobDetailsView
          job={{
            ...job,
            application_method: job.application_method || 'external',
            application_url: job.application_url || null,
            application_email: job.application_email || null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any}
          onApply={handleApply}
          onSaveClick={handleSaveClick}
          isJobSaved={true}
          hasApplied={hasApplied}
        />
      </div>
    </JobSeekerLayout>
  );
}