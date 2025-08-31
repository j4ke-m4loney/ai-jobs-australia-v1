"use client";
import { useState } from "react";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const JobSeekerDocuments = () => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File, bucket: string) => {
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    return filePath;
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    setUploading(true);
    try {
      const filePath = await handleFileUpload(resumeFile, "resumes");

      // Update profile with resume URL
      const { error } = await supabase.from("profiles").upsert({
        user_id: user?.id,
        resume_url: filePath,
      });

      if (error) throw error;

      toast.success("Resume uploaded successfully!");
      setResumeFile(null);
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverLetterUpload = async () => {
    if (!coverLetterFile) return;

    setUploading(true);
    try {
      const filePath = await handleFileUpload(coverLetterFile, "cover-letters");

      // Update profile with cover letter URL
      const { error } = await supabase.from("profiles").upsert({
        user_id: user?.id,
        cover_letter_url: filePath,
      });

      if (error) throw error;

      toast.success("Cover letter uploaded successfully!");
      setCoverLetterFile(null);
    } catch (error) {
      console.error("Error uploading cover letter:", error);
      toast.error("Failed to upload cover letter");
    } finally {
      setUploading(false);
    }
  };

  return (
    <JobSeekerLayout title="Documents">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Document Management
          </h1>
          <p className="text-muted-foreground">
            Upload and manage your resume and cover letter for job applications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resume
              </CardTitle>
              <CardDescription>
                Upload your resume in PDF format (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume">Select Resume File</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              {resumeFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{resumeFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleResumeUpload}
                disabled={!resumeFile || uploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>
            </CardContent>
          </Card>

          {/* Cover Letter Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Cover Letter
              </CardTitle>
              <CardDescription>
                Upload your cover letter in PDF format (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cover-letter">Select Cover Letter File</Label>
                <Input
                  id="cover-letter"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setCoverLetterFile(e.target.files?.[0] || null)
                  }
                  className="mt-1"
                />
              </div>

              {coverLetterFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {coverLetterFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCoverLetterFile(null)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleCoverLetterUpload}
                disabled={!coverLetterFile || uploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Cover Letter"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Better Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep your resume to 1-2 pages maximum</li>
              <li>• Use clear, readable fonts like Arial or Calibri</li>
              <li>
                • Tailor your cover letter for each specific job application
              </li>
              <li>• Save documents as PDF to preserve formatting</li>
              <li>• Include relevant keywords from job descriptions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </JobSeekerLayout>
  );
};

export default JobSeekerDocuments;
