import posthog from "posthog-js";

// User Identification
export const identifyUser = (
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    user_type?: "job_seeker" | "employer" | "admin";
    location?: string;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  if (typeof window !== "undefined") {
    posthog.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
};

// Job Seeker Events
export const trackJobViewed = (properties: {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  salary_range?: string;
  is_featured: boolean;
  category?: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("job_viewed", properties);
  }
};

export const trackJobSaved = (properties: {
  job_id: string;
  job_title: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("job_saved", properties);
  }
};

export const trackJobUnsaved = (properties: {
  job_id: string;
  job_title: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("job_unsaved", properties);
  }
};

export const trackInternalApplicationStarted = (properties: {
  job_id: string;
  job_title: string;
  company: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("internal_application_started", properties);
  }
};

export const trackApplicationSubmitted = (properties: {
  job_id: string;
  job_title: string;
  company: string;
  time_to_complete?: number; // in seconds
  has_resume: boolean;
  has_cover_letter: boolean;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("application_submitted", properties);
  }
};

// Job Search Events
export const trackJobSearch = (properties: {
  search_query?: string;
  location_filter?: string;
  category_filter?: string;
  salary_filter?: string;
  results_count: number;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("job_search", properties);
  }
};

// Employer Events
export const trackJobPostStarted = () => {
  if (typeof window !== "undefined") {
    posthog.capture("job_post_started");
  }
};

export const trackJobPostStepCompleted = (properties: {
  step: number;
  step_name: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("job_post_step_completed", properties);
  }
};

export const trackPricingTierSelected = (properties: {
  tier: "standard" | "featured";
  price: number;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("pricing_tier_selected", properties);
  }
};

export const trackPaymentCompleted = (properties: {
  amount: number;
  tier: "standard" | "featured";
  job_id?: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("payment_completed", properties);
  }
};

export const trackApplicationReviewed = (properties: {
  application_id: string;
  job_id: string;
  status: "pending" | "reviewed" | "rejected" | "accepted";
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("application_reviewed", properties);
  }
};

// Tool Usage Events
export const trackToolUsed = (properties: {
  tool_name: "resume_analyzer" | "salary_calculator";
  [key: string]: string | number | boolean | undefined;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("tool_used", properties);
  }
};

// Auth Events
export const trackSignUp = (properties: {
  user_type: "job_seeker" | "employer";
  auth_method: "email" | "google";
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("sign_up", properties);
  }
};

export const trackLogin = (properties: {
  user_type: "job_seeker" | "employer" | "admin";
  auth_method: "email" | "google";
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("login", properties);
  }
};

export const trackLogout = () => {
  if (typeof window !== "undefined") {
    posthog.capture("logout");
  }
};

// Profile Events
export const trackProfileCompleted = (properties: {
  user_type: "job_seeker" | "employer";
  completion_percentage: number;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("profile_completed", properties);
  }
};

// Document Events
export const trackDocumentUploaded = (properties: {
  document_type: "resume" | "cover_letter" | "portfolio";
  file_size?: number;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("document_uploaded", properties);
  }
};

// Content Events
export const trackBlogPostViewed = (properties: {
  post_id: string;
  post_title: string;
  category?: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("blog_post_viewed", properties);
  }
};

export const trackCompanyViewed = (properties: {
  company_id: string;
  company_name: string;
  jobs_count: number;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("company_viewed", properties);
  }
};

// Conversion Events
export const trackNewsletterSubscribed = (properties?: {
  source?: string;
}) => {
  if (typeof window !== "undefined") {
    posthog.capture("newsletter_subscribed", properties);
  }
};

export const trackSponsorshipInquiry = () => {
  if (typeof window !== "undefined") {
    posthog.capture("sponsorship_inquiry");
  }
};

// Generic Event Tracker
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
};

// Feature Flags
export const getFeatureFlag = (flagKey: string): boolean | string | undefined => {
  if (typeof window !== "undefined") {
    return posthog.getFeatureFlag(flagKey);
  }
  return undefined;
};

export const isFeatureEnabled = (flagKey: string): boolean => {
  if (typeof window !== "undefined") {
    return posthog.isFeatureEnabled(flagKey) || false;
  }
  return false;
};
