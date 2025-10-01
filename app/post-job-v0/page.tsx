"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Briefcase,
  MapPin,
  FileText,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import JobDetailsStep from "@/components/post-job-v0/JobDetailsStep";
import CompanyInfoStep from "@/components/post-job-v0/CompanyInfoStep";
import ApplicationMethodStep from "@/components/post-job-v0/ApplicationMethodStep";
import ReviewPaymentStep from "@/components/post-job-v0/ReviewPaymentStep";
import { JobFormData } from "@/types/job";
import { useAuth } from "@/contexts/AuthContext";
import SlimFooter from "@/components/SlimFooter";

const steps = [
  {
    id: 1,
    title: "Job Details",
    description: "Tell us about the role",
    icon: Briefcase,
  },
  {
    id: 2,
    title: "Company Info",
    description: "Your company details",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Application Method",
    description: "How candidates apply",
    icon: FileText,
  },
  {
    id: 4,
    title: "Review & Payment",
    description: "Finalize your posting",
    icon: CreditCard,
  },
];

export default function PostJobPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>({
    // Job Details
    jobTitle: "",
    location: "",
    locationType: "onsite",
    jobType: "full-time",
    salaryMin: "",
    salaryMax: "",
    showSalary: true,
    jobDescription: "",
    requirements: "",

    // Company Info
    companyName: "",
    companyLogo: null,
    companyDescription: "",
    companyWebsite: "",

    // Application Method
    applicationMethod: "external",
    applicationUrl: "",
    applicationEmail: "",
  });

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!loading && !user) {
      router.push("/auth?next=/post-job");
      return;
    }

    // Redirect to auth if user is not an employer
    if (!loading && user && user.user_metadata?.user_type !== "employer") {
      router.push("/auth?next=/post-job");
      return;
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user || user.user_metadata?.user_type !== "employer") {
    return null;
  }

  const updateFormData = (newData: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <JobDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <CompanyInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <ApplicationMethodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return <ReviewPaymentStep formData={formData} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Post a Job
          </h1>
          <p className="text-muted-foreground">
            Find the best AI talent in Australia
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {steps.map((step, _index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-background text-muted-foreground border-2 border-border"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        (isCurrent || isCompleted) && "text-foreground",
                        !isCurrent && !isCompleted && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-5 h-5",
              })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>

      <SlimFooter />
    </div>
  );
}
