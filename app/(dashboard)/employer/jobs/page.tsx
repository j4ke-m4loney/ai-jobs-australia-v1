"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatSalary } from "@/lib/salary-utils";
import { formatJobTypes } from "@/lib/jobs/content-utils";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: string;
  job_type: string[];
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period?: string;
  is_featured: boolean;
  status: string;
  created_at: string;
  expires_at: string;
}

interface JobWithCounts extends Job {
  applicationCount: number;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
}

const EmployerJobs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithCounts[]>([]);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobsAndStats = useCallback(async () => {
    try {
      // Fetch all jobs for this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user?.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        throw jobsError;
      }

      const fetchedJobs = jobsData || [];

      // Get application counts for all jobs in batched queries to avoid URL length limits
      const jobIds = fetchedJobs.map((job) => job.id);
      let countsByJobId: Record<string, number> = {};

      if (jobIds.length > 0) {
        // Process in batches of 50 to avoid URL length limits
        const BATCH_SIZE = 50;
        const allApplicationData: { job_id: string }[] = [];

        for (let i = 0; i < jobIds.length; i += BATCH_SIZE) {
          const batchIds = jobIds.slice(i, i + BATCH_SIZE);
          const { data: batchData, error: batchError } = await supabase
            .from("job_applications")
            .select("job_id")
            .in("job_id", batchIds);

          if (batchError) {
            console.error("Error fetching application counts batch:", batchError);
          } else if (batchData) {
            allApplicationData.push(...batchData);
          }
        }

        // Count applications per job client-side
        countsByJobId = allApplicationData.reduce(
          (acc, app) => {
            acc[app.job_id] = (acc[app.job_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
      }

      const jobsWithApplicationCounts = fetchedJobs.map((job) => ({
        ...job,
        applicationCount: countsByJobId[job.id] || 0,
      }));

      // Calculate statistics
      const totalJobs = jobsWithApplicationCounts.length;
      const activeJobs = jobsWithApplicationCounts.filter(
        (job) => job.status === "approved"
      ).length;
      const totalApplications = jobsWithApplicationCounts.reduce(
        (sum, job) => sum + job.applicationCount,
        0
      );

      setJobs(jobsWithApplicationCounts);
      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchJobsAndStats();
    }
  }, [user, fetchJobsAndStats]);


  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <EmployerLayout title="Job Management">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading jobs...</p>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  if (error) {
    return (
      <EmployerLayout title="Job Management">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchJobsAndStats} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout title="Job Management">
      <div className="grid gap-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/post-job")}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">All job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                Currently accepting applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground">Across all jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice for Views */}
        {/* {stats.totalJobs > 0 && (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">View Analytics Coming Soon</p>
                <p className="text-xs text-muted-foreground">
                  We're working on tracking how many people view your job postings
                </p>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Job Postings</CardTitle>
            <CardDescription>
              Manage your active and inactive job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No jobs posted yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by posting your first job to attract top talent.
                  </p>
                  <Button onClick={() => router.push("/post-job")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {job.title}
                        </h3>
                        <Badge
                          className={`${getStatusColor(job.status)} w-fit`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{formatJobTypes(job.job_type)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {job.applicationCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Applications
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/employer/jobs/${job.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/employer/jobs/${job.id}?mode=edit`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/employer/applications?job=${job.id}`
                              )
                            }
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Applications
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => router.push(`/employer/jobs/${job.id}#archive`)}
                          >
                            Archive Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerJobs;
