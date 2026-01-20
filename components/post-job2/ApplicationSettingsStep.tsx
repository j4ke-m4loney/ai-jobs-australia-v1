import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
// import { Switch } from "@/components/ui/switch"; // Commented out - restore when internal applications enabled
import { JobFormData2 } from "@/types/job2";
import { Mail, ExternalLink, Settings, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  applicationMethod: z.enum(["external", "email", "indeed"]),
  applicationUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  applicationEmail: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  hiringTimeline: z.enum([
    "immediately",
    "within-1-week",
    "within-1-month",
    "flexible",
  ]),
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
  onPrev: () => void;
  onShowPreview?: () => void;
}

const applicationMethods = [
  {
    value: "external",
    label: "Redirect to ATS or Company Website",
    icon: ExternalLink,
  },
  { value: "email", label: "Email applications", icon: Mail },
  // Commented out - can be restored when AI Jobs Australia applications feature is enabled
  // { value: "indeed", label: "AI Jobs Australia applications", icon: Settings },
];

// Commented out - can be restored when hiring timeline feature is re-enabled
// const hiringTimelines = [
//   { value: "immediately", label: "Immediately" },
//   { value: "within-1-week", label: "Within 1 week" },
//   { value: "within-1-month", label: "Within 1 month" },
//   { value: "flexible", label: "Flexible" },
// ];

export default function ApplicationSettingsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  onShowPreview,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicationMethod: formData.applicationMethod,
      applicationUrl: formData.applicationUrl || "",
      applicationEmail: formData.applicationEmail || "",
      hiringTimeline: formData.hiringTimeline,
    },
  });

  const watchedMethod = form.watch("applicationMethod");
  const watchedValues = form.watch();

  // Watch for form changes and update form data in real-time
  useEffect(() => {
    // Debounce the updates to avoid too frequent calls
    const timeoutId = setTimeout(() => {
      updateFormData({
        ...watchedValues,
        communicationPrefs: formData.communicationPrefs,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, formData.communicationPrefs, updateFormData]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData({
      ...values,
      communicationPrefs: formData.communicationPrefs,
    });
    onNext();
  };

  // Commented out - restore when internal applications enabled
  // const updateCommunicationPref = (key: string, value: boolean) => {
  //   updateFormData({
  //     communicationPrefs: {
  //       ...formData.communicationPrefs,
  //       [key]: value,
  //     },
  //   });
  // };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Application Method */}
          <div className="space-y-4">
            <FormLabel className="flex items-center gap-2 text-base font-medium">
              <Settings className="w-5 h-5" />
              How should candidates apply? *
            </FormLabel>

            <div className="grid gap-3">
              {applicationMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      form.setValue("applicationMethod", method.value as "email" | "external" | "indeed")
                    }
                    className={cn(
                      "p-4 border rounded-lg text-left transition-all hover:border-primary flex items-center gap-3",
                      watchedMethod === method.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-primary text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application URL for external method */}
          {watchedMethod === "external" && (
            <FormField
              control={form.control}
              name="applicationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Application URL *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://careers.yourcompany.com/apply"
                      {...field}
                      className="text-base h-12 border-primary"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Candidates will be redirected to this URL to apply
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Application Email for email method */}
          {watchedMethod === "email" && (
            <FormField
              control={form.control}
              name="applicationEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Application Email *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="careers@yourcompany.com"
                      type="email"
                      {...field}
                      className="text-base h-12 border-primary"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Candidates will email their applications to this address
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Hiring Timeline - COMMENTED OUT - Can be restored later */}
          {/* <FormField
            control={form.control}
            name="hiringTimeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Clock className="w-5 h-5" />
                  When do you want to start interviewing? *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base border-primary">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hiringTimelines.map((timeline) => (
                      <SelectItem key={timeline.value} value={timeline.value}>
                        {timeline.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* Communication Preferences - COMMENTED OUT - Can be restored when internal applications are enabled */}
          {/* <div className="space-y-4">
            <FormLabel className="text-base font-medium">
              Communication Preferences
            </FormLabel>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Email updates about applications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when candidates apply
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.communicationPrefs.emailUpdates}
                  onCheckedChange={(checked) =>
                    updateCommunicationPref("emailUpdates", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone screening assistance</p>
                    <p className="text-sm text-muted-foreground">
                      We can help with initial candidate screening
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.communicationPrefs.phoneScreening}
                  onCheckedChange={(checked) =>
                    updateCommunicationPref("phoneScreening", checked)
                  }
                />
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={onPrev} size="lg">
            Back
          </Button>
          <div className="flex items-center gap-3">
            {onShowPreview && (
              <Button
                type="button"
                variant="outline"
                onClick={onShowPreview}
                size="lg"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            )}
            <Button type="submit" size="lg" className="min-w-[120px]">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
