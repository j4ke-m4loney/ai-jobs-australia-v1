import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobFormData2, PRICING_TIERS } from "@/types/job2";
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Mail,
  ExternalLink,
  Edit,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Props {
  formData: JobFormData2;
  onPrev: () => void;
  onEdit: (stepNumber: number) => void;
}

export default function ReviewPaymentStep2({
  formData,
  onPrev,
  onEdit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedPlan = PRICING_TIERS[formData.pricingTier];

  const formatJobType = () => {
    let type = formData.jobType
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (formData.hoursConfig && formData.jobType === "part-time") {
      const { showBy, fixedHours, minHours, maxHours } = formData.hoursConfig;
      if (showBy === "fixed" && fixedHours) {
        type += ` (${fixedHours} hours/week)`;
      } else if (showBy === "range" && minHours && maxHours) {
        type += ` (${minHours}-${maxHours} hours/week)`;
      } else if (showBy === "maximum" && maxHours) {
        type += ` (max ${maxHours} hours/week)`;
      } else if (showBy === "minimum" && minHours) {
        type += ` (min ${minHours} hours/week)`;
      }
    }

    if (
      formData.contractConfig &&
      [
        "fixed-term",
        "subcontract",
        "casual",
        "temp-to-perm",
        "contract",
        "volunteer",
        "internship",
      ].includes(formData.jobType)
    ) {
      const { length, period } = formData.contractConfig;
      type += ` (${length} ${period})`;
    }

    return type;
  };

  const formatPay = () => {
    if (!formData.payConfig.showPay) return "Not specified";

    const { payType, payAmount, payRangeMin, payRangeMax, payPeriod } =
      formData.payConfig;
    const period = payPeriod ? `/${payPeriod}` : "/year";

    switch (payType) {
      case "fixed":
        return `$${payAmount?.toLocaleString()}${period}`;
      case "range":
        return `$${payRangeMin?.toLocaleString()} - $${payRangeMax?.toLocaleString()}${period}`;
      case "maximum":
        return `Up to $${payRangeMax?.toLocaleString()}${period}`;
      case "minimum":
        return `From $${payRangeMin?.toLocaleString()}${period}`;
      default:
        return "Not specified";
    }
  };

  const formatLocation = () => {
    const typeLabels = {
      "in-person": "In person",
      "fully-remote": "Fully Remote",
      hybrid: "Hybrid",
      "on-the-road": "On the road",
    };
    return `${formData.locationAddress} (${typeLabels[formData.locationType]})`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);

    // Clear saved form data
    localStorage.removeItem("postJob2FormData");
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Job Posted Successfully!
          </h2>
          <p className="text-muted-foreground">
            Your job posting for "{formData.jobTitle}" has been submitted and
            will be reviewed shortly.
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-left">
              <h4 className="font-medium text-blue-900 mb-1">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your job will be reviewed within 24 hours</li>
                <li>• Once approved, it will go live on AI Jobs Australia</li>
                <li>• You'll receive email notifications about applications</li>
                <li>• Manage your job postings from your employer dashboard</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => (window.location.href = "/employer/jobs")}>
            View My Jobs
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/post-job2")}
          >
            Post Another Job
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Job Summary
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {formData.jobTitle}
            </h3>
            <p className="text-muted-foreground">{formData.companyName}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{formatLocation()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatJobType()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>{formatPay()}</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.applicationMethod === "email" ? (
                <Mail className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              )}
              <span>
                {formData.applicationMethod === "email"
                  ? `Apply via ${formData.applicationEmail}`
                  : `Apply via ${
                      formData.applicationMethod === "indeed"
                        ? "AI Jobs Australia"
                        : "Company website"
                    }`}
              </span>
            </div>
          </div>

          {formData.benefits.length > 0 && (
            <div>
              <p className="font-medium text-foreground mb-2">Benefits:</p>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Job Description</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Description</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {formData.jobDescription.substring(0, 200)}
              {formData.jobDescription.length > 200 && "..."}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Requirements</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {formData.requirements.substring(0, 200)}
              {formData.requirements.length > 200 && "..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pricing Summary
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(6)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">
                  {selectedPlan.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  30-day job posting
                </p>
              </div>
              <p className="text-xl font-bold text-foreground">
                ${selectedPlan.price}
              </p>
            </div>

            <Separator />

            <ul className="space-y-2">
              {selectedPlan.features.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} size="lg">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${selectedPlan.price}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
