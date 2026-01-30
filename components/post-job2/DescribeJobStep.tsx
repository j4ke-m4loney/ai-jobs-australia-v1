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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { JobFormData2 } from "@/types/job2";
import {
  Building2,
  Eye,
} from "lucide-react";
import { useEffect } from "react";
import { CompanyCombobox } from "@/components/admin/CompanyCombobox";

const schema = z.object({
  jobDescription: z
    .string()
    .min(100, "Job description must be at least 100 characters"),
  companyName: z.string().min(2, "Company name is required"),
  companyDescription: z
    .string()
    .optional()
    .or(z.literal("")),
  companyWebsite: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
  onPrev: () => void;
  onShowPreview: () => void;
  companies: Array<{ id: string; name: string }>;
}

export default function DescribeJobStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  onShowPreview,
  companies,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobDescription: formData.jobDescription,
      companyName: formData.companyName,
      companyDescription: formData.companyDescription,
      companyWebsite: formData.companyWebsite,
    },
  });

  // Watch for form changes and update form data in real-time
  const watchedValues = form.watch();
  useEffect(() => {
    // Debounce the updates to avoid too frequent calls
    const timeoutId = setTimeout(() => {
      updateFormData(watchedValues);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, updateFormData]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Job Description */}
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Job Description *
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Describe the role, responsibilities, team culture, requirements, qualifications, and what makes this opportunity exciting..."
                    minHeight="200px"
                    className="border-primary"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Include all details about the role: daily responsibilities, team structure,
                  required skills, qualifications, experience, growth opportunities, and company culture.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Company Info Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h3>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Company Name *
                    </FormLabel>
                    <FormControl>
                      <CompanyCombobox
                        value={field.value}
                        onChange={field.onChange}
                        companies={companies}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TODO: Re-enable logo upload when storage is configured
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-primary rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <Button type="button" variant="outline">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              */}

              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Company Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.yourcompany.com.au"
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
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Company Description
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Tell candidates about your company, culture, mission, and what makes it a great place to work..."
                        minHeight="120px"
                        className="border-primary"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Describe your company&apos;s mission, values, culture, and
                      growth story.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev} size="lg">
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onShowPreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button type="submit" size="lg" className="min-w-[120px]">
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
