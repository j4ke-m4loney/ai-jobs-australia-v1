"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCombobox } from "@/components/admin/CategoryCombobox";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "permanent", label: "Permanent" },
  { value: "fixed-term", label: "Fixed-term" },
  { value: "casual", label: "Casual" },
  { value: "graduate", label: "Graduate" },
] as const;

const STATUS_OPTIONS = [
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
] as const;

interface JobEditData {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  location_type: string;
  job_type: string[];
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  highlights: string[];
  application_url: string | null;
  application_email: string | null;
  disable_utm_tracking: boolean;
  admin_notes: string | null;
  is_featured: boolean;
  status: string;
}

export default function AdminJobEditPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("onsite");
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [showSalary, setShowSalary] = useState(true);
  const [highlights, setHighlights] = useState(["", "", ""]);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [disableUtmTracking, setDisableUtmTracking] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("pending_approval");

  const fetchJob = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, description, requirements, location, location_type, job_type, category, salary_min, salary_max, show_salary, highlights, application_url, application_email, disable_utm_tracking, admin_notes, is_featured, status"
        )
        .eq("id", jobId)
        .single();

      if (error) throw error;

      const job = data as JobEditData;
      setTitle(job.title || "");
      setLocation(job.location || "");
      setLocationType(job.location_type || "onsite");
      setJobTypes(Array.isArray(job.job_type) ? job.job_type : job.job_type ? [job.job_type] : []);
      setCategory(job.category || "");
      setSalaryMin(job.salary_min != null ? String(job.salary_min) : "");
      setSalaryMax(job.salary_max != null ? String(job.salary_max) : "");
      setShowSalary(job.show_salary !== false);
      setHighlights([
        job.highlights?.[0] || "",
        job.highlights?.[1] || "",
        job.highlights?.[2] || "",
      ]);
      setDescription(job.description || "");
      setRequirements(job.requirements || "");
      setApplicationUrl(job.application_url || "");
      setApplicationEmail(job.application_email || "");
      setDisableUtmTracking(job.disable_utm_tracking || false);
      setAdminNotes(job.admin_notes || "");
      setIsFeatured(job.is_featured || false);
      setStatus(job.status || "pending_approval");
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job");
      router.push("/admin/jobs");
    } finally {
      setIsLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const filteredHighlights = highlights.filter((h) => h.trim() !== "");

      const { error } = await supabase
        .from("jobs")
        .update({
          title: title.trim(),
          location: location.trim(),
          location_type: locationType,
          job_type: jobTypes,
          category,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          show_salary: showSalary,
          highlights: filteredHighlights.length > 0 ? filteredHighlights : null,
          description,
          requirements,
          application_url: applicationUrl.trim() || null,
          application_email: applicationEmail.trim() || null,
          disable_utm_tracking: disableUtmTracking,
          admin_notes: adminNotes.trim() || null,
          is_featured: isFeatured,
          featured_until: isFeatured
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          status,
        })
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Job updated successfully");
      router.push(`/admin/jobs/${jobId}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleJobType = (value: string) => {
    setJobTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading job...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/jobs/${jobId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Job</h1>
              <p className="text-muted-foreground mt-1">
                Edit job listing details
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Job Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Job Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sydney, NSW"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_type">Location Type</Label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Type</Label>
              <div className="flex flex-wrap gap-4">
                {JOB_TYPE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`jobtype-${option.value}`}
                      checked={jobTypes.includes(option.value)}
                      onCheckedChange={() => toggleJobType(option.value)}
                    />
                    <Label
                      htmlFor={`jobtype-${option.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <CategoryCombobox value={category} onChange={setCategory} />
            </div>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader>
            <CardTitle>Salary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 120000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 160000"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Show Salary</Label>
                <p className="text-sm text-muted-foreground">
                  Display salary range publicly on the job listing
                </p>
              </div>
              <Switch checked={showSalary} onCheckedChange={setShowSalary} />
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`highlight-${index}`}>
                  Highlight {index + 1}
                </Label>
                <Input
                  id={`highlight-${index}`}
                  value={highlight}
                  onChange={(e) => {
                    const updated = [...highlights];
                    updated[index] = e.target.value;
                    setHighlights(updated);
                  }}
                  placeholder={`e.g. ${
                    index === 0
                      ? "Competitive salary + equity"
                      : index === 1
                        ? "Flexible remote work"
                        : "World-class AI team"
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Job Description</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter job description..."
                minHeight="250px"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements</Label>
              <RichTextEditor
                value={requirements}
                onChange={setRequirements}
                placeholder="Enter job requirements..."
                minHeight="200px"
              />
            </div>
          </CardContent>
        </Card>

        {/* Application */}
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application_url">Application URL</Label>
              <Input
                id="application_url"
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_email">Application Email</Label>
              <Input
                id="application_email"
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="hiring@company.com"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Disable UTM Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Turn off UTM params for application URLs that break with extra
                  query parameters
                </p>
              </div>
              <Switch
                checked={disableUtmTracking}
                onCheckedChange={setDisableUtmTracking}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not visible to users)..."
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Feature this job on the homepage and in search results
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Button */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
