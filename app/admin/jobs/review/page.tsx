"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { appendUtmParams } from "@/lib/utils";

interface JobNeedingReview {
  id: string;
  title: string;
  application_url: string;
  check_failure_reason: string | null;
  last_checked_at: string | null;
  check_count: number | null;
  check_method: string | null;
  created_at: string;
}

interface JobCheckLog {
  id: string;
  check_method: string;
  status_code: number | null;
  evidence_found: string[];
  decision: string;
  error_message: string | null;
  response_time_ms: number | null;
  created_at: string;
}

export default function AdminJobReviewPage() {
  const [jobs, setJobs] = useState<JobNeedingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobLogs, setSelectedJobLogs] = useState<{
    [jobId: string]: JobCheckLog[];
  }>({});
  const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set());

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, application_url, check_failure_reason, last_checked_at, check_count, check_method, created_at"
        )
        .eq("status", "needs_review")
        .order("last_checked_at", { ascending: false, nullsFirst: true });

      if (error) throw error;

      setJobs(data || []);

      // Fetch check logs for each job
      if (data && data.length > 0) {
        const logsPromises = data.map(async (job) => {
          const { data: logs, error: logsError } = await supabase
            .from("job_check_logs")
            .select("*")
            .eq("job_id", job.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (logsError) {
            console.error(`Error fetching logs for job ${job.id}:`, logsError);
            return null;
          }

          return { jobId: job.id, logs };
        });

        const logsResults = await Promise.all(logsPromises);
        const logsMap: { [jobId: string]: JobCheckLog[] } = {};

        logsResults.forEach((result) => {
          if (result) {
            logsMap[result.jobId] = result.logs || [];
          }
        });

        setSelectedJobLogs(logsMap);
      }
    } catch (error) {
      console.error("Error fetching jobs needing review:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleKeepActive = async (jobId: string) => {
    setProcessingJobs((prev) => new Set(prev).add(jobId));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/admin/jobs/${jobId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          adminNotes: "Manually reviewed and approved from admin review page",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve job");
      }

      toast.success("Job marked as active");
      await logAdminAction("approve_job", "job", jobId, {
        previousStatus: "needs_review",
        source: "review_page",
      });

      // Remove job from list
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to approve job"
      );
    } finally {
      setProcessingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleMarkExpired = async (jobId: string) => {
    setProcessingJobs((prev) => new Set(prev).add(jobId));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/admin/jobs/${jobId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "expire",
          adminNotes: "Manually expired from admin review page",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to expire job");
      }

      toast.success("Job marked as expired");
      await logAdminAction("update_job", "job", jobId, {
        previousStatus: "needs_review",
        newStatus: "expired",
        source: "review_page",
      });

      // Remove job from list
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error expiring job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to expire job"
      );
    } finally {
      setProcessingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Jobs Needing Review</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review jobs that couldn&apos;t be automatically classified
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Jobs Need Review</h3>
                <p className="text-muted-foreground mt-2">
                  All jobs have been automatically classified or manually reviewed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"} needing
                  review
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Last Checked</TableHead>
                        <TableHead>Recent Evidence</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => {
                        const logs = selectedJobLogs[job.id] || [];
                        const isProcessing = processingJobs.has(job.id);

                        return (
                          <TableRow key={job.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{job.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {job.check_method && (
                                    <Badge variant="outline" className="mr-2">
                                      {job.check_method}
                                    </Badge>
                                  )}
                                  Checked {job.check_count || 0} times
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a
                                href={appendUtmParams(job.application_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View URL
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm max-w-xs">
                                {job.check_failure_reason || "Unknown reason"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {job.last_checked_at
                                  ? format(
                                      new Date(job.last_checked_at),
                                      "MMM d, h:mm a"
                                    )
                                  : "Never"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 max-w-xs">
                                {logs.length > 0 ? (
                                  logs.slice(0, 2).map((log, idx) => (
                                    <div
                                      key={log.id}
                                      className="text-xs text-muted-foreground"
                                    >
                                      {idx === 0 && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs mb-1"
                                        >
                                          Latest
                                        </Badge>
                                      )}
                                      <div>
                                        {log.evidence_found.length > 0 ? (
                                          <span>
                                            Found:{" "}
                                            {log.evidence_found
                                              .slice(0, 2)
                                              .join(", ")}
                                          </span>
                                        ) : (
                                          <span>
                                            {log.error_message ||
                                              `HTTP ${log.status_code || "N/A"}`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    No check logs
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleKeepActive(job.id)}
                                  disabled={isProcessing}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Keep Active
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleMarkExpired(job.id)}
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Mark Expired
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
