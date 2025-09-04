export interface JobFormData2 {
  // Job Basics
  jobTitle: string;
  locationAddress: string;
  locationType: "in-person" | "fully-remote" | "hybrid" | "on-the-road";
  
  // Job Details
  jobType: 
    | "full-time"
    | "part-time"
    | "permanent"
    | "fixed-term"
    | "subcontract"
    | "casual"
    | "temp-to-perm"
    | "contract"
    | "internship"
    | "volunteer"
    | "graduate";
  hoursConfig?: {
    showBy: "fixed" | "range" | "maximum" | "minimum";
    minHours?: number;
    maxHours?: number;
    fixedHours?: number;
  };
  contractConfig?: {
    length: number;
    period: "days" | "weeks" | "months" | "years";
  };
  
  // Pay and Benefits
  payConfig: {
    showPay: boolean;
    payType?: "fixed" | "range" | "maximum" | "minimum";
    payAmount?: number;
    payRangeMin?: number;
    payRangeMax?: number;
    payPeriod?: "hour" | "day" | "week" | "month" | "year";
    currency?: string;
  };
  benefits: string[];
  
  // Describe Job
  jobDescription: string;
  requirements: string;
  
  // Application Settings
  applicationMethod: "external" | "email" | "indeed";
  applicationUrl: string;
  applicationEmail: string;
  communicationPrefs: {
    emailUpdates: boolean;
    phoneScreening: boolean;
    phoneNumber?: string;
  };
  hiringTimeline: "immediately" | "within-1-week" | "within-1-month" | "flexible";
  
  // Pricing
  pricingTier: "standard" | "featured" | "annual";
  
  // Company Info
  companyName: string;
  companyLogo: File | null;
  companyDescription: string;
  companyWebsite: string;
}

export const BENEFITS_OPTIONS = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "Life Insurance",
  "Disability Insurance",
  "401(k)",
  "Paid Time Off",
  "Flexible Work Hours",
  "Remote Work Options",
  "Professional Development",
  "Gym Membership",
  "Stock Options",
  "Bonuses",
  "Parental Leave",
  "Commuter Benefits",
  "Employee Discounts",
  "Wellness Programs",
  "Tuition Reimbursement",
  "Company Car",
  "Housing Assistance",
];

export const PRICING_TIERS = {
  standard: {
    name: "Standard",
    price: 99,
    priceDisplay: "$99",
    description: "30-day job posting",
    features: [
      "30-day listing",
      "Basic search ranking",
      "Standard support",
      "Job analytics",
    ],
  },
  featured: {
    name: "Featured",
    price: 299,
    priceDisplay: "$299",
    description: "Featured 30-day posting",
    popular: true,
    features: [
      "30-day featured listing",
      "Top search ranking",
      "Homepage feature",
      "Priority support",
      "Advanced analytics",
      "Social media promotion",
    ],
  },
  annual: {
    name: "Annual Plan",
    price: 999,
    priceDisplay: "$999",
    description: "Unlimited postings for 1 year",
    features: [
      "Unlimited job postings",
      "All featured benefits",
      "Dedicated account manager",
      "Custom branding",
      "API access",
      "Priority placement",
    ],
  },
};