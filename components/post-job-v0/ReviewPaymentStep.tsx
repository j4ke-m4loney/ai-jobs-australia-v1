import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobFormData } from "@/types/job";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Globe,
  Mail,
  ExternalLink,
  CreditCard,
  Shield,
  Star,
} from "lucide-react";

interface Props {
  formData: JobFormData;
  onPrev: () => void;
}

export default function ReviewPaymentStep({ formData, onPrev }: Props) {
  const formatSalary = () => {
    if (formData.salaryMin && formData.salaryMax) {
      return `$${Number(formData.salaryMin).toLocaleString()} - $${Number(
        formData.salaryMax
      ).toLocaleString()} AUD`;
    } else if (formData.salaryMin) {
      return `From $${Number(formData.salaryMin).toLocaleString()} AUD`;
    } else if (formData.salaryMax) {
      return `Up to $${Number(formData.salaryMax).toLocaleString()} AUD`;
    }
    return "Salary not specified";
  };

  const formatJobType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatLocationType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handlePayment = () => {
    // TODO: Integrate with Stripe
    console.log("Processing payment...");
  };

  return (
    <div className="space-y-6">
      {/* Job Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{formData.jobTitle}</h3>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4" />
              {formData.companyName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formData.location}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatJobType(formData.jobType)}
            </Badge>
            <Badge variant="secondary">
              {formatLocationType(formData.locationType)}
            </Badge>
            {(formData.salaryMin || formData.salaryMax) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatSalary()}
              </Badge>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Job Description</h4>
            <p className="text-sm text-muted-foreground">
              {formData.jobDescription}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Requirements</h4>
            <p className="text-sm text-muted-foreground">
              {formData.requirements}
            </p>
          </div>

          {formData.companyDescription && (
            <div>
              <h4 className="font-medium mb-2">About {formData.companyName}</h4>
              <p className="text-sm text-muted-foreground">
                {formData.companyDescription}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            {formData.companyWebsite && (
              <a
                href={formData.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Company Website
              </a>
            )}

            {formData.applicationMethod === "email" ? (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Apply via email: {formData.applicationEmail}
              </span>
            ) : (
              <a
                href={formData.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Apply Now
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Standard Job Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              $199{" "}
              <span className="text-lg font-normal text-muted-foreground">
                AUD
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                30 days live on AI Jobs Australia
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                SEO optimized for Google Jobs
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                Included in weekly job alerts
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                Mobile-optimized job listing
              </li>
            </ul>
            <Button className="w-full" onClick={handlePayment}>
              Select Standard
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/20 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-accent text-accent-foreground">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Featured Job Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              $349{" "}
              <span className="text-lg font-normal text-muted-foreground">
                AUD
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                All Standard features
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <strong>Featured at top of listings</strong>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <strong>Highlighted with &quot;Featured&quot; badge</strong>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <strong>Social media promotion</strong>
              </li>
            </ul>
            <Button
              className="w-full bg-accent hover:bg-accent/90"
              onClick={handlePayment}
            >
              Select Featured
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} size="lg">
          Back
        </Button>
      </div>
    </div>
  );
}
