import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { JobFormData2, BENEFITS_OPTIONS } from "@/types/job2";
import { DollarSign, Gift, ChevronDown, ChevronUp } from "lucide-react";

const schema = z.object({
  showPay: z.boolean(),
  payType: z.enum(["fixed", "range", "maximum", "minimum"]),
  payPeriod: z.enum(["hour", "day", "week", "month", "year"]),
  payAmount: z.number().optional(),
  payRangeMin: z.number().optional(),
  payRangeMax: z.number().optional(),
}).refine((data) => {
  // Validate based on pay type
  if (data.payType === "fixed") {
    return data.payAmount && data.payAmount > 0;
  } else if (data.payType === "range") {
    return data.payRangeMin && data.payRangeMax && data.payRangeMin > 0 && data.payRangeMax > data.payRangeMin;
  } else if (data.payType === "minimum") {
    return data.payRangeMin && data.payRangeMin > 0;
  } else if (data.payType === "maximum") {
    return data.payRangeMax && data.payRangeMax > 0;
  }
  return false;
}, {
  message: "Please provide valid salary information",
  path: ["payAmount"],
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PayBenefitsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Props) {
  const [showPay, setShowPay] = useState(formData.payConfig.showPay);
  const [payConfig, setPayConfig] = useState(formData.payConfig);
  const [selectedBenefits, setSelectedBenefits] = useState(formData.benefits);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      showPay: formData.payConfig.showPay,
      payType: formData.payConfig.payType || "range",
      payPeriod: formData.payConfig.payPeriod || "year",
      payAmount: formData.payConfig.payAmount,
      payRangeMin: formData.payConfig.payRangeMin,
      payRangeMax: formData.payConfig.payRangeMax,
    },
  });

  const visibleBenefits = showAllBenefits
    ? BENEFITS_OPTIONS
    : BENEFITS_OPTIONS.slice(0, 6);
  const hiddenBenefitsCount = BENEFITS_OPTIONS.length - 6;

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData({
      payConfig: {
        showPay: values.showPay,
        payType: values.payType,
        payPeriod: values.payPeriod,
        payAmount: values.payAmount,
        payRangeMin: values.payRangeMin,
        payRangeMax: values.payRangeMax,
      },
      benefits: selectedBenefits,
    });
    onNext();
  };

  const handleBenefitToggle = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  };

  const handlePayConfigChange = (field: string, value: string | number) => {
    setPayConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Pay Configuration */}
          <div className="space-y-4">
            <div>
              <FormLabel className="flex items-center gap-2 text-base font-medium mb-2">
                <DollarSign className="w-5 h-5" />
                Salary Range <span className="text-red-500">*</span>
              </FormLabel>
              <p className="text-sm text-muted-foreground mb-3">
                Salary information is required for job filtering. Use the toggle below to control whether the salary is publicly displayed.
              </p>
            </div>

            {/* Always show salary input fields */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Show pay as
                </label>
                <Select
                  value={payConfig.payType || "range"}
                  onValueChange={(value) =>
                    handlePayConfigChange("payType", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                    <SelectItem value="minimum">Minimum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {payConfig.payType === "fixed" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="80000"
                        value={payConfig.payAmount || ""}
                        onChange={(e) =>
                          handlePayConfigChange(
                            "payAmount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  )}

                  {payConfig.payType === "range" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Minimum
                        </label>
                        <Input
                          type="number"
                          placeholder="70000"
                          value={payConfig.payRangeMin || ""}
                          onChange={(e) =>
                            handlePayConfigChange(
                              "payRangeMin",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Maximum
                        </label>
                        <Input
                          type="number"
                          placeholder="100000"
                          value={payConfig.payRangeMax || ""}
                          onChange={(e) =>
                            handlePayConfigChange(
                              "payRangeMax",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  {payConfig.payType === "maximum" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Maximum
                      </label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={payConfig.payRangeMax || ""}
                        onChange={(e) =>
                          handlePayConfigChange(
                            "payRangeMax",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  )}

                  {payConfig.payType === "minimum" && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Minimum
                      </label>
                      <Input
                        type="number"
                        placeholder="70000"
                        value={payConfig.payRangeMin || ""}
                        onChange={(e) =>
                          handlePayConfigChange(
                            "payRangeMin",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Per
                    </label>
                    <Select
                      value={payConfig.payPeriod || "year"}
                      onValueChange={(value) =>
                        handlePayConfigChange("payPeriod", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            {/* Display Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <FormLabel className="text-base font-medium">
                  Display salary publicly
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Toggle off to hide salary from job seekers (still used for filtering)
                </p>
              </div>
              <Switch
                checked={showPay}
                onCheckedChange={(checked) => {
                  setShowPay(checked);
                  form.setValue("showPay", checked);
                }}
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <FormLabel className="flex items-center gap-2 text-base font-medium">
              <Gift className="w-5 h-5" />
              Benefits (optional)
            </FormLabel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center space-x-2">
                  <Checkbox
                    id={benefit}
                    checked={selectedBenefits.includes(benefit)}
                    onCheckedChange={() => handleBenefitToggle(benefit)}
                  />
                  <label
                    htmlFor={benefit}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {benefit}
                  </label>
                </div>
              ))}
            </div>

            {!showAllBenefits && hiddenBenefitsCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAllBenefits(true)}
                className="flex items-center gap-2 text-primary hover:text-primary"
              >
                <ChevronDown className="w-4 h-4" />
                Show {hiddenBenefitsCount} more benefits
              </Button>
            )}

            {showAllBenefits && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAllBenefits(false)}
                className="flex items-center gap-2 text-primary hover:text-primary"
              >
                <ChevronUp className="w-4 h-4" />
                Show fewer benefits
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev} size="lg">
            Back
          </Button>
          <Button type="submit" size="lg" className="min-w-[120px]">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
