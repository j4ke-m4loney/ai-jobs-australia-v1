"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Calendar,
} from "lucide-react";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: "full-time" | "part-time" | "contract" | "internship";
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
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  job_id: string;
}

export default function AppliedJobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Fetch job and application details
  const fetchJobAndApplicationDetails = useCallback(async () => {
    if (!jobId || !user) return;

    setJobLoading(true);
    try {
      // Fetch job details with company information
      const { data: jobData, error: jobError } = await supabase
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

      if (jobError) {
        console.error("Error fetching job:", jobError);
        toast.error("Failed to load job details");
        router.push("/jobseeker/applications");
        return;
      }

      // Fetch application details
      const { data: applicationData, error: applicationError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId)
        .eq("applicant_id", user.id)
        .single();

      if (applicationError) {
        console.error("Error fetching application:", applicationError);
        toast.error("Application not found");
        router.push("/jobseeker/applications");
        return;
      }

      setJob(jobData as Job);
      setApplication(applicationData as Application);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load job details");
      router.push("/jobseeker/applications");
    } finally {
      setJobLoading(false);
    }
  }, [jobId, user, router]);

  useEffect(() => {
    if (jobId && user) {
      fetchJobAndApplicationDetails();
    }
  }, [jobId, user, fetchJobAndApplicationDetails]);

  const handleDeleteApplication = async () => {
    if (!application || !job) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove "${job.title}" from your applications view? This will not affect your actual job application with the employer.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", application.id);

      if (error) throw error;

      toast.success("Application removed from your view");
      router.push("/jobseeker/applications");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to remove application");
    } finally {
      setDeleting(false);
    }
  };

  // Handlers for JobDetailsView component
  const handleApply = () => {
    // User has already applied, show message
    toast.info("You have already applied to this position");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveClick = (_jobId: string) => {
    // Navigate to save/unsave functionality if needed
    // For now, just show info since they've already applied
    toast.info("You can save other jobs from the jobs listing page");
  };




  const getApplicationStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      submitted: "secondary",
      reviewed: "default",
      shortlisted: "default",
      interview: "default",
      accepted: "default",
      rejected: "destructive",
    };

    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      reviewed: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-purple-100 text-purple-800",
      interview: "bg-orange-100 text-orange-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        variant={variants[status] || "secondary"}
        className={colors[status] || ""}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };


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

  if (!user || !job || !application) {
    return null;
  }

  return (
    <JobSeekerLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobseeker/applications")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>

        {/* Job Details using centralized component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <JobDetailsView
              job={job as any}
              onApply={handleApply}
              onSaveClick={handleSaveClick}
              isJobSaved={false}
              hasApplied={true}
            />
          </div>
          
          <div className="lg:col-span-1 lg:sticky lg:top-16 lg:h-fit">
            {/* Application Status and Actions */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Application Status
                  </span>
                  <button
                    onClick={handleDeleteApplication}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Status:</span>
                    {getApplicationStatusBadge(application.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Applied on {new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.push("/jobseeker/applications")}
                    className="bg-primary hover:bg-primary/90 text-white w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View All Applications
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/jobs")}
                    className="w-full"
                  >
                    Browse More Jobs
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Note:</strong> Removing this application from your view will not affect 
                    your actual job application status with the employer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
}