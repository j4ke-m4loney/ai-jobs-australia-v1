"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Search,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    location_type: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
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

const JobSeekerApplications = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
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
            category,
            companies (
              id,
              name,
              description,
              website,
              logo_url
            )
          )
        `
        )
        .eq("applicant_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const applicationsWithJobs =
        data?.map((app) => ({
          ...app,
          job: app.jobs,
        })) || [];

      setApplications(applicationsWithJobs);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const getStatusBadge = (status: string) => {
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

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <JobSeekerLayout title="My Applications">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout title="My Applications">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">
              Track your job applications
            </p>
          </div>
        </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {applications.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Applications
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statusCounts.submitted || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {statusCounts.reviewed || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Under Review
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {statusCounts.accepted || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accepted
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All ({applications.length})
                </Button>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </Button>
                ))}
              </div>

              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {filter === "all"
                        ? "No applications yet"
                        : `No ${filter} applications`}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {filter === "all"
                        ? "Start applying to jobs to track your progress here."
                        : `You don't have any applications with ${filter} status.`}
                    </p>
                    <Button
                      onClick={() => router.push("/jobs")}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            {/* Company Logo */}
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              {application.job.companies?.logo_url ? (
                                <img
                                  src={application.job.companies.logo_url}
                                  alt={application.job.companies.name || "Company"}
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
                                  router.push(`/jobseeker/applied-job/${application.job.id}`)
                                }
                              >
                                {application.job.title}
                              </h3>

                              <p className="text-sm text-muted-foreground mb-2">
                                {application.job.companies?.name ||
                                  "Company"}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {application.job.location} (
                                  {application.job.location_type})
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {application.job.job_type}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatSalary(
                                    application.job.salary_min,
                                    application.job.salary_max
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {getStatusBadge(application.status)}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  Applied:{" "}
                                  {new Date(
                                    application.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/jobseeker/applied-job/${application.job.id}`)
                              }
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

export default JobSeekerApplications;
