"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Head from "next/head";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Briefcase,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { formatSalary } from "@/lib/salary-utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";

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
  salary_period?: string;
  show_salary?: boolean;
  application_method: string;
  application_url: string | null;
  application_email: string | null;
  created_at: string;
  expires_at: string;
  is_featured: boolean;
  companies: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
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

  // Define callback functions first
  const fetchJob = useCallback(async () => {
    try {
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
  }, [id, router]);

  const checkApplicationStatus = useCallback(async () => {
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
  }, [user, id]);

  // Effect to fetch job and check application status
  useEffect(() => {
    if (!id) {
      router.push("/jobs");
      return;
    }
    fetchJob();
    if (user) {
      checkApplicationStatus();
    }
  }, [id, user, router, fetchJob, checkApplicationStatus]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      router.push("/login");
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    // Less than 60 minutes - show minutes
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min ago`;
    }

    // Less than 24 hours - show hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    // Less than 30 days - show days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays <= 30) {
      return `${diffInDays}d ago`;
    }

    // Show months
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
      return "1 month ago";
    }
    return `${diffInMonths} months ago`;
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
            The job you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://www.aijobsaustralia.com.au/jobs/${id}`} />
      </Head>
      <div className="min-h-screen bg-gradient-subtle">
        <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {job.companies?.logo_url && (
                    <Image
                      src={job.companies.logo_url}
                      alt={job.companies?.name || "Company logo"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {job.is_featured && (
                        <Badge className="bg-gradient-hero text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{job.companies?.name || "Unknown Company"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <LocationTypeBadge locationType={job.location_type} />
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="capitalize">{job.job_type}</span>
                      </div>
                      {job.show_salary !== false &&
                        (job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
                    <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
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
                      You&apos;ve already applied for this position
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Posted {getTimeAgo(job.created_at)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button
                        onClick={handleApply}
                        className="w-full gap-2"
                        disabled={applying}
                      >
                        {applying ? "Applying..." : "Apply"}
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
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </>
  );
}