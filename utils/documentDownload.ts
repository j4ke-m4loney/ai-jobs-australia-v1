import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Downloads a document from Supabase storage
 * @param bucket The storage bucket name ('resumes' or 'cover-letters')
 * @param filePath The file path in storage
 * @param fileName The desired filename for download
 * @returns Promise<boolean> - Success status
 */
export const downloadDocument = async (
  bucket: string,
  filePath: string,
  fileName: string
): Promise<boolean> => {
  try {
    // Enhanced logging for debugging
    console.log("=== Download Debug Info ===");
    console.log("Bucket:", bucket);
    console.log("File path:", filePath);
    console.log("File name:", fileName);
    
    // Validate inputs
    if (!bucket || !filePath || !fileName) {
      console.error("Invalid parameters:", { bucket, filePath, fileName });
      toast.error("Invalid download parameters");
      return false;
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      toast.error("You must be logged in to download documents");
      return false;
    }
    
    console.log("User authenticated:", user.id);

    // Use file path exactly as stored in database
    // Paths are stored as: userId/documentType_timestamp.ext
    console.log("Using path as-is:", filePath);

    // First, check if the file exists
    console.log("Checking if file exists...");
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .list('', { 
        limit: 1000, 
        search: filePath.includes('/') ? filePath.split('/')[1] : filePath 
      });

    if (fileError) {
      console.error("Error checking file existence:", fileError);
    } else {
      console.log("Files found in bucket:", fileData?.map(f => f.name));
    }

    // Get the download URL with authentication
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60); // 60 seconds expiry

    if (error) {
      console.error("Storage error details:", {
        message: error.message,
        error: error
      });
      
      // Handle specific error cases
      if (error.message.includes("not found")) {
        toast.error("Document not found or no longer available");
      } else if (error.message.includes("not authorized")) {
        toast.error("You don't have permission to access this document");
      } else {
        toast.error("Failed to generate download link");
      }
      return false;
    }

    if (!data?.signedUrl) {
      toast.error("Could not generate download link");
      return false;
    }

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${fileName} downloaded successfully`);
    return true;
  } catch (error) {
    console.error("Error downloading document:", error);
    toast.error("Failed to download document");
    return false;
  }
};

/**
 * Downloads a resume document
 * @param resumeUrl The resume file path
 * @param applicantName The applicant's name for filename
 */
export const downloadResume = async (
  resumeUrl: string,
  applicantName: string
): Promise<boolean> => {
  const fileName = `${applicantName.replace(/\s+/g, "_")}_Resume.pdf`;
  return downloadDocument("resumes", resumeUrl, fileName);
};

/**
 * Downloads a cover letter document
 * @param coverLetterUrl The cover letter file path
 * @param applicantName The applicant's name for filename
 */
export const downloadCoverLetter = async (
  coverLetterUrl: string,
  applicantName: string
): Promise<boolean> => {
  const fileName = `${applicantName.replace(/\s+/g, "_")}_Cover_Letter.pdf`;
  return downloadDocument("cover-letters", coverLetterUrl, fileName);
};

/**
 * Checks if an employer owns a specific job (for security)
 * @param jobId The job ID to check
 * @param employerId The employer's user ID
 * @returns Promise<boolean> - Whether the employer owns the job
 */
export const verifyEmployerJobOwnership = async (
  jobId: string,
  employerId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("employer_id")
      .eq("id", jobId)
      .eq("employer_id", employerId)
      .single();

    if (error) {
      console.error("Error verifying job ownership:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error in ownership verification:", error);
    return false;
  }
};