"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { updateJobStatus, markJobAsDuplicate, logAdminAction } from "@/lib/admin/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Globe,
  Mail,
  AlertTriangle,
  Copy,
  Star,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string;
  company_name: string;
  company_website: string;
  company_description: string;
  company_logo_url: string | null;
  location: string;
  location_type: string;
  job_type: string;
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  application_url: string | null;
  application_email: string | null;
  status: string;
  is_featured: boolean;
  featured_until: string | null;
  created_at: string;
  expires_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  employer_id: string;
  payment_id: string | null;
}

export default function AdminJobReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [originalJobId, setOriginalJobId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;
      setJob(data);
      setAdminNotes(data.admin_notes || "");
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to fetch job details");
      router.push("/admin/jobs");
    } finally {
      setIsLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, fetchJobDetails]);

  const handleApprove = async () => {
    setIsUpdating(true);
    const result = await updateJobStatus([jobId], "approved");
    if (result.success) {
      toast.success("Job approved successfully");
      await logAdminAction("approve_job", "job", jobId, { notes: adminNotes });
      await saveAdminNotes();
      router.push("/admin/jobs");
    } else {
      toast.error(result.error || "Failed to approve job");
    }
    setIsUpdating(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsUpdating(true);
    const result = await updateJobStatus([jobId], "rejected", rejectionReason);
    if (result.success) {
      toast.success("Job rejected successfully");
      await logAdminAction("reject_job", "job", jobId, {
        reason: rejectionReason,
        notes: adminNotes
      });
      await saveAdminNotes();
      setRejectDialogOpen(false);
      router.push("/admin/jobs");
    } else {
      toast.error(result.error || "Failed to reject job");
    }
    setIsUpdating(false);
  };

  const handleMarkDuplicate = async () => {
    if (!originalJobId.trim()) {
      toast.error("Please provide the original job ID");
      return;
    }

    setIsUpdating(true);
    const result = await markJobAsDuplicate(jobId, originalJobId);
    if (result.success) {
      toast.success("Job marked as duplicate");
      setDuplicateDialogOpen(false);
      router.push("/admin/jobs");
    } else {
      toast.error(result.error || "Failed to mark as duplicate");
    }
    setIsUpdating(false);
  };

  const saveAdminNotes = async () => {
    try {
      await supabase
        .from("jobs")
        .update({
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", jobId);
    } catch (error) {
      console.error("Error saving admin notes:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { label: "Pending", variant: "secondary" as const, icon: Clock },
      approved: { label: "Approved", variant: "success" as const, icon: CheckCircle },
      rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
      expired: { label: "Expired", variant: "outline" as const, icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
      icon: AlertTriangle,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant as "default" | "destructive" | "outline" | "secondary" | null | undefined} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!job) {
    return (
      <AdminLayout>
        <div className="text-center">
          <p>Job not found</p>
          <Button onClick={() => router.push("/admin/jobs")} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Review Job</h1>
              <p className="text-muted-foreground mt-1">
                Review and take action on this job listing
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === "pending_approval" && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogOpen(true)}
              disabled={isUpdating}
            >
              <Copy className="mr-2 h-4 w-4" />
              Mark as Duplicate
            </Button>
          </div>
        </div>

        {/* Job Status and Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status & Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(job.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm">
                  {format(new Date(job.created_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Expires</Label>
                <p className="mt-1 text-sm">
                  {format(new Date(job.expires_at), "MMM d, yyyy")}
                </p>
              </div>
              {job.reviewed_at && (
                <div>
                  <Label className="text-muted-foreground">Reviewed</Label>
                  <p className="mt-1 text-sm">
                    {format(new Date(job.reviewed_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              )}
            </div>

            {job.is_featured && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Featured Job</p>
                  {job.featured_until && (
                    <p className="text-sm text-muted-foreground">
                      Featured until {format(new Date(job.featured_until), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {job.rejection_reason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-900 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{job.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company_name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location} ({job.location_type})</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Category: {job.category}</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </div>

            <Separator />

            {/* Company Information */}
            <div>
              <h3 className="font-semibold mb-2">Company Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company_name}</span>
                </div>
                {job.company_website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {job.company_website}
                    </a>
                  </div>
                )}
                {job.company_description && (
                  <p className="text-sm text-muted-foreground">
                    {job.company_description}
                  </p>
                )}
              </div>
            </div>

            {/* Application Method */}
            <div>
              <h3 className="font-semibold mb-2">Application Method</h3>
              <div className="space-y-2">
                {job.application_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {job.application_url}
                    </a>
                  </div>
                )}
                {job.application_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${job.application_email}`}
                      className="text-primary hover:underline"
                    >
                      {job.application_email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
            <CardDescription>
              Internal notes about this job listing (not visible to users)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add notes about this job listing..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="mb-2"
            />
            <Button onClick={saveAdminNotes} size="sm">
              Save Notes
            </Button>
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Job Listing</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this job listing.
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
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isUpdating}
              >
                Reject Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Duplicate</DialogTitle>
              <DialogDescription>
                Enter the ID of the original job listing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Original Job ID</Label>
              <Input
                placeholder="Enter job ID..."
                value={originalJobId}
                onChange={(e) => setOriginalJobId(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDuplicateDialogOpen(false);
                  setOriginalJobId("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkDuplicate}
                disabled={!originalJobId.trim() || isUpdating}
              >
                Mark as Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}