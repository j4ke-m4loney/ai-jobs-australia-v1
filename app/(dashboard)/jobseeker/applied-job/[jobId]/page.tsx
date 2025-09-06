"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Info,
  FileText,
  Calendar,
} from "lucide-react";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";

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
  expires_at: string | null; // TODO: Job expiration functionality needs to be added to job posting process
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
  useEffect(() => {
    if (jobId && user) {
      fetchJobAndApplicationDetails();
    }
  }, [jobId, user]);

  const fetchJobAndApplicationDetails = async () => {
    if (!jobId || !user) return;

    setJobLoading(true);
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
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
  };

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

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getCategoryDisplay = (category: string) => {
    const categories = {
      ai: "Artificial Intelligence",
      ml: "Machine Learning",
      "data-science": "Data Science",
      engineering: "Engineering",
      research: "Research",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
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

  // TODO: Job expiration functionality needs to be implemented in the job posting process
  // For now, we'll check if expires_at exists and is in the past
  const isJobExpired = () => {
    if (!job?.expires_at) return false;
    return new Date(job.expires_at) < new Date();
  };

  if (loading || jobLoading) {
    return (
      <JobSeekerLayout title="Job Details">
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
    <JobSeekerLayout title="Job Details">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobseeker/applications")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>

        {/* Job Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                  {job.is_featured && (
                    <Badge className="bg-gradient-hero text-white">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getCategoryDisplay(job.category)}
                  </Badge>
                  {getApplicationStatusBadge(application.status)}
                  {isJobExpired() && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Expired
                    </Badge>
                  )}
                  </div>
                  
                  {/* Delete link aligned with badges */}
                  <button
                    onClick={handleDeleteApplication}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {job.title}
                </h1>

                <div className="text-lg font-medium text-muted-foreground mb-3">
                  Company
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location} ({job.location_type})
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{job.job_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs">
                    Posted {getTimeAgo(job.created_at)}
                  </span>
                </div>

                {formatSalary(job.salary_min, job.salary_max) && (
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Job Description
              </h3>
              <div className="prose max-w-none text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Requirements
                </h3>
                <div className="prose max-w-none text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
                </div>
              </div>
            )}

            {/* Company Info Section - placeholder for future enhancement */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                About the Company
              </h3>
              <p className="text-muted-foreground">
                Company information will be displayed here when available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Application Status
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/jobseeker/applications")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Applications
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/jobs")}
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
    </JobSeekerLayout>
  );
}