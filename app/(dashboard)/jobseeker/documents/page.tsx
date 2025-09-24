"use client";
import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Star, 
  StarOff,
  AlertCircle,
  CheckCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserDocument {
  id: string;
  user_id: string;
  document_type: "resume" | "cover_letter";
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const JobSeekerDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Fetching documents for user:", user.id);
      
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("Documents query result:", { data, error });
      
      if (error) {
        console.error("Supabase error details:", error);
        
        // Check if table exists by trying to get table info
        if (error.code === "42P01") {
          console.error("user_documents table does not exist - migration not applied");
          toast.error("Document functionality not available - database setup required");
          return;
        }
        
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} documents for user`);
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const getDocumentsByType = (type: "resume" | "cover_letter") => {
    return documents.filter(doc => doc.document_type === type);
  };

  const handleFileUpload = async (file: File, documentType: "resume" | "cover_letter") => {
    if (!user) return;

    // Check document limit
    const existingDocs = getDocumentsByType(documentType);
    if (existingDocs.length >= 5) {
      toast.error(`You can only upload up to 5 ${documentType.replace('_', ' ')}s`);
      return;
    }

    setUploading(true);
    try {
      console.log(`Starting upload for user ${user.id}, file: ${file.name}, type: ${documentType}`);
      
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;
      const bucketName = documentType === "resume" ? "resumes" : "cover-letters";

      console.log(`Uploading to storage: bucket=${bucketName}, path=${fileName}`);
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("File uploaded to storage successfully");

      // Save to database
      const documentRecord = {
        user_id: user.id,
        document_type: documentType,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        is_default: existingDocs.length === 0, // First upload is default
      };
      
      console.log("Inserting document record:", documentRecord);
      
      const { data, error: dbError } = await supabase
        .from("user_documents")
        .insert(documentRecord)
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        
        // Check if table exists
        if (dbError.code === "42P01") {
          console.error("user_documents table does not exist - migration not applied");
          toast.error("Document functionality not available - database setup required");
          return;
        }
        
        throw dbError;
      }
      
      console.log("Document record inserted successfully:", data);

      // Update local state
      setDocuments(prev => [data, ...prev]);
      
      // Clear file input
      if (documentType === "resume") {
        setResumeFile(null);
      } else {
        setCoverLetterFile(null);
      }

      toast.success(`${documentType.replace('_', ' ')} uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      toast.error(`Failed to upload ${documentType.replace('_', ' ')}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Delete from storage
      const bucket = document.document_type === "resume" ? "resumes" : "cover-letters";
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("user_documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleSetDefault = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Remove default from all documents of this type
      await supabase
        .from("user_documents")
        .update({ is_default: false })
        .eq("user_id", user?.id)
        .eq("document_type", document.document_type);

      // Set this document as default
      const { error } = await supabase
        .from("user_documents")
        .update({ is_default: true })
        .eq("id", documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.map(d => ({
        ...d,
        is_default: d.document_type === document.document_type ? d.id === documentId : d.is_default
      })));

      toast.success("Default document updated");
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to set as default");
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      const bucket = document.document_type === "resume" ? "resumes" : "cover-letters";
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <JobSeekerLayout title="Documents">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </JobSeekerLayout>
    );
  }

  const resumes = getDocumentsByType("resume");
  const coverLetters = getDocumentsByType("cover_letter");

  return (
    <JobSeekerLayout title="Documents">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Document Management
          </h1>
          <p className="text-muted-foreground">
            Upload and manage your resumes and cover letters for job applications. You can upload up to 5 of each type.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resume Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resumes ({resumes.length}/5)
                </div>
                {resumes.length >= 5 && (
                  <Badge variant="secondary">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Limit Reached
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Upload your resumes in PDF, DOC, or DOCX format (max 5MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Section */}
              {resumes.length < 5 && (
                <div className="space-y-3">
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
                    onClick={() => resumeFile && handleFileUpload(resumeFile, "resume")}
                    disabled={!resumeFile || uploading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Resume"}
                  </Button>
                </div>
              )}

              {/* Documents List */}
              <div className="space-y-3">
                {resumes.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {document.file_name}
                        </p>
                        {document.is_default && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.file_size)} • {formatDate(document.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(document.id)}
                        title={document.is_default ? "Remove as default" : "Set as default"}
                      >
                        {document.is_default ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{document.file_name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDocument(document.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {resumes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No resumes uploaded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cover Letters ({coverLetters.length}/5)
                </div>
                {coverLetters.length >= 5 && (
                  <Badge variant="secondary">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Limit Reached
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Upload your cover letters in PDF, DOC, or DOCX format (max 5MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Section */}
              {coverLetters.length < 5 && (
                <div className="space-y-3">
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
                    onClick={() => coverLetterFile && handleFileUpload(coverLetterFile, "cover_letter")}
                    disabled={!coverLetterFile || uploading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Cover Letter"}
                  </Button>
                </div>
              )}

              {/* Documents List */}
              <div className="space-y-3">
                {coverLetters.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {document.file_name}
                        </p>
                        {document.is_default && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.file_size)} • {formatDate(document.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(document.id)}
                        title={document.is_default ? "Remove as default" : "Set as default"}
                      >
                        {document.is_default ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Cover Letter</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{document.file_name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDocument(document.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {coverLetters.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No cover letters uploaded yet
                  </p>
                )}
              </div>
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
              <li>• Tailor your cover letter for each specific job application</li>
              <li>• Save documents as PDF to preserve formatting</li>
              <li>• Include relevant keywords from job descriptions</li>
              <li>• Upload multiple versions for different types of roles</li>
              <li>• Set your most relevant document as default for quick applications</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </JobSeekerLayout>
  );
};

export default JobSeekerDocuments;