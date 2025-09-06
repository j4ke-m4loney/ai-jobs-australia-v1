"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Info,
  Heart,
  ExternalLink,
  Upload,
  FileText,
  Check,
  Search,
} from "lucide-react";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";

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
  employer_questions: any; // Flexible type for JSON data
}

interface UserDocument {
  id: string;
  file_name: string;
  document_type: string;
  file_path: string;
  is_default: boolean;
}

export default function SavedJobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toggleSaveJob, isJobSaved, unsaveJob } = useSavedJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Form state
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string>("");
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, string>
  >({});
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);

  // Fetch job details
  useEffect(() => {
    if (jobId && user) {
      fetchJobDetails();
      fetchUserDocuments();
    }
  }, [jobId, user]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    setJobLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("status", "approved")
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/jobseeker/saved-jobs");
    } else {
      setJob(data as Job);
    }
    setJobLoading(false);
  };

  const fetchUserDocuments = async () => {
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
  };

  const handleFileUpload = async (
    file: File,
    documentType: "resume" | "cover_letter"
  ) => {
    if (!user) return;

    const isResume = documentType === "resume";
    isResume ? setUploadingResume(true) : setUploadingCoverLetter(true);

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
      isResume ? setUploadingResume(false) : setUploadingCoverLetter(false);
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
      (job.employer_questions as any[])?.filter((q: any) => q.required) || [];
    const missingAnswers = requiredQuestions.filter(
      (q: any) => !questionAnswers[q.id]?.trim()
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

      // Submit the application first
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        applicant_id: user.id,
        resume_url: resumeDoc?.file_path,
        cover_letter_url: coverLetterDoc?.file_path,
        status: "submitted",
      });

      if (error) throw error;

      // Try to auto-remove from saved jobs (non-blocking)
      // Only if the job was actually saved in the first place
      if (isJobSaved(job.id)) {
        try {
          await unsaveJob(job.id);
        } catch (unsaveError) {
          // Log but don't block the success flow
          console.log("Could not unsave job:", unsaveError);
        }
      }

      // Show success screen - application was successful
      setApplicationSubmitted(true);
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsaveJob = async () => {
    if (!job) return;
    
    try {
      await toggleSaveJob(job.id);
      toast.success("Job removed from saved jobs");
      router.push("/jobseeker/saved-jobs");
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast.error("Failed to remove job");
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  if (loading || jobLoading) {
    return (
      <JobSeekerLayout title="Job Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  if (!user || !job) {
    return null;
  }

  return (
    <JobSeekerLayout title="Job Details">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobseeker/saved-jobs")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Saved Jobs
        </Button>

        {/* Job Summary */}
        <Card>
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Saved
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {job.title}
                </h1>

                <div className="text-lg font-medium text-muted-foreground mb-3">
                  Company
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
                  <span className="text-xs">
                    Posted {getTimeAgo(job.created_at)}
                  </span>
                </div>

                {formatSalary(job.salary_min, job.salary_max) && (
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleUnsaveJob}
                    className="gap-2"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    Remove from Saved
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
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
              <p className="text-muted-foreground">
                Company information will be displayed here when available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Application Section */}
        {applicationSubmitted ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Application Sent Successfully!
                  </h2>
                  <p className="text-muted-foreground">
                    Your application for <strong>{job.title}</strong> has been submitted and is now under review.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-sm">
                  <p className="text-muted-foreground">
                    You can track the status of this application and all your other applications 
                    in your dashboard.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => router.push("/jobseeker/applications")}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View My Applications
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/jobseeker/saved-jobs")}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Back to Saved Jobs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/jobs")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse More Jobs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Apply for This Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* Resume Selection/Upload */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-sm font-medium">
                  Resume *
                </Label>
                <div className="space-y-3 mt-2">
                  {userDocuments.filter(doc => doc.document_type === 'resume').length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Select from your uploaded resumes:</p>
                      {userDocuments
                        .filter(doc => doc.document_type === 'resume')
                        .map(doc => (
                          <label key={doc.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="resume"
                              value={doc.id}
                              checked={selectedResume === doc.id}
                              onChange={(e) => setSelectedResume(e.target.value)}
                              className="text-primary"
                            />
                            <span className="text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {doc.file_name}
                              {doc.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </span>
                          </label>
                        ))}
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Or upload a new resume
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, 'resume');
                          }
                        }}
                        className="hidden"
                        id="resume-upload"
                        disabled={uploadingResume}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        disabled={uploadingResume}
                      >
                        {uploadingResume ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingResume ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter Selection/Upload */}
              <div>
                <Label htmlFor="cover-letter" className="text-sm font-medium">
                  Cover Letter (Optional)
                </Label>
                <div className="space-y-3 mt-2">
                  {userDocuments.filter(doc => doc.document_type === 'cover_letter').length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Select from your uploaded cover letters:</p>
                      {userDocuments
                        .filter(doc => doc.document_type === 'cover_letter')
                        .map(doc => (
                          <label key={doc.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="cover-letter"
                              value={doc.id}
                              checked={selectedCoverLetter === doc.id}
                              onChange={(e) => setSelectedCoverLetter(e.target.value)}
                              className="text-primary"
                            />
                            <span className="text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {doc.file_name}
                              {doc.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </span>
                          </label>
                        ))}
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Or upload a new cover letter
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, 'cover_letter');
                          }
                        }}
                        className="hidden"
                        id="cover-letter-upload"
                        disabled={uploadingCoverLetter}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('cover-letter-upload')?.click()}
                        disabled={uploadingCoverLetter}
                      >
                        {uploadingCoverLetter ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingCoverLetter ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employer Questions */}
            {job.employer_questions && Array.isArray(job.employer_questions) && job.employer_questions.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium text-foreground">Additional Questions</h4>
                {job.employer_questions.map((question: any) => (
                  <div key={question.id} className="space-y-2">
                    <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Textarea
                      id={`question-${question.id}`}
                      placeholder="Your answer..."
                      value={questionAnswers[question.id] || ''}
                      onChange={(e) => setQuestionAnswers(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmitApplication}
                disabled={submitting || !selectedResume}
                className="bg-primary hover:bg-primary/90 text-white flex-1"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>

            {/* Application Requirements Info */}
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                <strong>Requirements:</strong> A resume is required to submit your application. 
                Cover letter and additional questions are optional unless marked as required.
              </p>
            </div>
          </CardContent>
          </Card>
        )}
      </div>
    </JobSeekerLayout>
  );
}