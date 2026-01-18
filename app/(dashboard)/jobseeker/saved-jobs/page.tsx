"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import Image from "next/image";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";

interface SavedJob {
  id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    location_type: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_period?: string;
    show_salary?: boolean;
    created_at: string;
    expires_at: string;
    status?: string;
    category: string;
    companies?: {
      id: string;
      name: string;
      description: string | null;
      website: string | null;
      logo_url: string | null;
    } | null;
  };
}

const isJobExpired = (job: SavedJob["job"]) => {
  if (job.status === "expired") return true;
  if (job.expires_at) {
    return new Date(job.expires_at) < new Date();
  }
  return false;
};

const JobSeekerSavedJobs = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSaveJob } = useSavedJobs();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = useCallback(async () => {
    try {
      // First get saved job IDs
      const { data: savedData, error: savedError } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedJobs([]);
        setLoading(false);
        return;
      }

      // Then fetch the full job details with company information
      const jobIds = savedData.map(item => item.job_id);
      const { data: jobsData, error: jobsError } = await supabase
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
        .in("id", jobIds);

      if (jobsError) throw jobsError;

      // Combine saved jobs with job details
      const combinedData = savedData.map(saved => {
        const job = jobsData?.find(j => j.id === saved.job_id);
        return {
          ...saved,
          job: job || null
        };
      }).filter(item => item.job !== null);

      setSavedJobs(combinedData);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchSavedJobs();
  }, [user, router, fetchSavedJobs]);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await toggleSaveJob(jobId);
      // Remove from local state
      setSavedJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      toast.success("Job removed from saved jobs");
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast.error("Failed to remove job");
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
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
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <JobSeekerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you&apos;ve saved for later</p>
        </div>

        {savedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No saved jobs yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start browsing jobs and save the ones you&apos;re interested in.
              </p>
              <Button onClick={() => router.push("/jobs")} className="gap-2">
                <Search className="w-4 h-4" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((savedJob) => (
              <Card
                key={savedJob.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3 md:p-5">
                  {/* Main content row */}
                  <div className="flex items-start gap-3">
                    {/* Company Logo - only if exists */}
                    {savedJob.job.companies?.logo_url && (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Image
                          src={savedJob.job.companies.logo_url}
                          alt={savedJob.job.companies.name || "Company"}
                          width={48}
                          height={48}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain"
                        />
                      </div>
                    )}

                    {/* Job Details */}
                    <div className={`flex-1 min-w-0 ${isJobExpired(savedJob.job) ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-2">
                        <h3
                          className="text-sm md:text-base font-semibold text-foreground leading-tight hover:text-primary cursor-pointer line-clamp-2 flex-1"
                          onClick={() =>
                            router.push(`/jobseeker/saved-job/${savedJob.job.id}`)
                          }
                        >
                          {savedJob.job.title}
                        </h3>
                        {isJobExpired(savedJob.job) && (
                          <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                            Expired
                          </span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                        {savedJob.job.companies?.name || "Company"}
                      </p>

                      {/* Location row */}
                      <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mt-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span>{savedJob.job.location}</span>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <LocationTypeBadge locationType={savedJob.job.location_type} />
                        <span className="text-[11px] md:text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{savedJob.job.job_type}</span>
                        </span>
                      </div>

                      {/* Posted time */}
                      <span className="text-[11px] md:text-xs text-muted-foreground mt-2 block">
                        Posted {getTimeAgo(savedJob.job.created_at)}
                      </span>
                    </div>

                    {/* Desktop buttons - inline */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsaveJob(savedJob.job.id)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        Unsave
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/jobseeker/saved-job/${savedJob.job.id}`)}
                        className="text-xs h-8"
                      >
                        View Job
                      </Button>
                    </div>
                  </div>

                  {/* Mobile actions row */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/50 md:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnsaveJob(savedJob.job.id)}
                      className="gap-1.5 text-xs h-8 flex-1"
                    >
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      Unsave
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/jobseeker/saved-job/${savedJob.job.id}`)}
                      className="text-xs h-8 flex-1"
                    >
                      View Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </JobSeekerLayout>
  );
};

export default JobSeekerSavedJobs;
