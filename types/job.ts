export interface JobFormData {
  // Job Details
  jobTitle: string;
  location: string;
  locationType: "onsite" | "remote" | "hybrid";
  jobType: "full-time" | "part-time" | "contract" | "internship";
  salaryMin: string;
  salaryMax: string;
  jobDescription: string;
  requirements: string;
  
  // Company Info
  companyName: string;
  companyLogo: File | null;
  companyDescription: string;
  companyWebsite: string;
  
  // Application Method
  applicationMethod: "external" | "email";
  applicationUrl: string;
  applicationEmail: string;
}

export interface JobPosting extends JobFormData {
  id: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "completed";
}