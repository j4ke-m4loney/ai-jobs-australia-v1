"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";
import {
  MapPin,
  Building2,
  Briefcase,
  Clock,
  DollarSign,
  Upload,
  FileText,
  ArrowLeft,
  Check,
  ExternalLink,
  Mail,
} from "lucide-react";
import { formatSalary } from "@/lib/salary-utils";
import { appendUtmParams } from "@/lib/utils";
import { getCombinedJobContent, formatJobTypes } from "@/lib/jobs/content-utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trackInternalApplicationStarted, trackApplicationSubmitted } from "@/lib/analytics";
import { trackExternalApply } from "@/lib/applications/track-external-apply";
import { getTimeAgo } from "@/lib/date-utils";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: string[];
  category: "ai" | "ml" | "data-science" | "engineering" | "research";
  salary_min: number | null;
  salary_max: number | null;
  salary_period?: string;
  show_salary?: boolean;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
  application_method: string;
  application_url: string | null;
  application_email: string | null;
  disable_utm_tracking?: boolean;
  employer_questions: Array<{
    id: string;
    question: string;
    required: boolean;
  }> | null;
  companies?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
}

interface UserDocument {
  id: string;
  file_name: string;
  document_type: string;
  file_path: string;
  is_default: boolean;
}

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Hide sticky mobile button when the application form is in view
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [job]);

  // Form state
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string>("");
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, string>
  >({});
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Define callback functions first
  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return;

    setJobLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        companies (
          id,
          name,
          description,
          website,
          logo_url
        )
      `
      )
      .eq("id", jobId)
      .single();

    if (error || !data) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/jobs");
      setJobLoading(false);
      return;
    }

    // Expired or otherwise non-applyable — send them to the detail page so
    // they see the expired state and similar-roles link rather than a silent
    // bounce back to the listings.
    if (data.status !== "approved") {
      toast.info("This role is no longer accepting applications");
      router.push(`/jobs/${jobId}`);
      setJobLoading(false);
      return;
    }

    setJob(data as Job);

    // Track internal application started
    trackInternalApplicationStarted({
      job_id: data.id,
      job_title: data.title,
      company: data.companies?.name || "Unknown",
    });
    setJobLoading(false);
  }, [jobId, router]);

  const fetchUserDocuments = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setUserDocuments(data || []);

      // Auto-select default documents
      const defaultResume = data?.find(
        (doc) => doc.document_type === "resume" && doc.is_default
      );
      const defaultCoverLetter = data?.find(
        (doc) => doc.document_type === "cover_letter" && doc.is_default
      );

      if (defaultResume) setSelectedResume(defaultResume.id);
      if (defaultCoverLetter) setSelectedCoverLetter(defaultCoverLetter.id);
    }
  }, [user]);

  // Check if user has already applied for this job
  const checkExistingApplication = useCallback(async () => {
    if (!user || !jobId) return;

    setCheckingApplication(true);
    try {
      const response = await fetch(
        `/api/applications?userId=${user.id}&jobId=${jobId}&type=applicant`
      );

      if (response.ok) {
        const data = await response.json();
        const hasExistingApplication =
          data.applications && data.applications.length > 0;
        setHasApplied(hasExistingApplication);

        if (hasExistingApplication) {
          toast.info("You have already applied for this job.");
        }
      }
    } catch (error) {
      console.error("Error checking existing application:", error);
    } finally {
      setCheckingApplication(false);
    }
  }, [user, jobId]);

  // Fetch job details and user documents on component mount
  useEffect(() => {
    if (jobId && user) {
      fetchJobDetails();
      fetchUserDocuments();
      checkExistingApplication();
    }
  }, [
    jobId,
    user,
    fetchJobDetails,
    fetchUserDocuments,
    checkExistingApplication,
  ]);

  const handleFileUpload = async (
    file: File,
    documentType: "resume" | "cover_letter"
  ) => {
    if (!user) return;

    const isResume = documentType === "resume";
    if (isResume) {
      setUploadingResume(true);
    } else {
      setUploadingCoverLetter(true);
    }

    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(documentType === "resume" ? "resumes" : "cover-letters")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error: dbError } = await supabase
        .from("user_documents")
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          is_default: false,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setUserDocuments((prev) => [data, ...prev]);

      if (isResume) {
        setSelectedResume(data.id);
      } else {
        setSelectedCoverLetter(data.id);
      }

      toast.success(
        `${
          documentType === "resume" ? "Resume" : "Cover letter"
        } uploaded successfully!`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Failed to upload ${
          documentType === "resume" ? "resume" : "cover letter"
        }`
      );
    } finally {
      if (isResume) {
        setUploadingResume(false);
      } else {
        setUploadingCoverLetter(false);
      }
    }
  };

  const handleSubmitApplication = async () => {
    if (!user || !job) return;

    // Check if user has already applied
    if (hasApplied) {
      toast.error("You have already applied for this job");
      return;
    }

    if (!selectedResume) {
      toast.error("Please select or upload a resume");
      return;
    }

    // Check required questions
    const requiredQuestions =
      job.employer_questions?.filter((q) => q.required) || [];
    const missingAnswers = requiredQuestions.filter(
      (q) => !questionAnswers[q.id]?.trim()
    );

    if (missingAnswers.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }

    setSubmitting(true);

    try {
      const resumeDoc = userDocuments.find((doc) => doc.id === selectedResume);
      const coverLetterDoc = selectedCoverLetter
        ? userDocuments.find((doc) => doc.id === selectedCoverLetter)
        : null;

      // Call the API endpoint instead of direct Supabase insert
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          applicantId: user.id,
          resumeUrl: resumeDoc?.file_path,
          coverLetterUrl: coverLetterDoc?.file_path,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      // Track successful application submission
      trackApplicationSubmitted({
        job_id: job.id,
        job_title: job.title,
        company: job.companies?.name || "Unknown",
        has_resume: !!selectedResume,
        has_cover_letter: !!selectedCoverLetter,
      });

      toast.success("Application submitted successfully!");
      setHasApplied(true); // Update local state to prevent duplicate submissions
      router.push("/jobseeker/applications");
    } catch (error) {
      console.error("Application error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit application";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || jobLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !job) {
    return null;
  }

  const resumes = userDocuments.filter((doc) => doc.document_type === "resume");
  const coverLetters = userDocuments.filter(
    (doc) => doc.document_type === "cover_letter"
  );

  // Determine if this is an internal application (needs full form below grid)
  const isInternal = !job.application_method || job.application_method === "internal";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Header + Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {job.companies?.logo_url && (
                    <Image
                      src={job.companies.logo_url}
                      alt={job.companies?.name || "Company logo"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{job.companies?.name || "Unknown Company"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <LocationTypeBadge locationType={job.location_type} />
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{formatJobTypes(job.job_type)}</span>
                      </div>
                      {job.show_salary !== false &&
                        (job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
                  <div dangerouslySetInnerHTML={{ __html: getCombinedJobContent(job.description, job.requirements) }} />
                </div>

                {/* Company Info Section */}
                {job.companies?.description && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      About the Company
                    </h3>
                    <p className="text-muted-foreground">
                      {job.companies.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internal Application Form - Same width as description */}
            {isInternal && (
              <Card id="application-form" ref={formRef}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submit Your Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resume Section */}
                  <div>
                    <Label className="text-base font-semibold">Resume *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select an existing resume or upload a new one
                    </p>

                    <div className="space-y-3">
                      {resumes.length > 0 && (
                        <div className="space-y-2">
                          {resumes.map((resume) => (
                            <div
                              key={resume.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`resume-${resume.id}`}
                                name="resume"
                                value={resume.id}
                                checked={selectedResume === resume.id}
                                onChange={(e) => setSelectedResume(e.target.value)}
                                className="text-primary"
                              />
                              <Label
                                htmlFor={`resume-${resume.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                {resume.file_name}
                                {resume.is_default && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Default
                                  </Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "resume");
                          }}
                          className="hidden"
                        />
                        <Label htmlFor="resume-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            disabled={uploadingResume}
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingResume
                                ? "Uploading..."
                                : "Upload New Resume"}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Section */}
                  <div>
                    <Label className="text-base font-semibold">
                      Cover Letter (Optional)
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select an existing cover letter or upload a new one
                    </p>

                    <div className="space-y-3">
                      {coverLetters.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="no-cover-letter"
                              name="cover-letter"
                              value=""
                              checked={selectedCoverLetter === ""}
                              onChange={() => setSelectedCoverLetter("")}
                              className="text-primary"
                            />
                            <Label
                              htmlFor="no-cover-letter"
                              className="cursor-pointer"
                            >
                              No cover letter
                            </Label>
                          </div>

                          {coverLetters.map((coverLetter) => (
                            <div
                              key={coverLetter.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`cover-letter-${coverLetter.id}`}
                                name="cover-letter"
                                value={coverLetter.id}
                                checked={selectedCoverLetter === coverLetter.id}
                                onChange={(e) =>
                                  setSelectedCoverLetter(e.target.value)
                                }
                                className="text-primary"
                              />
                              <Label
                                htmlFor={`cover-letter-${coverLetter.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                {coverLetter.file_name}
                                {coverLetter.is_default && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Default
                                  </Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          id="cover-letter-upload"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "cover_letter");
                          }}
                          className="hidden"
                        />
                        <Label htmlFor="cover-letter-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            disabled={uploadingCoverLetter}
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingCoverLetter
                                ? "Uploading..."
                                : "Upload New Cover Letter"}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Employer Questions */}
                  {job.employer_questions &&
                    Array.isArray(job.employer_questions) &&
                    job.employer_questions.length > 0 && (
                      <div>
                        <Label className="text-base font-semibold">
                          Additional Questions
                        </Label>
                        <div className="space-y-4 mt-3">
                          {job.employer_questions.map((question, index: number) => (
                            <div key={question.id}>
                              <Label htmlFor={`question-${question.id}`}>
                                {index + 1}. {question.question}
                                {question.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </Label>
                              <Textarea
                                id={`question-${question.id}`}
                                value={questionAnswers[question.id] || ""}
                                onChange={(e) =>
                                  setQuestionAnswers((prev) => ({
                                    ...prev,
                                    [question.id]: e.target.value,
                                  }))
                                }
                                className="mt-1"
                                rows={3}
                                placeholder="Enter your answer..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      onClick={handleSubmitApplication}
                      disabled={
                        submitting ||
                        !selectedResume ||
                        hasApplied ||
                        checkingApplication
                      }
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    >
                      {checkingApplication ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking Application Status...
                        </>
                      ) : submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Application...
                        </>
                      ) : hasApplied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Already Applied
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Application Sidebar - hidden on mobile, sticky on desktop, hides when form is in view */}
          <div className="hidden lg:block space-y-6">
            <div className={`lg:sticky lg:top-24 transition-opacity duration-200 ${isInternal && formVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Posted {getTimeAgo(job.created_at)}</span>
                </div>

                <Separator />

                {job.application_method === "external" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This position requires you to apply directly on the company&apos;s website.
                    </p>
                    <Button
                      onClick={() => {
                        if (job.application_url) {
                          window.open(appendUtmParams(job.application_url, job.disable_utm_tracking), "_blank");
                          if (user) {
                            trackExternalApply(supabase, job.id, user.id, 'external');
                          }
                        }
                      }}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply on Company Site
                    </Button>
                  </div>
                ) : job.application_method === "email" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This position requires you to apply via email.
                    </p>
                    <Button
                      onClick={() => {
                        if (job.application_email) {
                          window.location.href = `mailto:${job.application_email}?subject=Application for ${job.title}`;
                          if (user) {
                            trackExternalApply(supabase, job.id, user.id, 'email');
                          }
                        }
                      }}
                      className="w-full gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Apply via Email
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasApplied ? (
                      <p className="text-sm text-center">
                        <span className="font-medium text-green-600">Applied</span>
                        {" · "}
                        <a href="/jobseeker/applications" className="text-primary hover:underline">
                          Track application
                        </a>
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Complete the application form below to apply.
                        </p>
                        <Button
                          onClick={() => {
                            document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Apply Now
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky mobile apply button - hides when form is in view */}
      {isInternal && !hasApplied && !formVisible && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg lg:hidden z-50">
          <Button
            onClick={() => {
              document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full gap-2"
            size="lg"
          >
            <FileText className="w-4 h-4" />
            Apply Now
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}
