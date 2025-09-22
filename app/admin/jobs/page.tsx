"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { updateJobStatus, logAdminAction } from "@/lib/admin/auth";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Clock,
  Star,
  AlertTriangle,
  Building,
  MapPin,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  location_type: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  payment_status?: string;
}

export default function AdminJobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [jobToReject, setJobToReject] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for cache busting

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, refreshKey]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Force refresh when any job changes
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} jobs with status filter: ${statusFilter}`);
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    // Optimistic update
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'approved' } : job
    ));

    const result = await updateJobStatus([jobId], "approved");
    if (result.success) {
      toast.success("Job approved successfully");
      await logAdminAction("approve_job", "job", jobId, {});
      // Force refresh to get latest data
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 500);
    } else {
      toast.error(result.error || "Failed to approve job");
      // Revert optimistic update on failure
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleReject = async () => {
    if (!jobToReject) return;

    const jobIds = jobToReject === "bulk" ? selectedJobs : [jobToReject];
    const result = await updateJobStatus(jobIds, "rejected", rejectionReason);

    if (result.success) {
      toast.success(`${jobIds.length} job(s) rejected successfully`);
      for (const jobId of jobIds) {
        await logAdminAction("reject_job", "job", jobId, { reason: rejectionReason });
      }
      setRejectDialogOpen(false);
      setRejectionReason("");
      setJobToReject(null);
      setSelectedJobs([]);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.error || "Failed to reject job(s)");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedJobs.length === 0) return;

    if (bulkAction === "approve") {
      const result = await updateJobStatus(selectedJobs, "approved");
      if (result.success) {
        toast.success(`${selectedJobs.length} jobs approved`);
        await logAdminAction("bulk_action", "job", "", {
          action: "approve",
          job_ids: selectedJobs,
        });
        setSelectedJobs([]);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.error || "Failed to approve jobs");
      }
    } else if (bulkAction === "reject") {
      setJobToReject("bulk");
      setRejectDialogOpen(true);
    }
    setBulkAction("");
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleAllJobs = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((job) => job.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { label: "Pending", variant: "secondary" as const, icon: Clock },
      approved: { label: "Approved", variant: "success" as const, icon: CheckCircle },
      rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
      expired: { label: "Expired", variant: "outline" as const, icon: AlertTriangle },
      paused: { label: "Paused", variant: "secondary" as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
      icon: AlertTriangle,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground mt-2">
            Review, approve, and manage job listings
          </p>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setRefreshKey(prev => prev + 1);
                    toast.info("Refreshing jobs...");
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>

              {selectedJobs.length > 0 && (
                <div className="flex gap-2">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Bulk actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve Selected</SelectItem>
                      <SelectItem value="reject">Reject Selected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAction} disabled={!bulkAction}>
                    Apply ({selectedJobs.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No jobs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedJobs.length === jobs.length}
                        onCheckedChange={toggleAllJobs}
                      />
                    </TableHead>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{job.title}</div>
                          {job.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {job.company_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.job_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(job.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/jobs/${job.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status === "pending_approval" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(job.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setJobToReject(job.id);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {job.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setJobToReject(job.id);
                                  setRejectDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            {job.status === "rejected" && (
                              <DropdownMenuItem
                                onClick={() => handleApprove(job.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Job Listing</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this job listing.
                {jobToReject === "bulk" &&
                  ` (${selectedJobs.length} jobs selected)`}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                  setJobToReject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}