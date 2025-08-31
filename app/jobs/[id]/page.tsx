"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  Globe,
  ArrowLeft,
  ExternalLink,
  Mail,
  Briefcase,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  location_type: string;
  job_type: string;
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  application_method: string;
  application_url: string | null;
  application_email: string | null;
  created_at: string;
  expires_at: string;
  is_featured: boolean;
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push("/jobs");
      return;
    }
    fetchJob();
    if (user) {
      checkApplicationStatus();
    }
  }, [id, user, router]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Job not found");
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("applicant_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setHasApplied(!!data);
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      router.push("/auth");
      return;
    }

    if (!job) return;

    // If external application, open link
    if (job.application_method === "external" && job.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }

    // If email application, open email client
    if (job.application_method === "email" && job.application_email) {
      window.location.href = `mailto:${job.application_email}?subject=Application for ${job.title}`;
      return;
    }

    // Internal application (future feature)
    setApplying(true);
    try {
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        applicant_id: user.id,
        status: "submitted",
      });

      if (error) throw error;

      setHasApplied(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Job not found
          </h2>
          <p className="text-muted-foreground mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {job.is_featured && (
                        <Badge className="bg-gradient-hero text-white">
                          Featured
                        </Badge>
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {job.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">Mock Company</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location} ({job.location_type})
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="capitalize">{job.job_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getDaysUntilExpiry(job.expires_at)} days left
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {job.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company placeholder */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="font-medium text-foreground mb-1">
                      Application Submitted
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You've already applied for this position
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Posted:{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Expires:{" "}
                          {new Date(job.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                      {job.application_method === "external" &&
                        job.application_url && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <span>External application</span>
                          </div>
                        )}
                      {job.application_method === "email" &&
                        job.application_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>Email application</span>
                          </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button
                        onClick={handleApply}
                        className="w-full gap-2"
                        disabled={applying}
                      >
                        {applying ? (
                          "Applying..."
                        ) : job.application_method === "external" ? (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Apply on Company Site
                          </>
                        ) : job.application_method === "email" ? (
                          <>
                            <Mail className="w-4 h-4" />
                            Apply via Email
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => toggleSaveJob(job.id)}
                        className="w-full gap-2"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isJobSaved(job.id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                        {isJobSaved(job.id) ? "Remove from Saved" : "Save Job"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{job.job_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium capitalize">
                    {job.location_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}