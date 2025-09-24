import { useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JobFormData } from "@/types/job";
import { ExternalLink, Mail, Globe, AtSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const schema = z
  .object({
    applicationMethod: z.enum(["external", "email"]),
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
  })
  .refine(
    (data) => {
      if (data.applicationMethod === "external") {
        return data.applicationUrl && data.applicationUrl.length > 0;
      }
      if (data.applicationMethod === "email") {
        return data.applicationEmail && data.applicationEmail.length > 0;
      }
      return true;
    },
    {
      message: "Please provide the required application information",
      path: ["applicationUrl", "applicationEmail"],
    }
  );

interface Props {
  formData: JobFormData;
  updateFormData: (data: Partial<JobFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ApplicationMethodStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicationMethod: formData.applicationMethod,
      applicationUrl: formData.applicationUrl,
      applicationEmail: formData.applicationEmail,
    },
  });

  const watchApplicationMethod = form.watch("applicationMethod");

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            How should candidates apply?
          </h3>
          <FormField
            control={form.control}
            name="applicationMethod"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="external"
                        id="external"
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="external"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <Card className="w-full border-0 shadow-none">
                          <CardContent className="flex flex-col items-center p-4">
                            <ExternalLink className="w-8 h-8 mb-2 text-primary" />
                            <h4 className="font-semibold">External Link</h4>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                              Direct candidates to your company&apos;s careers page
                              or ATS
                            </p>
                          </CardContent>
                        </Card>
                      </label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="email"
                        id="email"
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="email"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <Card className="w-full border-0 shadow-none">
                          <CardContent className="flex flex-col items-center p-4">
                            <Mail className="w-8 h-8 mb-2 text-primary" />
                            <h4 className="font-semibold">Email Application</h4>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                              Candidates will email their applications directly
                              to you
                            </p>
                          </CardContent>
                        </Card>
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchApplicationMethod === "external" && (
          <FormField
            control={form.control}
            name="applicationUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Application URL *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://yourcompany.com/careers/apply"
                    {...field}
                    className="text-base"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Candidates will be directed to this URL to apply for the
                  position
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchApplicationMethod === "email" && (
          <FormField
            control={form.control}
            name="applicationEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Application Email *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="careers@yourcompany.com"
                    type="email"
                    {...field}
                    className="text-base"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Candidates will send their applications to this email address
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
