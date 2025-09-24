import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
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
import { JobFormData2 } from "@/types/job2";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
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
  const [selectedJobType, setSelectedJobType] = useState(formData.jobType);
  const [hoursConfig, setHoursConfig] = useState(
    formData.hoursConfig || { showBy: "fixed" as const }
  );
  const [contractConfig, setContractConfig] = useState(
    formData.contractConfig || { length: 1, period: "months" as const }
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobType: formData.jobType,
    },
  });

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
    const updateData: Partial<JobFormData2> = {
      jobType: values.jobType,
      hoursConfig: requiresHoursConfig ? hoursConfig : undefined,
      contractConfig: requiresContractConfig ? contractConfig : undefined,
    };
    updateFormData(updateData);
    onNext();
  };

  const handleJobTypeChange = (value: string) => {
    const jobType = value as JobFormData2["jobType"];
    setSelectedJobType(jobType);
    form.setValue("jobType", jobType);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Clock className="w-5 h-5" />
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
