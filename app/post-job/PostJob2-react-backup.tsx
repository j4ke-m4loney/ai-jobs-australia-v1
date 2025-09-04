import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Briefcase, MapPin, DollarSign, FileText, Settings, CreditCard, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobFormData2 } from "@/types/job2";
import { useAuth } from "@/contexts/AuthContext";

// Step Components
import JobBasicsStep from "@/components/post-job2/JobBasicsStep";
import JobDetailsStep2 from "@/components/post-job2/JobDetailsStep2";
import PayBenefitsStep from "@/components/post-job2/PayBenefitsStep";
import DescribeJobStep from "@/components/post-job2/DescribeJobStep";
import ApplicationSettingsStep from "@/components/post-job2/ApplicationSettingsStep";
import PricingSelectionStep from "@/components/post-job2/PricingSelectionStep";
import ReviewPaymentStep2 from "@/components/post-job2/ReviewPaymentStep2";

// Modals
import JobPreviewModal from "@/components/post-job2/JobPreviewModal";

const steps = [
  { 
    id: 1, 
    title: "Job Basics", 
    description: "Title, details & compensation",
    icon: Briefcase
  },
  { 
    id: 2, 
    title: "Describe Job", 
    description: "Description and requirements",
    icon: FileText
  },
  { 
    id: 3, 
    title: "Application Settings", 
    description: "How to apply",
    icon: Settings
  },
  { 
    id: 4, 
    title: "Pricing", 
    description: "Choose your plan",
    icon: CreditCard
  },
  { 
    id: 5, 
    title: "Review & Payment", 
    description: "Finalize posting",
    icon: Check
  }
];

export default function PostJob2() {
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Redirect to employer auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth/employer?next=/post-job2" replace />;
  }

  // Redirect to employer auth if user is not an employer
  if (!loading && user && user.user_metadata?.user_type !== 'employer') {
    return <Navigate to="/auth/employer?next=/post-job2" replace />;
  }

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

  const [formData, setFormData] = useState<JobFormData2>({
    // Job Basics
    jobTitle: "",
    locationAddress: "",
    locationType: "in-person",
    
    // Job Details
    jobType: "full-time",
    hoursConfig: undefined,
    contractConfig: undefined,
    
    // Pay and Benefits
    payConfig: {
      showPay: true,
    },
    benefits: [],
    
    // Describe Job
    jobDescription: "",
    requirements: "",
    
    // Application Settings
    applicationMethod: "external",
    applicationUrl: "",
    applicationEmail: "",
    communicationPrefs: {
      emailUpdates: true,
      phoneScreening: false,
    },
    hiringTimeline: "within-1-month",
    
    // Pricing
    pricingTier: "standard",
    
    // Company Info
    companyName: "",
    companyLogo: null,
    companyDescription: "",
    companyWebsite: "",
  });

  // Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem('postJob2FormData', JSON.stringify(formData));
  }, [formData]);

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('postJob2FormData');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  const updateFormData = (newData: Partial<JobFormData2>) => {
    setFormData(prev => ({ ...prev, ...newData }));
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

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  const canShowPreview = currentStep >= 2 && formData.jobTitle && formData.jobDescription;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <JobBasicsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 2:
        return <DescribeJobStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} onShowPreview={() => setShowPreview(true)} />;
      case 3:
        return <ApplicationSettingsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <PricingSelectionStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <ReviewPaymentStep2 formData={formData} onPrev={prevStep} onEdit={goToStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Post a Job</h1>
              <p className="text-muted-foreground">Find the best AI talent in Australia</p>
            </div>
            {canShowPreview && (
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Job
              </Button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-background text-muted-foreground border-2 border-border hover:border-primary"
                  )}
                  onClick={() => goToStep(step.id)}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm font-medium cursor-pointer",
                      (isCurrent || isCompleted) && "text-foreground",
                      !isCurrent && !isCompleted && "text-muted-foreground"
                    )}
                    onClick={() => goToStep(step.id)}
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
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Job Preview Modal */}
        <JobPreviewModal 
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          formData={formData}
        />
      </div>
    </div>
  );
}