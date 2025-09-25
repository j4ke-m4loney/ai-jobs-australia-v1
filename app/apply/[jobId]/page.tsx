"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Upload,
  FileText,
  ArrowLeft,
  Check,
  BookOpen,
  CheckCircle,
  Info,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: "full-time" | "part-time" | "contract" | "internship";
  category: "ai" | "ml" | "data-science" | "engineering" | "research";
  salary_min: number | null;
  salary_max: number | null;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
  employer_questions: Array<{id: string; question: string; required: boolean}> | null;
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
      .eq("status", "approved")
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/jobs");
    } else {
      setJob(data as Job);
    }
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

  // Fetch job details and user documents on component mount
  useEffect(() => {
    if (jobId && user) {
      fetchJobDetails();
      fetchUserDocuments();
    }
  }, [jobId, user, fetchJobDetails, fetchUserDocuments]);

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

      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        applicant_id: user.id,
        resume_url: resumeDoc?.file_path,
        cover_letter_url: coverLetterDoc?.file_path,
        status: "submitted",
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      router.push("/jobseeker/applications");
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getCategoryDisplay = (category: string) => {
    const categories = {
      ai: "Artificial Intelligence",
      ml: "Machine Learning",
      "data-science": "Data Science",
      engineering: "Engineering",
      research: "Research",
    };
    return categories[category as keyof typeof categories] || category;
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {job.is_featured && (
                    <Badge className="bg-gradient-hero text-white">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getCategoryDisplay(job.category)}
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {job.title}
                </h1>

                <div className="text-lg font-medium text-muted-foreground mb-3">
                  {job.companies?.name || "Company"}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location} ({job.location_type})
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{job.job_type}</span>
                  </div>
                </div>

                {formatSalary(job.salary_min, job.salary_max) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Job Description
              </h3>
              <div className="prose max-w-none text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Requirements
                </h3>
                <div className="prose max-w-none text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
                </div>
              </div>
            )}

            {/* Company Info Section - placeholder for future enhancement */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                About the Company
              </h3>
              {job.companies ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    {job.companies.description || "Company description not available."}
                  </p>
                  {/* Commenting out company website link to keep users focused on completing application
                  {job.companies.website && (
                    <a
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Visit Company Website
                    </a>
                  )} */}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Company information not available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
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
                            <Badge variant="secondary" className="ml-2 text-xs">
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
                        {uploadingResume ? "Uploading..." : "Upload New Resume"}
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
                            <Badge variant="secondary" className="ml-2 text-xs">
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
                    {job.employer_questions.map(
                      (question, index: number) => (
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
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleSubmitApplication}
                disabled={submitting || !selectedResume}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Application...
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
      </div>
      
      <Footer />
    </div>
  );
};

