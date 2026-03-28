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
  Activity,
  ChevronLeft,
  ChevronRight,
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

const JOBS_PER_PAGE = 30;

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
  const [page, setPage] = useState(1);

  const fetchJobsAndStats = useCallback(async () => {
    try {
      // Get accurate counts using head: true (bypasses Supabase 1000 row limit)
      const [totalCountResult, activeCountResult] = await Promise.all([
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("employer_id", user?.id),
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("employer_id", user?.id)
          .eq("status", "approved"),
      ]);

      const totalJobs = totalCountResult.count ?? 0;
      const activeJobs = activeCountResult.count ?? 0;

      // Fetch the current page of jobs for display
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user?.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        throw jobsError;
      }

      const fetchedJobs = jobsData || [];

      const jobsWithApplicationCounts = fetchedJobs.map((job) => ({
        ...job,
        applicationCount: 0,
      }));

      setJobs(jobsWithApplicationCounts);
      setStats({
        totalJobs,
        activeJobs,
        totalApplications: 0,
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
        <div className="grid grid-cols-2 gap-4">
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

          {/* TODO: Uncomment when internal applications are supported */}
          {/* <Card>
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
          </Card> */}
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
                jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start justify-between gap-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1.5">
                        <h3 className="font-semibold text-sm md:text-lg leading-tight break-words">
                          {job.title}
                        </h3>
                        <Badge
                          className={`${getStatusColor(job.status)} w-fit text-[10px] md:text-xs`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[160px] md:max-w-none">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[160px] md:max-w-none">
                            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[120px] md:max-w-none">{formatJobTypes(job.job_type)}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
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
                          {/* TODO: Uncomment when internal applications are supported */}
                          {/* <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/employer/applications?job=${job.id}`
                              )
                            }
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Applications
                          </DropdownMenuItem> */}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => router.push(`/employer/jobs/${job.id}#archive`)}
                          >
                            Archive Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                ))
              )}

              {/* Pagination Controls */}
              {jobs.length > JOBS_PER_PAGE && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} of {Math.ceil(jobs.length / JOBS_PER_PAGE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(jobs.length / JOBS_PER_PAGE)}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Showing {((page - 1) * JOBS_PER_PAGE) + 1}–{Math.min(page * JOBS_PER_PAGE, jobs.length)} of {jobs.length} jobs
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerJobs;
