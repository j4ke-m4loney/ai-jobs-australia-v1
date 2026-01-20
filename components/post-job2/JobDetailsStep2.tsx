import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { JobFormData2, JobTypeOption } from "@/types/job2";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const jobTypeValues = [
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
] as const;

const schema = z.object({
  jobTypes: z
    .array(z.enum(jobTypeValues))
    .min(1, "Select at least one job type")
    .max(4, "Select up to 4 job types"),
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
  onPrev: () => void;
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

export default function JobDetailsStep2({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Props) {
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobTypeOption[]>(
    formData.jobTypes || ["full-time"]
  );
  const [hoursConfig, setHoursConfig] = useState(
    formData.hoursConfig || { showBy: "fixed" as const }
  );
  const [contractConfig, setContractConfig] = useState(
    formData.contractConfig || { length: 1, period: "months" as const }
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobTypes: formData.jobTypes || ["full-time"],
    },
  });

  // Only show hours/contract config when exactly one job type is selected
  const requiresHoursConfig =
    selectedJobTypes.length === 1 && selectedJobTypes.includes("part-time");
  const contractTypes = [
    "fixed-term",
    "subcontract",
    "casual",
    "temp-to-perm",
    "contract",
    "volunteer",
    "internship",
  ];
  const requiresContractConfig =
    selectedJobTypes.length === 1 &&
    selectedJobTypes.some((type) => contractTypes.includes(type));

  const onSubmit = (values: z.infer<typeof schema>) => {
    const updateData: Partial<JobFormData2> = {
      jobTypes: values.jobTypes,
      hoursConfig: requiresHoursConfig ? hoursConfig : undefined,
      contractConfig: requiresContractConfig ? contractConfig : undefined,
    };
    updateFormData(updateData);
    onNext();
  };

  const handleJobTypeToggle = (value: JobTypeOption) => {
    const isSelected = selectedJobTypes.includes(value);
    let newSelection: JobTypeOption[];

    if (isSelected) {
      newSelection = selectedJobTypes.filter((t) => t !== value);
      if (newSelection.length === 0) {
        return;
      }
    } else {
      if (selectedJobTypes.length >= 4) {
        return;
      }
      newSelection = [...selectedJobTypes, value];
    }

    setSelectedJobTypes(newSelection);
    form.setValue("jobTypes", newSelection);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="jobTypes"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: _field /* intentionally unused */ }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Clock className="w-5 h-5" />
                  Job type * <span className="text-sm font-normal text-muted-foreground">(select up to 4)</span>
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {jobTypeOptions.map((option) => {
                    const isSelected = selectedJobTypes.includes(option.value as JobTypeOption);
                    const isDisabled = !isSelected && selectedJobTypes.length >= 4;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleJobTypeToggle(option.value as JobTypeOption)}
                        disabled={isDisabled}
                        className={cn(
                          "p-3 border rounded-lg text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-primary text-muted-foreground hover:border-primary",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Part-time Hours Configuration */}
          {requiresHoursConfig && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-foreground">Expected hours</h3>

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
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                How long is the contract?
              </h3>

              <div className="flex items-center gap-2">
                <span>Length</span>
                <Input
                  type="number"
                  placeholder="6"
                  className="w-20"
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
