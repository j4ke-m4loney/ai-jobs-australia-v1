import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobFormData2 } from "@/types/job2";
import {
  MapPin,
  Clock,
  DollarSign,
  Mail,
  ExternalLink,
  Globe,
  Calendar,
  Gift,
} from "lucide-react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: JobFormData2;
}

export default function JobPreviewModal({ isOpen, onClose, formData }: Props) {
  const formatJobType = () => {
    let type = formData.jobType
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (formData.hoursConfig && formData.jobType === "part-time") {
      const { showBy, fixedHours, minHours, maxHours } = formData.hoursConfig;
      if (showBy === "fixed" && fixedHours) {
        type += ` • ${fixedHours} hours/week`;
      } else if (showBy === "range" && minHours && maxHours) {
        type += ` • ${minHours}-${maxHours} hours/week`;
      } else if (showBy === "maximum" && maxHours) {
        type += ` • Up to ${maxHours} hours/week`;
      } else if (showBy === "minimum" && minHours) {
        type += ` • From ${minHours} hours/week`;
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
      type += ` • ${length} ${period} contract`;
    }

    return type;
  };

  const formatPay = () => {
    if (!formData.payConfig.showPay) return null;

    const { payType, payAmount, payRangeMin, payRangeMax, payPeriod } =
      formData.payConfig;
    const period = payPeriod ? `/${payPeriod}` : "/year";

    switch (payType) {
      case "fixed":
        return `$${payAmount?.toLocaleString()} AUD${period}`;
      case "range":
        return `$${payRangeMin?.toLocaleString()} - $${payRangeMax?.toLocaleString()} AUD${period}`;
      case "maximum":
        return `Up to $${payRangeMax?.toLocaleString()} AUD${period}`;
      case "minimum":
        return `From $${payRangeMin?.toLocaleString()} AUD${period}`;
      default:
        return null;
    }
  };

  const formatLocation = () => {
    const typeLabels = {
      "in-person": "In person",
      "fully-remote": "Fully Remote",
      hybrid: "Hybrid",
      "on-the-road": "On the road",
    };
    return `${formData.locationAddress} • ${typeLabels[formData.locationType]}`;
  };

  const formatHiringTimeline = () => {
    const timelineLabels = {
      immediately: "Immediately",
      "within-1-week": "Within 1 week",
      "within-1-month": "Within 1 month",
      flexible: "Flexible",
    };
    return timelineLabels[formData.hiringTimeline];
  };

  const payDisplay = formatPay();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {formData.jobTitle || "Job Title"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {formData.companyName || "Company Name"}
                  </span>
                  {formData.companyWebsite && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <a
                        href={formData.companyWebsite}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Website
                      </a>
                    </>
                  )}
                </div>
              </div>

              {formData.companyLogo && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden relative">
                  <Image
                    src={URL.createObjectURL(formData.companyLogo)}
                    alt="Company logo"
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{formatLocation()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formatJobType()}</span>
              </div>
              {payDisplay && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{payDisplay}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Start {formatHiringTimeline()}</span>
              </div>
            </div>

            {/* Benefits */}
            {formData.benefits.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Benefits</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          {formData.jobDescription && (
            <div>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <div
                  dangerouslySetInnerHTML={{ __html: formData.jobDescription }}
                />
              </div>
            </div>
          )}

          {/* Requirements */}
          {formData.requirements && (
            <div>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <div
                  dangerouslySetInnerHTML={{ __html: formData.requirements }}
                />
              </div>
            </div>
          )}

          {/* Company Description */}
          {formData.companyDescription && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                About {formData.companyName || "the Company"}
              </h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.companyDescription,
                  }}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Application Method */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">How to Apply</h3>
            <div className="flex items-center gap-2 text-sm">
              {formData.applicationMethod === "email" ? (
                <>
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Send your application to: </span>
                  <span className="font-medium text-primary">
                    {formData.applicationEmail}
                  </span>
                </>
              ) : formData.applicationMethod === "external" ? (
                <>
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>Apply on company website: </span>
                  <span className="font-medium text-primary">
                    {formData.applicationUrl}
                  </span>
                </>
              ) : (
                <>
                  <span>Apply through AI Jobs Australia platform</span>
                </>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close Preview</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
