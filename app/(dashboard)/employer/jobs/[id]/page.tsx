"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Archive,
  ArchiveRestore,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  employer_id: string;
  company_id: string | null;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  suburb: string | null;
  state: string | null;
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
  status: string;
  is_featured: boolean;
  highlights: string[] | null;
  employer_questions: Array<{question: string; required: boolean}> | null;
  created_at: string;
  expires_at: string;
  company_name?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  companies?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
}

// TODO: Applications Stats - Implement when application management is ready
// interface ApplicationStats {
//   total: number;
//   pending: number;
//   reviewed: number;
//   recentApplications: Array<{
//     id: string;
//     applicant_name: string;
//     applied_at: string;
//     status: string;
//   }>;
// }

// Component to safely render HTML content
const HTMLRenderer = ({ content }: { content: string }) => (
  <div 
    className="text-sm text-muted-foreground prose prose-sm max-w-none"
    dangerouslySetInnerHTML={{ __html: content || "" }}
    style={{
      lineHeight: '1.6',
    }}
  />
);

// Helper functions to calculate salary from payConfig
function getSalaryMin(payConfig: {
  payType: "fixed" | "range" | "maximum" | "minimum";
  payAmount: number | null;
  payRangeMin: number | null;
  payRangeMax: number | null;
  payPeriod: "hour" | "day" | "week" | "month" | "year";
}): number | null {
  // Store original salary values, not converted to annual
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMin) {
    return payConfig.payRangeMin;
  }
  if (payConfig.payType === 'minimum' && payConfig.payRangeMin) {
    return payConfig.payRangeMin;
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return payConfig.payAmount;
  }

  return null;
}

function getSalaryMax(payConfig: {
  payType: "fixed" | "range" | "maximum" | "minimum";
  payAmount: number | null;
  payRangeMin: number | null;
  payRangeMax: number | null;
  payPeriod: "hour" | "day" | "week" | "month" | "year";
}): number | null {
  // Store original salary values, not converted to annual
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMax) {
    return payConfig.payRangeMax;
  }
  if (payConfig.payType === 'maximum' && payConfig.payRangeMax) {
    return payConfig.payRangeMax;
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount) {
    return payConfig.payAmount;
  }

  return null;
}

const JobManagementPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const jobId = params.id as string;
  const isEditMode = searchParams.get("mode") === "edit";
  
  const [job, setJob] = useState<Job | null>(null);
  const [editedJob, setEditedJob] = useState<Partial<Job>>({});
  const [highlights, setHighlights] = useState<string[]>(["", "", ""]);
  const [showPay, setShowPay] = useState(false);
  const [payConfig, setPayConfig] = useState({
    payType: "range" as "fixed" | "range" | "maximum" | "minimum",
    payAmount: null as number | null,
    payRangeMin: null as number | null,
    payRangeMax: null as number | null,
    payPeriod: "year" as "hour" | "day" | "week" | "month" | "year"
  });
  const [hoursConfig, setHoursConfig] = useState({
    showBy: "fixed" as "fixed" | "range" | "maximum" | "minimum",
    minHours: null as number | null,
    maxHours: null as number | null,
    fixedHours: null as number | null,
  });
  const [contractConfig, setContractConfig] = useState({
    length: 1,
    period: "months" as "days" | "weeks" | "months" | "years",
  });
  // TODO: Applications Stats - Implement when application management is ready
  // const [stats, setStats] = useState<ApplicationStats>({
  //   total: 0,
  //   pending: 0,
  //   reviewed: 0,
  //   recentApplications: [],
  // });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchJobDetails = useCallback(async () => {
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
        .eq("id", jobId)
        .eq("employer_id", user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Job not found");
        router.push("/employer/jobs");
        return;
      }

      setJob(data);
      setEditedJob(data);
      
      // Initialize highlights with 3 slots, filling with existing data
      const existingHighlights = data.highlights || [];
      const initHighlights = ["", "", ""];
      existingHighlights.forEach((highlight: string, index: number) => {
        if (index < 3) initHighlights[index] = highlight;
      });
      setHighlights(initHighlights);
      
      // Initialize pay configuration from existing salary data
      const hasExistingSalary = data.salary_min || data.salary_max;
      // Use show_salary from database, default to true if not set for backward compatibility
      setShowPay(data.show_salary !== false);
      if (hasExistingSalary) {
        setPayConfig({
          payType: data.salary_min && data.salary_max ? "range" : "minimum",
          payAmount: null,
          payRangeMin: data.salary_min,
          payRangeMax: data.salary_max,
          payPeriod: (data.salary_period as "hour" | "day" | "week" | "month" | "year") || "year"
        });
      }

      // Initialize hours configuration for part-time jobs with sensible defaults
      if (data.job_type === "part-time") {
        setHoursConfig({
          showBy: "range",
          minHours: 20,
          maxHours: 30,
          fixedHours: null,
        });
      }

      // Initialize contract configuration for contract-type jobs with sensible defaults
      const contractJobTypes = ["fixed-term", "subcontract", "casual", "temp-to-perm", "contract", "volunteer", "internship"];
      if (contractJobTypes.includes(data.job_type)) {
        setContractConfig({
          length: 6,
          period: "months",
        });
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/employer/jobs");
    } finally {
      setLoading(false);
    }
  }, [user, jobId, router]);

  useEffect(() => {
    if (user && jobId) {
      // Only fetch if we don't have the job loaded yet
      // This prevents re-fetching and losing unsaved changes when component re-mounts
      if (!job) {
        fetchJobDetails();
        // TODO: Re-enable when application management is ready
        // fetchApplicationStats();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, jobId]);

  // TODO: Applications Stats - Implement when application management is ready
  // const fetchApplicationStats = async () => {
  //   try {
  //     const { data: applications, error } = await supabase
  //       .from("job_applications")
  //       .select(`
  //         id,
  //         status,
  //         created_at,
  //         applicant_id,
  //         profiles (
  //           first_name,
  //           last_name
  //         )
  //       `)
  //       .eq("job_id", jobId)
  //       .order("created_at", { ascending: false });

  //     if (error) throw error;

  //     const total = applications?.length || 0;
  //     const pending = applications?.filter(app => app.status === "pending").length || 0;
  //     const reviewed = applications?.filter(app => 
  //       ["reviewed", "shortlisted", "rejected"].includes(app.status)
  //     ).length || 0;

  //     const recentApplications = (applications?.slice(0, 5) || []).map((app: any) => ({
  //       id: app.id,
  //       applicant_name: app.profiles 
  //         ? `${app.profiles.first_name || ""} ${app.profiles.last_name || ""}`.trim() || "Unknown"
  //         : "Unknown",
  //       applied_at: app.created_at,
  //       status: app.status,
  //     }));

  //     setStats({ total, pending, reviewed, recentApplications });
  //   } catch (error) {
  //     console.error("Error fetching application stats:", error);
  //   }
  // };

  // Helper functions for highlights
  const handleHighlightChange = (index: number, value: string) => {
    setHighlights((prev) => {
      const newHighlights = [...prev];
      newHighlights[index] = value;
      return newHighlights;
    });
  };

  const getCharCount = (text: string) => {
    return text.trim().length;
  };

  const handlePayConfigChange = (field: string, value: string | number) => {
    setPayConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!job || !editedJob) return;

    setSaving(true);
    try {
      // Calculate new salary values - always save salary for filtering, regardless of showPay
      const newSalaryMin = getSalaryMin(payConfig);
      const newSalaryMax = getSalaryMax(payConfig);

      // Check for significant changes that require re-approval
      const hasSignificantChanges = (
        job.title !== editedJob.title ||
        job.description !== editedJob.description ||
        job.requirements !== editedJob.requirements ||
        job.location !== editedJob.location ||
        job.location_type !== editedJob.location_type ||
        job.job_type !== editedJob.job_type ||
        job.category !== editedJob.category ||
        job.salary_min !== newSalaryMin ||
        job.salary_max !== newSalaryMax ||
        JSON.stringify(job.highlights || []) !== JSON.stringify(highlights.filter(h => h.trim()))
      );

      // Determine new status based on current status and changes
      let newStatus = job.status;
      if (hasSignificantChanges && job.status === "approved") {
        newStatus = "pending_approval";
      }

      // Validate critical data before database update
      if (!user?.id) {
        console.error('❌ User ID is missing');
        toast.error('Authentication error. Please refresh and try again.');
        return;
      }

      if (!jobId) {
        console.error('❌ Job ID is missing');
        toast.error('Job ID error. Please refresh and try again.');
        return;
      }

      if (!editedJob.title?.trim()) {
        console.error('❌ Job title is required');
        toast.error('Job title is required');
        return;
      }

      if (!editedJob.description?.trim()) {
        console.error('❌ Job description is required');
        toast.error('Job description is required');
        return;
      }

      if (!editedJob.location?.trim()) {
        console.error('❌ Job location is required');
        toast.error('Job location is required');
        return;
      }

      // Enhanced data sanitization with defensive handling
      const sanitizedLocation = editedJob.location?.trim() || job.location;

      // Ensure location is never null or empty (violates NOT NULL constraint)
      if (!sanitizedLocation) {
        toast.error('Location is required and cannot be empty');
        return;
      }

      const updateData = {
        title: editedJob.title?.trim(),
        description: editedJob.description?.trim(),
        requirements: editedJob.requirements?.trim() || null,
        location: sanitizedLocation,
        location_type: editedJob.location_type,
        job_type: editedJob.job_type,
        category: editedJob.category,
        salary_min: newSalaryMin,
        salary_max: newSalaryMax,
        salary_period: payConfig.payPeriod || 'year',
        show_salary: showPay,
        application_method: editedJob.application_method,
        application_url: editedJob.application_url?.trim() || null,
        application_email: editedJob.application_email?.trim() || null,
        highlights: highlights.filter(h => h.trim()),
        company_name: editedJob.company_name?.trim() || null,
        company_description: editedJob.company_description?.trim() || null,
        company_website: editedJob.company_website?.trim() || null,
        status: newStatus,
      };

      // Remove any undefined values to prevent database issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('🔍 Debug job update:', {
        jobId,
        userId: user?.id,
        updateData,
        hasSignificantChanges,
        newStatus,
        locationDetails: {
          originalLocation: job.location,
          editedLocation: editedJob.location,
          finalLocation: updateData.location
        }
      });

      // First, let's verify the job exists and check ownership
      console.log('🔍 Checking job existence and ownership...');
      const { data: existingJob, error: fetchError } = await supabase
        .from("jobs")
        .select("id, employer_id, status, title")
        .eq("id", jobId)
        .single();

      console.log('📋 Existing job data:', {
        found: !!existingJob,
        fetchError: fetchError,
        jobData: existingJob,
        currentUserId: user?.id,
        ownershipMatch: existingJob?.employer_id === user?.id
      });

      if (fetchError) {
        console.error('❌ Error fetching job for verification:', fetchError);
        throw new Error(`Job not found: ${fetchError.message}`);
      }

      if (!existingJob) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      if (existingJob.employer_id !== user?.id) {
        throw new Error(`Access denied: Job belongs to user ${existingJob.employer_id}, current user is ${user?.id}`);
      }

      console.log('📝 Attempting database update with SQL query...');
      const { data: updatedData, error, count } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobId)
        .eq("employer_id", user?.id)
        .select();

      console.log('📊 Database update result:', {
        success: !error,
        error: error,
        updatedRows: count,
        updatedData: updatedData,
        rowsAffected: updatedData?.length || 0
      });

      if (error) {
        console.error('❌ Database update error - Multiple serialization approaches:');
        console.error('1. Direct error object:', error);
        console.error('2. JSON.stringify:', JSON.stringify(error, null, 2));
        console.error('3. Error properties:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          stack: error.stack
        });
        console.error('4. Error toString():', error.toString());
        console.error('5. Object.keys(error):', Object.keys(error));
        console.error('6. typeof error:', typeof error);

        // Handle specific constraint violations
        if (error.code === '23502') {
          if (error.message?.includes('location')) {
            toast.error('Location cannot be empty');
            return;
          } else {
            toast.error('Required field cannot be empty: ' + error.message);
            return;
          }
        }

        // Handle other common PostgreSQL errors
        if (error.code === '23514') {
          toast.error('Data validation failed: ' + error.message);
          return;
        }

        // Handle generated column errors
        if (error.message?.includes('location_display')) {
          toast.error('Location display calculation failed - please check location format');
          return;
        }

        throw error;
      }

      // Check if any rows were actually updated
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ No rows were updated! Possible causes:');
        console.error('- Job not found with ID:', jobId);
        console.error('- User not authorized (employer_id mismatch):', user?.id);
        console.error('- RLS policy blocking update');
        throw new Error('No rows updated - job not found or access denied');
      }

      console.log('✅ Database update successful:', updatedData[0]);

      // Update the companies table if company info was changed and a company_id exists
      if (job.company_id && editedJob.company_name?.trim()) {
        try {
          const { error: companyError } = await supabase
            .from('companies')
            .update({
              name: editedJob.company_name.trim(),
              description: editedJob.company_description?.trim() || null,
              website: editedJob.company_website?.trim() || null,
            })
            .eq('id', job.company_id);

          if (companyError) {
            console.error('⚠️ Failed to update companies table:', companyError);
            // Don't fail the whole update - job was updated successfully
          } else {
            console.log('✅ Companies table updated successfully for company_id:', job.company_id);
          }
        } catch (companyUpdateError) {
          console.error('⚠️ Error updating companies table:', companyUpdateError);
          // Don't fail the whole update - job was updated successfully
        }
      } else if (!job.company_id && editedJob.company_name?.trim()) {
        // If no company_id exists but company name is provided, create a new company record
        try {
          const { data: newCompany, error: createError } = await supabase
            .from('companies')
            .insert({
              name: editedJob.company_name.trim(),
              description: editedJob.company_description?.trim() || null,
              website: editedJob.company_website?.trim() || null,
            })
            .select()
            .single();

          if (createError) {
            console.error('⚠️ Failed to create company record:', createError);
          } else if (newCompany) {
            // Link the new company to the job
            await supabase
              .from('jobs')
              .update({ company_id: newCompany.id })
              .eq('id', jobId);
            console.log('✅ New company created and linked:', newCompany.id);
          }
        } catch (companyCreateError) {
          console.error('⚠️ Error creating company record:', companyCreateError);
        }
      }

      // Update the job state with validated data
      const updatedJob: Job = {
        ...job,
        title: editedJob.title || job.title,
        description: editedJob.description || job.description,
        requirements: editedJob.requirements ?? job.requirements,
        location: editedJob.location || job.location,
        location_type: editedJob.location_type || job.location_type,
        job_type: editedJob.job_type || job.job_type,
        category: editedJob.category || job.category,
        salary_min: newSalaryMin,
        salary_max: newSalaryMax,
        application_method: editedJob.application_method || job.application_method,
        application_url: editedJob.application_url ?? job.application_url,
        application_email: editedJob.application_email ?? job.application_email,
        highlights: highlights.filter(h => h.trim()),
        company_name: editedJob.company_name,
        company_description: editedJob.company_description,
        company_website: editedJob.company_website,
        status: newStatus,
      };

      setJob(updatedJob);

      // Send resubmission email if job was moved to pending approval
      if (hasSignificantChanges && job.status === "approved" && newStatus === "pending_approval") {
        try {
          // Create description of changes made
          const changedFields = [];
          if (job.title !== editedJob.title) changedFields.push('title');
          if (job.description !== editedJob.description) changedFields.push('description');
          if (job.requirements !== editedJob.requirements) changedFields.push('requirements');
          if (job.location !== editedJob.location) changedFields.push('location');
          if (job.location_type !== editedJob.location_type) changedFields.push('work arrangement');
          if (job.job_type !== editedJob.job_type) changedFields.push('job type');
          if (job.category !== editedJob.category) changedFields.push('category');
          if (job.salary_min !== newSalaryMin || job.salary_max !== newSalaryMax) changedFields.push('salary');
          if (JSON.stringify(job.highlights || []) !== JSON.stringify(highlights.filter(h => h.trim()))) changedFields.push('highlights');

          const changesDescription = changedFields.length > 0
            ? changedFields.join(', ').replace(/,([^,]*)$/, ' and$1')
            : 'job content';

          // Get employer name from existing job profile data
          const jobWithProfile = job as typeof job & { profiles?: { first_name?: string; last_name?: string } };
          const employerName = jobWithProfile.profiles?.first_name && jobWithProfile.profiles?.last_name
            ? `${jobWithProfile.profiles.first_name} ${jobWithProfile.profiles.last_name}`.trim()
            : jobWithProfile.profiles?.first_name || jobWithProfile.profiles?.last_name || 'Employer';

          // Call API to send resubmission email
          const emailResponse = await fetch(`/api/jobs/${jobId}/send-resubmission-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user?.id || ''
            },
            body: JSON.stringify({
              employerName,
              jobTitle: updatedJob.title,
              companyName: updatedJob.company_name || updatedJob.companies?.name || 'Your Company',
              location: updatedJob.location,
              changesDescription: `Updated ${changesDescription}`,
              dashboardUrl: `${window.location.origin}/employer/jobs/${jobId}`
            })
          });

          if (emailResponse.ok) {
            console.log('✅ Job resubmission confirmation email sent');
          } else {
            console.error('❌ Failed to send resubmission email:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('❌ Failed to send resubmission email:', emailError);
          // Don't fail the request if email fails - job was updated successfully
        }
      }

      router.push(`/employer/jobs/${jobId}`);

      // Show appropriate success message based on status change
      if (hasSignificantChanges && job.status === "approved") {
        toast.success("Job updated successfully. Your changes require admin approval before going live.", {
          duration: 6000,
        });

        // Force admin dashboard refresh for status change to pending_approval
        console.log('🔄 Job status changed to pending_approval - triggering admin refresh');
        setTimeout(() => {
          // Trigger Supabase real-time refresh with custom event
          if (typeof window !== 'undefined') {
            console.log('🔄 Dispatching forceAdminRefresh event');
            window.dispatchEvent(new CustomEvent('forceAdminRefresh', {
              detail: { jobId, newStatus: 'pending_approval' }
            }));
          }
        }, 1000);
      } else {
        toast.success("Job updated successfully");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!job) return;

    try {
      const newStatus = job.status === "archived" ? "approved" : "archived";
      
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId)
        .eq("employer_id", user?.id);

      if (error) throw error;

      setJob({ ...job, status: newStatus });
      toast.success(
        newStatus === "archived" 
          ? "Job archived successfully" 
          : "Job restored successfully"
      );
      setShowArchiveDialog(false);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId)
        .eq("employer_id", user?.id);

      if (error) throw error;

      toast.success("Job deleted successfully");
      router.push("/employer/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const copyJobLink = () => {
    const jobUrl = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(jobUrl);
    toast.success("Job link copied to clipboard");
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max && min !== max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (min) return `$${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Conditional logic for job types
  const requiresHoursConfig = editedJob.job_type === "part-time";
  const requiresContractConfig = [
    "fixed-term",
    "subcontract", 
    "casual",
    "temp-to-perm",
    "contract",
    "volunteer", 
    "internship",
  ].includes(editedJob.job_type || "");

  if (loading) {
    return (
      <EmployerLayout title="Job Management">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </EmployerLayout>
    );
  }

  if (!job) {
    return (
      <EmployerLayout title="Job Management">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Job not found</h3>
          <Button onClick={() => router.push("/employer/jobs")}>
            Back to Jobs
          </Button>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout title="Job Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/employer/jobs")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <Badge className={
              job.status === "approved" 
                ? "bg-green-100 text-green-800" 
                : job.status === "archived"
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }>
              {job.status}
            </Badge>
          </div>

          <div className="flex gap-2">
            {!isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyJobLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/jobs/${jobId}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(`/employer/jobs/${jobId}?mode=edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Job
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedJob(job);
                    router.push(`/employer/jobs/${jobId}`);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Edit Mode */}
        {isEditMode ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Job Details</CardTitle>
              <CardDescription>
                Update your job posting information
              </CardDescription>
              {job.status === "approved" && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium mb-1">Re-approval Required for Significant Changes</p>
                      <p>Changes to title, description, requirements, location, job type, salary, or highlights will require admin approval before going live.</p>
                      <p className="mt-1">Company info and application method changes are applied immediately.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="application">Application</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={editedJob.title || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editedJob.category || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <PlacesAutocomplete
                        value={editedJob.location || ""}
                        onChange={(value, placeResult) => {
                          setEditedJob({ 
                            ...editedJob, 
                            location: value,
                            suburb: placeResult?.suburb || null,
                            state: placeResult?.state || null,
                          });
                        }}
                        placeholder="Start typing an address..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_type">Location Type</Label>
                      <Select
                        value={editedJob.location_type || "onsite"}
                        onValueChange={(value) => setEditedJob({ ...editedJob, location_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="on-the-road">On the road</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Job Type</Label>
                      <Select
                        value={editedJob.job_type || "full-time"}
                        onValueChange={(value) => setEditedJob({ ...editedJob, job_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
                          <SelectItem value="fixed-term">Fixed term</SelectItem>
                          <SelectItem value="subcontract">Subcontract</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="temp-to-perm">Temp to perm</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Part-time Hours Configuration */}
                    {requiresHoursConfig && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Expected hours
                        </h4>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Show by
                          </label>
                          <Select
                            value={hoursConfig.showBy}
                            onValueChange={(value) =>
                              setHoursConfig((prev) => ({
                                ...prev,
                                showBy: value as "fixed" | "range" | "maximum" | "minimum",
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="range">Range</SelectItem>
                              <SelectItem value="maximum">Maximum</SelectItem>
                              <SelectItem value="minimum">Minimum</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {hoursConfig.showBy === "fixed" && (
                          <div className="flex items-center gap-2">
                            <span>Fixed at</span>
                            <Input
                              type="number"
                              placeholder="40"
                              className="w-20"
                              value={hoursConfig.fixedHours || ""}
                              onChange={(e) =>
                                setHoursConfig((prev) => ({
                                  ...prev,
                                  fixedHours: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <span>Hours per week</span>
                          </div>
                        )}
                        {hoursConfig.showBy === "range" && (
                          <div className="flex items-center gap-2">
                            <span>Between</span>
                            <Input
                              type="number"
                              placeholder="20"
                              className="w-20"
                              value={hoursConfig.minHours || ""}
                              onChange={(e) =>
                                setHoursConfig((prev) => ({
                                  ...prev,
                                  minHours: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <span>and</span>
                            <Input
                              type="number"
                              placeholder="40"
                              className="w-20"
                              value={hoursConfig.maxHours || ""}
                              onChange={(e) =>
                                setHoursConfig((prev) => ({
                                  ...prev,
                                  maxHours: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <span>Hours per week</span>
                          </div>
                        )}
                        {hoursConfig.showBy === "maximum" && (
                          <div className="flex items-center gap-2">
                            <span>Up to</span>
                            <Input
                              type="number"
                              placeholder="40"
                              className="w-20"
                              value={hoursConfig.maxHours || ""}
                              onChange={(e) =>
                                setHoursConfig((prev) => ({
                                  ...prev,
                                  maxHours: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <span>Hours per week</span>
                          </div>
                        )}
                        {hoursConfig.showBy === "minimum" && (
                          <div className="flex items-center gap-2">
                            <span>At least</span>
                            <Input
                              type="number"
                              placeholder="20"
                              className="w-20"
                              value={hoursConfig.minHours || ""}
                              onChange={(e) =>
                                setHoursConfig((prev) => ({
                                  ...prev,
                                  minHours: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                            <span>Hours per week</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contract Configuration */}
                    {requiresContractConfig && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          How long is the contract?
                        </h4>
                        <div className="flex items-center gap-2">
                          <span>Length</span>
                          <Input
                            type="number"
                            placeholder="6"
                            className="w-20"
                            value={contractConfig.length || ""}
                            onChange={(e) =>
                              setContractConfig((prev) => ({
                                ...prev,
                                length: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                          <span>Period</span>
                          <Select
                            value={contractConfig.period}
                            onValueChange={(value) =>
                              setContractConfig((prev) => ({
                                ...prev,
                                period: value as "days" | "weeks" | "months" | "years",
                              }))
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">day(s)</SelectItem>
                              <SelectItem value="weeks">week(s)</SelectItem>
                              <SelectItem value="months">month(s)</SelectItem>
                              <SelectItem value="years">year(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Pay Configuration */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium mb-2 block">
                          Salary Range <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Salary information is required for job filtering. Use the toggle below to control whether the salary is publicly displayed.
                        </p>
                      </div>

                      {/* Always show salary input fields */}
                      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Show pay as
                            </label>
                            <Select
                              value={payConfig.payType || "range"}
                              onValueChange={(value) =>
                                handlePayConfigChange("payType", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="range">Range</SelectItem>
                                <SelectItem value="maximum">Maximum</SelectItem>
                                <SelectItem value="minimum">Minimum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {payConfig.payType === "fixed" && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Amount
                                </label>
                                <Input
                                  type="number"
                                  placeholder="80000"
                                  value={payConfig.payAmount || ""}
                                  onChange={(e) =>
                                    handlePayConfigChange(
                                      "payAmount",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            )}

                            {payConfig.payType === "range" && (
                              <>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Minimum
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="70000"
                                    value={payConfig.payRangeMin || ""}
                                    onChange={(e) =>
                                      handlePayConfigChange(
                                        "payRangeMin",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Maximum
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="100000"
                                    value={payConfig.payRangeMax || ""}
                                    onChange={(e) =>
                                      handlePayConfigChange(
                                        "payRangeMax",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}

                            {payConfig.payType === "maximum" && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Maximum
                                </label>
                                <Input
                                  type="number"
                                  placeholder="100000"
                                  value={payConfig.payRangeMax || ""}
                                  onChange={(e) =>
                                    handlePayConfigChange(
                                      "payRangeMax",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            )}

                            {payConfig.payType === "minimum" && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Minimum
                                </label>
                                <Input
                                  type="number"
                                  placeholder="70000"
                                  value={payConfig.payRangeMin || ""}
                                  onChange={(e) =>
                                    handlePayConfigChange(
                                      "payRangeMin",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Per
                              </label>
                              <Select
                                value={payConfig.payPeriod || "year"}
                                onValueChange={(value) =>
                                  handlePayConfigChange("payPeriod", value)
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hour">Hour</SelectItem>
                                  <SelectItem value="day">Day</SelectItem>
                                  <SelectItem value="week">Week</SelectItem>
                                  <SelectItem value="month">Month</SelectItem>
                                  <SelectItem value="year">Year</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                      {/* Display Toggle */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <Label className="text-base font-medium">
                            Display salary publicly
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Toggle off to hide salary from job seekers (still used for filtering)
                          </p>
                        </div>
                        <Switch
                          checked={showPay}
                          onCheckedChange={(checked) => {
                            setShowPay(checked);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <RichTextEditor
                      value={editedJob.description || ""}
                      onChange={(value) => setEditedJob({ ...editedJob, description: value })}
                      placeholder="Describe the role, responsibilities, team culture, and what makes this opportunity exciting..."
                      minHeight="200px"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <RichTextEditor
                      value={editedJob.requirements || ""}
                      onChange={(value) => setEditedJob({ ...editedJob, requirements: value })}
                      placeholder="List the essential skills, experience, qualifications, and personal qualities required for this role..."
                      minHeight="160px"
                    />
                  </div>
                  {/* Job Highlights */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      <Label className="text-base font-medium">Job Highlights</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add up to 3 key highlights about this role (max 80 characters each)
                    </p>
                    <div className="space-y-3">
                      {highlights.map((highlight, index) => {
                        const charCount = getCharCount(highlight);
                        const isOverLimit = charCount > 80;

                        return (
                          <div key={index}>
                            <Label className="text-sm font-medium">
                              Highlight {index + 1}
                            </Label>
                            <div className="space-y-1">
                              <Input
                                placeholder={
                                  index === 0
                                    ? "e.g. Lead innovative AI solutions using cutting-edge machine learning"
                                    : index === 1
                                    ? "e.g. Work with world-class data scientists on breakthrough research"
                                    : "e.g. Competitive salary with equity and comprehensive benefits package"
                                }
                                value={highlight}
                                onChange={(e) =>
                                  handleHighlightChange(index, e.target.value)
                                }
                                className={cn(
                                  "text-base h-12",
                                  isOverLimit && "border-red-500 focus:border-red-500"
                                )}
                              />
                              <div className="flex justify-between items-center text-xs">
                                <span
                                  className={cn(
                                    "text-muted-foreground",
                                    isOverLimit && "text-red-500"
                                  )}
                                >
                                  {charCount === 0
                                    ? "No characters yet"
                                    : `${charCount}/80 characters`}
                                </span>
                                {isOverLimit && (
                                  <span className="text-red-500 text-xs">
                                    Too long! Keep it under 80 characters
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Company Information */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">Company Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={editedJob.company_name || editedJob.companies?.name || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, company_name: e.target.value })}
                        placeholder="e.g. TechCorp Australia"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_website">Company Website</Label>
                      <Input
                        id="company_website"
                        value={editedJob.company_website || editedJob.companies?.website || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, company_website: e.target.value })}
                        placeholder="https://www.yourcompany.com.au"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_description">Company Description</Label>
                      <RichTextEditor
                        value={editedJob.company_description || editedJob.companies?.description || ""}
                        onChange={(value) => setEditedJob({ ...editedJob, company_description: value })}
                        placeholder="Tell candidates about your company, culture, mission, and what makes it a great place to work..."
                        minHeight="120px"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="application" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_method">Application Method</Label>
                    <Select
                      value={editedJob.application_method || "indeed"}
                      onValueChange={(value) => setEditedJob({ ...editedJob, application_method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="external">Redirect to Company Website</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="indeed">AI Jobs Australia applications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editedJob.application_method === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="application_email">Application Email</Label>
                      <Input
                        id="application_email"
                        type="email"
                        value={editedJob.application_email || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, application_email: e.target.value })}
                      />
                    </div>
                  )}
                  {editedJob.application_method === "external" && (
                    <div className="space-y-2">
                      <Label htmlFor="application_url">Application URL</Label>
                      <Input
                        id="application_url"
                        type="url"
                        value={editedJob.application_url || ""}
                        onChange={(e) => setEditedJob({ ...editedJob, application_url: e.target.value })}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          /* View Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Job Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="capitalize">{job.job_type.replace("-", " ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {formatDate(job.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {job.highlights && job.highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Key Highlights</h3>
                      <ul className="space-y-2">
                        {job.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <HTMLRenderer content={job.description} />
                  </div>

                  {job.requirements && (
                    <div>
                      <h3 className="font-semibold mb-3">Requirements</h3>
                      <HTMLRenderer content={job.requirements} />
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Application Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Method:</span>{" "}
                        {job.application_method === "email"
                          ? `Email to ${job.application_email}`
                          : job.application_method === "external"
                          ? `Redirect to Company Website: ${job.application_url}`
                          : "AI Jobs Australia applications"}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {formatDate(job.expires_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* TODO: Applications Stats Card - Implement when application management is ready
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {stats.pending}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">
                        {stats.reviewed}
                      </div>
                      <div className="text-xs text-muted-foreground">Reviewed</div>
                    </div>
                  </div>

                  {stats.total > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-3">Recent Applicants</h4>
                        <div className="space-y-2">
                          {stats.recentApplications.map((app) => (
                            <div key={app.id} className="text-sm">
                              <div className="font-medium">{app.applicant_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(app.applied_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/employer/applications?job=${jobId}`)}
                      >
                        View All Applications
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
              */}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowArchiveDialog(true)}
                  >
                    {job.status === "archived" ? (
                      <>
                        <ArchiveRestore className="w-4 h-4 mr-2" />
                        Restore Job
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Job
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Archive Dialog */}
        <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {job?.status === "archived" ? "Restore Job?" : "Archive Job?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {job?.status === "archived"
                  ? "This will make the job visible to job seekers again."
                  : "This will hide the job from public view. You can restore it later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>
                {job?.status === "archived" ? "Restore" : "Archive"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All applications for this job will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EmployerLayout>
  );
};

// Wrapper component with Suspense to prevent re-mounts on tab switch
// Required for Next.js 15 when using useSearchParams()
export default function JobManagementPageWrapper() {
  return (
    <Suspense
      fallback={
        <EmployerLayout title="Job Management">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </EmployerLayout>
      }
    >
      <JobManagementPage />
    </Suspense>
  );
}