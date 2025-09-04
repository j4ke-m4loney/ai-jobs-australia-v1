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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobFormData2, PRICING_TIERS } from "@/types/job2";
import { CreditCard, Check, Star, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  pricingTier: z.enum(["standard", "featured", "annual"]),
});

interface Props {
  formData: JobFormData2;
  updateFormData: (data: Partial<JobFormData2>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const tierIcons = {
  standard: Star,
  featured: Crown,
  annual: Zap,
};

const tierColors = {
  standard: "border-border",
  featured: "border-primary bg-primary/5",
  annual: "border-secondary bg-secondary/5",
};

export default function PricingSelectionStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricingTier: formData.pricingTier,
    },
  });

  const watchedTier = form.watch("pricingTier");

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Select the plan that best fits your hiring needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PRICING_TIERS).map(([tier, details]) => {
              const Icon = tierIcons[tier as keyof typeof tierIcons];
              const isSelected = watchedTier === tier;
              const isPopular = tier === "featured";

              return (
                <Card
                  key={tier}
                  className={cn(
                    "relative cursor-pointer transition-all hover:shadow-lg",
                    isSelected
                      ? tierColors[tier as keyof typeof tierColors]
                      : "border-border",
                    isPopular && "ring-2 ring-primary"
                  )}
                  onClick={() => form.setValue("pricingTier", tier as any)}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{details.name}</CardTitle>
                    <div className="text-3xl font-bold text-foreground">
                      {details.priceDisplay}
                      {tier === "annual" && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          /year
                        </span>
                      )}
                    </div>
                    {tier === "annual" && (
                      <p className="text-sm text-green-600 font-medium">
                        Save ${(PRICING_TIERS.standard.price * 6 - PRICING_TIERS.annual.price).toLocaleString()} vs 6x Standard
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {details.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="w-full mt-6"
                      onClick={() => form.setValue("pricingTier", tier as any)}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Payment Information
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure payment processing via Stripe</li>
                  <li>• All major credit cards accepted</li>
                  <li>• Jobs go live immediately after payment</li>
                  <li>• 30-day posting duration (all plans)</li>
                  <li>• Contact support for enterprise pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev} size="lg">
            Back
          </Button>
          <Button type="submit" size="lg" className="min-w-[120px]">
            Continue to Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
