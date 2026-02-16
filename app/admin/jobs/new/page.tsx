"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Check,
  Briefcase,
  FileText,
  Settings,
  Save,
  Eye,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobFormData2 } from "@/types/job2";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobImportCard } from "@/components/admin/JobImportCard";
import type { ExtractedJobData } from "@/lib/job-import/extract-job-data";

// Reuse existing step components
import JobBasicsStep from "@/components/post-job2/JobBasicsStep";
import { CategoryCombobox } from "@/components/admin/CategoryCombobox";
import DescribeJobStep from "@/components/post-job2/DescribeJobStep";
import ApplicationSettingsStep from "@/components/post-job2/ApplicationSettingsStep";
import JobPreviewModal from "@/components/post-job2/JobPreviewModal";

const steps = [
  {
    id: 1,
    title: "Job Basics",
    description: "Title, details & compensation",
    icon: Briefcase,
  },
  {
    id: 2,
    title: "Describe Job",
    description: "Description and requirements",
    icon: FileText,
  },
  {
    id: 3,
    title: "Application Settings",
    description: "How to apply",
    icon: Settings,
  },
  {
    id: 4,
    title: "Admin Options",
    description: "Special admin settings",
    icon: Star,
  },
];

interface AdminOptions {
  autoApprove: boolean;
  isFeatured: boolean;
  featuredDays: number;
  adminNotes: string;
  postOnBehalfOf: string;
  category: string;
}

// Helper functions to calculate salary from payConfig
function convertToAnnualSalary(amount: number, period: string): number {
  const multipliers: { [key: string]: number } = {
    'hour': 2080,
    'day': 260,
    'week': 52,
    'month': 12,
    'year': 1,
  };

  return Math.round(amount * (multipliers[period] || 1));
}

function getSalaryMin(payConfig: JobFormData2['payConfig']): number | null {
  // Always calculate salary for filtering purposes, regardless of showPay
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMin && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payRangeMin, payConfig.payPeriod);
  }
  if (payConfig.payType === 'minimum' && payConfig.payRangeMin && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payRangeMin, payConfig.payPeriod);
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }

  return null;
}

function getSalaryMax(payConfig: JobFormData2['payConfig']): number | null {
  // Always calculate salary for filtering purposes, regardless of showPay
  if (!payConfig) return null;

  if (payConfig.payType === 'range' && payConfig.payRangeMax && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payRangeMax, payConfig.payPeriod);
  }
  if (payConfig.payType === 'maximum' && payConfig.payRangeMax && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payRangeMax, payConfig.payPeriod);
  }
  if (payConfig.payType === 'fixed' && payConfig.payAmount && payConfig.payPeriod) {
    return convertToAnnualSalary(payConfig.payAmount, payConfig.payPeriod);
  }

  return null;
}

export default function AdminNewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importCounter, setImportCounter] = useState(0);

  // Form data
  const [formData, setFormData] = useState<JobFormData2>({
    // Job Basics
    jobTitle: "",
    locationAddress: "",
    locationSuburb: "",
    locationState: "",
    locationPostcode: "",
    locationType: "in-person",

    // Job Details
    jobTypes: ["full-time"],
    hoursConfig: {
      showBy: "fixed",
      fixedHours: 40,
    },

    // Pay and Benefits
    payConfig: {
      showPay: true,
      payType: "range",
      payRangeMin: 80000,
      payRangeMax: 120000,
      payPeriod: "year",
      currency: "AUD",
    },
    benefits: [],
    highlights: ["", "", ""], // Initialize with empty highlights like the original component expects

    // Describe Job
    jobDescription: "",
    requirements: "",

    // Application Settings
    applicationMethod: "email",
    applicationUrl: "",
    applicationEmail: "",
    communicationPrefs: {
      emailUpdates: true,
      phoneScreening: false,
    },
    hiringTimeline: "flexible",

    // Pricing (admin bypass)
    pricingTier: "standard",

    // Company Info
    companyName: "",
    companyLogo: null,
    companyDescription: "",
    companyWebsite: "",
  });

  // Admin-specific options
  const [adminOptions, setAdminOptions] = useState<AdminOptions>({
    autoApprove: true,
    isFeatured: false,
    featuredDays: 30,
    adminNotes: "",
    postOnBehalfOf: "",
    category: "ai",
  });

  // Companies list for dropdown
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

  // Categories list for dropdown
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch companies and categories on mount
  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (data) {
        setCompanies(data);
      }
      if (error) {
        console.error('Error fetching companies:', error);
      }
    }

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('jobs')
        .select('category')
        .not('category', 'is', null);

      if (data) {
        // Get unique categories and format them
        const uniqueCategories = [...new Set(data.map(job => job.category).filter(Boolean))];
        const formattedCategories = uniqueCategories.map(cat => ({
          value: cat,
          label: cat.split('-').map((word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
        })).sort((a, b) => a.label.localeCompare(b.label));

        setCategories(formattedCategories);
      }
      if (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCompanies();
    fetchCategories();
  }, []);

  const updateFormData = (updates: Partial<JobFormData2>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImport = (data: ExtractedJobData) => {
    // Map pay data
    const payConfig: JobFormData2["payConfig"] = {
      showPay: !data.salaryIsEstimated,
      payType: data.payType || "range",
      payRangeMin: data.payRangeMin ?? undefined,
      payRangeMax: data.payRangeMax ?? undefined,
      payAmount: data.payAmount ?? undefined,
      payPeriod: data.payPeriod || "year",
      currency: "AUD",
    };

    setFormData({
      jobTitle: data.jobTitle,
      locationAddress: data.locationAddress,
      locationType: data.locationType,
      jobTypes: data.jobTypes as JobFormData2["jobTypes"],
      hoursConfig: { showBy: "fixed", fixedHours: 40 },
      contractConfig: data.jobTypes.includes("internship")
        ? { length: 3, period: "months" }
        : undefined,
      payConfig,
      benefits: [],
      highlights: [data.highlight1, data.highlight2, data.highlight3],
      jobDescription: data.jobDescription,
      requirements: data.requirements,
      applicationMethod: data.applicationMethod,
      applicationUrl: data.applicationUrl,
      applicationEmail: data.applicationEmail,
      communicationPrefs: { emailUpdates: true, phoneScreening: false },
      hiringTimeline: "flexible",
      pricingTier: "standard",
      companyName: data.companyName,
      companyLogo: null,
      companyDescription: "",
      companyWebsite: data.companyWebsite,
    });

    setAdminOptions((prev) => ({
      ...prev,
      category: data.category,
    }));

    // Force step components to remount with fresh defaultValues
    setImportCounter((c) => c + 1);
    setCurrentStep(1);
    toast.success("Job data imported — review each step and submit.");
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // First, handle company creation/lookup
      let companyId = null;

      if (formData.companyName.trim()) {
        // Check if company already exists
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .eq("name", formData.companyName.trim())
          .single();

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          // Create new company
          const { data: newCompany, error: companyError } = await supabase
            .from("companies")
            .insert([{
              name: formData.companyName.trim(),
              description: formData.companyDescription || null,
              website: formData.companyWebsite || null,
              logo_url: null, // Handle file upload separately if needed
            }])
            .select("id")
            .single();

          if (companyError) throw companyError;
          companyId = newCompany.id;
        }
      }

      // Map location type correctly
      const locationTypeMap: Record<string, string> = {
        "in-person": "onsite",
        "fully-remote": "remote",
        "hybrid": "hybrid",
        "on-the-road": "onsite" // fallback
      };

      // Prepare job data matching the exact database schema
      const jobData = {
        // Required fields
        title: formData.jobTitle,
        description: formData.jobDescription,
        location: formData.locationAddress || `${formData.locationSuburb}, ${formData.locationState}`,
        employer_id: adminOptions.postOnBehalfOf || user.id,

        // Optional fields that match schema
        requirements: formData.requirements || null,
        location_type: locationTypeMap[formData.locationType] || "onsite",
        job_type: formData.jobTypes[0], // Use first selected type for DB compatibility
        category: adminOptions.category,
        salary_min: getSalaryMin(formData.payConfig),
        salary_max: getSalaryMax(formData.payConfig),
        show_salary: formData.payConfig.showPay,

        // Application settings
        application_method: formData.applicationMethod === "external" ? "external" : "email",
        application_url: formData.applicationUrl || null,
        application_email: formData.applicationEmail || null,

        // Company reference
        company_id: companyId,

        // Admin specific fields
        status: adminOptions.autoApprove ? "approved" : "pending_approval",
        payment_status: "completed", // Admin bypasses payment
        is_featured: adminOptions.isFeatured,
        featured_until: adminOptions.isFeatured
          ? new Date(Date.now() + adminOptions.featuredDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
        featured_order: adminOptions.isFeatured ? 1 : 0,

        // Array fields (existing schema)
        highlights: formData.highlights.filter(h => h.trim() !== ""), // Remove empty highlights

        // Admin tracking
        posted_by_admin: true,
        admin_notes: adminOptions.adminNotes || null,
        reviewed_at: adminOptions.autoApprove ? new Date().toISOString() : null,
        reviewed_by: adminOptions.autoApprove ? user.id : null,

        // Timestamps (let database handle created_at and updated_at)
        expires_at: new Date(
          Date.now() + (adminOptions.isFeatured ? adminOptions.featuredDays : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      console.log("Submitting job data:", jobData);

      // Insert job directly (bypass payment)
      const { data, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Log admin action
      console.log("Admin posted job successfully:", data.id);

      toast.success("Job posted successfully!");
      router.push("/admin/jobs");

    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(`Failed to post job: ${(error as Error)?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <JobBasicsStep
            key={`basics-${importCounter}`}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <DescribeJobStep
            key={`describe-${importCounter}`}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrev={() => setCurrentStep(currentStep - 1)}
            onShowPreview={() => {}}
            companies={companies}
          />
        );
      case 3:
        return (
          <ApplicationSettingsStep
            key={`application-${importCounter}`}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrev={() => setCurrentStep(currentStep - 1)}
          />
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve this job</Label>
                  <p className="text-sm text-muted-foreground">
                    Skip the approval process and publish immediately
                  </p>
                </div>
                <Switch
                  checked={adminOptions.autoApprove}
                  onCheckedChange={(checked) =>
                    setAdminOptions((prev) => ({ ...prev, autoApprove: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Feature this job</Label>
                  <p className="text-sm text-muted-foreground">
                    Show in featured section and boost visibility
                  </p>
                </div>
                <Switch
                  checked={adminOptions.isFeatured}
                  onCheckedChange={(checked) =>
                    setAdminOptions((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
              </div>

              {adminOptions.isFeatured && (
                <div className="space-y-2">
                  <Label>Featured duration (days)</Label>
                  <Input
                    type="number"
                    value={adminOptions.featuredDays}
                    onChange={(e) =>
                      setAdminOptions((prev) => ({
                        ...prev,
                        featuredDays: parseInt(e.target.value) || 30,
                      }))
                    }
                    min={1}
                    max={365}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Job Category</Label>
                <CategoryCombobox
                  value={adminOptions.category}
                  onChange={(value) =>
                    setAdminOptions((prev) => ({ ...prev, category: value }))
                  }
                  categories={categories}
                />
              </div>

              <div className="space-y-2">
                <Label>Company Information</Label>
                <Input
                  placeholder="Company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData({ companyName: e.target.value })
                  }
                />
                <Input
                  placeholder="Company website (optional)"
                  value={formData.companyWebsite}
                  onChange={(e) =>
                    updateFormData({ companyWebsite: e.target.value })
                  }
                />
                <RichTextEditor
                  value={formData.companyDescription || ""}
                  onChange={(value) =>
                    updateFormData({ companyDescription: value })
                  }
                  placeholder="Company description (optional)"
                  minHeight="120px"
                />
              </div>

              <div className="space-y-2">
                <Label>Admin notes (internal only)</Label>
                <Textarea
                  placeholder="Any internal notes about this job posting..."
                  value={adminOptions.adminNotes}
                  onChange={(e) =>
                    setAdminOptions((prev) => ({
                      ...prev,
                      adminNotes: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Post on behalf of (User ID - optional)</Label>
                <Input
                  placeholder="Leave empty to post as yourself"
                  value={adminOptions.postOnBehalfOf}
                  onChange={(e) =>
                    setAdminOptions((prev) => ({
                      ...prev,
                      postOnBehalfOf: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter a user ID to post this job on their behalf
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Post New Job (Admin)</h1>
            <p className="text-muted-foreground mt-2">
              Create a job posting without payment processing
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!formData.jobTitle || !formData.jobDescription}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        {/* Import Card */}
        <JobImportCard onImport={handleImport} companies={companies} />

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors",
                  currentStep >= step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-4 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="w-full">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.jobTitle || !formData.jobDescription}
            >
              {isSubmitting ? (
                "Posting..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Post Job (No Payment)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <JobPreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            formData={formData}
          />
        )}
      </div>
    </AdminLayout>
  );
}