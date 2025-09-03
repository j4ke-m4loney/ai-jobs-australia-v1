"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";

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
    created_at: string;
    category: string;
    company?: {
      name: string;
      logo_url: string | null;
    };
  };
}

const JobSeekerSavedJobs = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchSavedJobs();
  }, [user, router]);

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(
          `
          *,
          jobs:job_id (
            id,
            title,
            location,
            location_type,
            job_type,
            salary_min,
            salary_max,
            created_at,
            category
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobsWithCompanies =
        data?.map((item) => ({
          ...item,
          job: {
            ...item.jobs,
            company: {
              name: "Company Name", // Placeholder until we have proper company data
              logo_url: null,
            },
          },
        })) || [];

      setSavedJobs(jobsWithCompanies);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

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
    <JobSeekerLayout title="Saved Jobs">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Saved Jobs</h1>
            <p className="text-muted-foreground">Jobs you've saved for later</p>
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No saved jobs yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start browsing jobs and save the ones you're interested in.
              </p>
              <Button onClick={() => router.push("/jobs")} className="gap-2">
                <Search className="w-4 h-4" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((savedJob) => (
              <Card
                key={savedJob.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {savedJob.job.company?.logo_url ? (
                          <img
                            src={savedJob.job.company.logo_url}
                            alt={savedJob.job.company.name}
                            className="w-8 h-8 rounded"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-semibold text-foreground mb-1 hover:text-primary cursor-pointer"
                          onClick={() =>
                            router.push(`/jobs/${savedJob.job.id}`)
                          }
                        >
                          {savedJob.job.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-2">
                          {savedJob.job.company?.name || "Company Name"}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {savedJob.job.location} (
                            {savedJob.job.location_type})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {savedJob.job.job_type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatSalary(
                              savedJob.job.salary_min,
                              savedJob.job.salary_max
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {savedJob.job.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Posted {getTimeAgo(savedJob.job.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsaveJob(savedJob.job.id)}
                        className="gap-2"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        Unsave
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/jobs/${savedJob.job.id}`)}
                      >
                        View Job
                      </Button>
                    </div>
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
