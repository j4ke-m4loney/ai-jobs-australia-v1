import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PlacesAutocomplete,
  PlaceResult,
  isGooglePlacesDropdownActive,
} from "@/components/ui/places-autocomplete";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { JobFormData2 } from "@/types/job2";
import {
  Briefcase,
  MapPin,
  Navigation,
  Clock,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters"),
  locationAddress: z.string().min(2, "Location is required"),
  locationSuburb: z.string().optional(),
  locationState: z.string().optional(),
  locationPostcode: z.string().optional(),
  locationType: z.enum(["in-person", "fully-remote", "hybrid", "on-the-road"]),
  jobType: z.enum([
    "full-time",
    "part-time",
    "permanent",
    "fixed-term",
    "subcontract",
    "casual",
    "temp-to-perm",
    "contract",
    "volunteer",
    "internship",
    "graduate",
  ]),
  showPay: z.boolean(),
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
}

const jobTypeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "permanent", label: "Permanent" },
  { value: "fixed-term", label: "Fixed term" },
  { value: "subcontract", label: "Subcontract" },
  { value: "casual", label: "Casual" },
  { value: "temp-to-perm", label: "Temp to perm" },
  { value: "contract", label: "Contract" },
  { value: "volunteer", label: "Volunteer" },
  { value: "internship", label: "Internship" },
  { value: "graduate", label: "Graduate" },
];

export default function JobBasicsStep({
  formData,
  updateFormData,
  onNext,
}: Props) {
  const [selectedJobType, setSelectedJobType] = useState(formData.jobType);
  const [hoursConfig, setHoursConfig] = useState(
    formData.hoursConfig || { showBy: "fixed" as const }
  );
  const [contractConfig, setContractConfig] = useState(
    formData.contractConfig || { length: 1, period: "months" as const }
  );
  const [showPay, setShowPay] = useState(formData.payConfig.showPay);
  const [payConfig, setPayConfig] = useState(formData.payConfig);
  const [highlights, setHighlights] = useState(
    formData.highlights || ["", "", ""]
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobTitle: formData.jobTitle,
      locationAddress: formData.locationAddress,
      locationSuburb: formData.locationSuburb,
      locationState: formData.locationState,
      locationPostcode: formData.locationPostcode,
      locationType: formData.locationType,
      jobType: formData.jobType,
      showPay: formData.payConfig.showPay,
    },
  });

  const { setValue } = form;

  // Watch for form changes and update form data in real-time
  const watchedValues = form.watch();
  useEffect(() => {
    // Debounce the updates to avoid too frequent calls
    const timeoutId = setTimeout(() => {
      // Update the form data with watched values plus other state
      updateFormData({
        ...watchedValues,
        jobType: selectedJobType,
        hoursConfig: hoursConfig,
        contractConfig: contractConfig,
        payConfig: { ...formData.payConfig, showPay: watchedValues.showPay },
        highlights: highlights,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    watchedValues,
    selectedJobType,
    hoursConfig,
    contractConfig,
    formData.payConfig,
    updateFormData,
  ]);

  const requiresHoursConfig = selectedJobType === "part-time";
  const requiresContractConfig = [
    "fixed-term",
    "subcontract",
    "casual",
    "temp-to-perm",
    "contract",
    "volunteer",
    "internship",
  ].includes(selectedJobType);

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData({
      ...values,
      hoursConfig: requiresHoursConfig ? hoursConfig : undefined,
      contractConfig: requiresContractConfig ? contractConfig : undefined,
      payConfig: showPay ? payConfig : { showPay: false },
      highlights: highlights,
    });
    onNext();
  };

  const handleJobTypeChange = (value: string) => {
    setSelectedJobType(value as "full-time" | "part-time" | "contract" | "casual" | "internship");
    form.setValue("jobType", value as "full-time" | "part-time" | "contract" | "casual" | "internship");
  };


  const handleHighlightChange = (index: number, value: string) => {
    setHighlights((prev) => {
      const newHighlights = [...prev];
      newHighlights[index] = value;
      return newHighlights;
    });
  };

  const getCharCount = (text: string) => {
    return text.trim().length;
  };

  const handlePayConfigChange = (field: string, value: string | number) => {
    setPayConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form-level keyboard events
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Check if Enter was pressed and Google Places dropdown is active
    if (e.key === "Enter" && isGooglePlacesDropdownActive()) {
      // Check if the location input is focused
      const activeElement = document.activeElement;
      const locationInput = document.querySelector(
        'input[placeholder*="address"]'
      );

      if (activeElement === locationInput) {
        e.preventDefault();
        e.stopPropagation();
        // Let Google Places handle the selection
        return;
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleFormKeyDown}
        className="space-y-8"
      >
        {/* Job Title and Location */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Information
            </h3>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Job title *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Machine Learning Engineer"
                        {...field}
                        className="text-base h-12 border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Job location type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-primary">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in-person">In person</SelectItem>
                        <SelectItem value="fully-remote">
                          Fully Remote
                        </SelectItem>
                        <SelectItem value="hybrid">
                          Hybrid: Some on site work required
                        </SelectItem>
                        <SelectItem value="on-the-road">On the road</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      What is the job location? *
                    </FormLabel>
                    <FormControl>
                      <PlacesAutocomplete
                        value={field.value}
                        onChange={(value, placeResult) => {
                          field.onChange(value);
                          if (placeResult) {
                            setValue("locationSuburb", placeResult.suburb);
                            setValue("locationState", placeResult.state);
                            setValue("locationPostcode", placeResult.postcode);
                          }
                        }}
                        placeholder="Enter address or 'Suburb, State' (e.g., Melbourne, VIC)"
                        className="text-base h-12 border-primary"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Enter a full address or just &quot;Suburb, State&quot; (e.g.,
                      Sydney, NSW)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Job Highlights */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Job Highlights
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              Add up to 3 key highlights about this role (max 80 characters each)
            </p>

            <div className="space-y-3">
              {highlights.map((highlight, index) => {
                const charCount = getCharCount(highlight);
                const isOverLimit = charCount > 80;

                return (
                  <div key={index}>
                    <FormLabel className="text-sm font-medium">
                      Highlight {index + 1}
                    </FormLabel>
                    <div className="space-y-1">
                      <Input
                        placeholder={
                          index === 0
                            ? "e.g. Lead innovative AI solutions using cutting-edge machine learning"
                            : index === 1
                            ? "e.g. Work with world-class data scientists on breakthrough research"
                            : "e.g. Competitive salary with equity and comprehensive benefits package"
                        }
                        value={highlight}
                        onChange={(e) =>
                          handleHighlightChange(index, e.target.value)
                        }
                        className={cn(
                          "text-base h-12 border-primary",
                          isOverLimit && "border-red-500 focus:border-red-500"
                        )}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span
                          className={cn(
                            "text-muted-foreground",
                            isOverLimit && "text-red-500"
                          )}
                        >
                          {charCount === 0
                            ? "No characters yet"
                            : `${charCount}/80 characters`}
                          {isOverLimit && " (too long)"}
                        </span>
                        <span className="text-muted-foreground">
                          Max: 80 characters
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Job Details
            </h3>

            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Job type *
                  </FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {jobTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleJobTypeChange(option.value)}
                        className={cn(
                          "p-3 border rounded-lg text-left transition-all hover:border-primary",
                          selectedJobType === option.value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-primary text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Part-time Hours Configuration */}
            {requiresHoursConfig && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-4 mt-4">
                <h4 className="font-medium text-foreground">Expected hours</h4>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Show by
                  </label>
                  <Select
                    value={hoursConfig.showBy}
                    onValueChange={(value) =>
                      setHoursConfig((prev) => ({
                        ...prev,
                        showBy: value as "fixed" | "range" | "maximum" | "minimum",
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                      <SelectItem value="maximum">Maximum</SelectItem>
                      <SelectItem value="minimum">Minimum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hoursConfig.showBy === "fixed" && (
                  <div className="flex items-center gap-2">
                    <span>Fixed at</span>
                    <Input
                      type="number"
                      placeholder="40"
                      className="w-20 border-primary"
                      value={hoursConfig.fixedHours || ""}
                      onChange={(e) =>
                        setHoursConfig((prev) => ({
                          ...prev,
                          fixedHours: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span>Hours per week</span>
                  </div>
                )}

                {hoursConfig.showBy === "range" && (
                  <div className="flex items-center gap-2">
                    <span>From</span>
                    <Input
                      type="number"
                      placeholder="20"
                      className="w-20 border-primary"
                      value={hoursConfig.minHours || ""}
                      onChange={(e) =>
                        setHoursConfig((prev) => ({
                          ...prev,
                          minHours: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span>To</span>
                    <Input
                      type="number"
                      placeholder="40"
                      className="w-20 border-primary"
                      value={hoursConfig.maxHours || ""}
                      onChange={(e) =>
                        setHoursConfig((prev) => ({
                          ...prev,
                          maxHours: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span>Hours per week</span>
                  </div>
                )}

                {hoursConfig.showBy === "maximum" && (
                  <div className="flex items-center gap-2">
                    <span>No more than</span>
                    <Input
                      type="number"
                      placeholder="40"
                      className="w-20 border-primary"
                      value={hoursConfig.maxHours || ""}
                      onChange={(e) =>
                        setHoursConfig((prev) => ({
                          ...prev,
                          maxHours: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span>Hours per week</span>
                  </div>
                )}

                {hoursConfig.showBy === "minimum" && (
                  <div className="flex items-center gap-2">
                    <span>No less than</span>
                    <Input
                      type="number"
                      placeholder="20"
                      className="w-20 border-primary"
                      value={hoursConfig.minHours || ""}
                      onChange={(e) =>
                        setHoursConfig((prev) => ({
                          ...prev,
                          minHours: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <span>Hours per week</span>
                  </div>
                )}
              </div>
            )}

            {/* Contract Length Configuration */}
            {requiresContractConfig && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-4 mt-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  How long is the contract?
                </h4>

                <div className="flex items-center gap-2">
                  <span>Length</span>
                  <Input
                    type="number"
                    placeholder="6"
                    className="w-20 border-primary"
                    value={contractConfig.length || ""}
                    onChange={(e) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        length: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                  <span>Period</span>
                  <Select
                    value={contractConfig.period}
                    onValueChange={(value) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        period: value as "days" | "weeks" | "months" | "years",
                      }))
                    }
                  >
                    <SelectTrigger className="w-32 border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">day(s)</SelectItem>
                      <SelectItem value="weeks">week(s)</SelectItem>
                      <SelectItem value="months">month(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Pay Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pay & Benefits
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  Show pay on job post
                </FormLabel>
                <Switch
                  checked={showPay}
                  onCheckedChange={(checked) => {
                    setShowPay(checked);
                    form.setValue("showPay", checked);
                  }}
                />
              </div>

              {showPay && (
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
                      <SelectTrigger className="mt-1 border-primary">
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
                          className="mt-1 border-primary"
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
                            className="mt-1 border-primary"
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
                            className="mt-1 border-primary"
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
                          className="mt-1 border-primary"
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
                          className="mt-1 border-primary"
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
                        <SelectTrigger className="mt-1 border-primary">
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
              )}

            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="min-w-[120px] h-12">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
