"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { refetch } = useSubscription();

  useEffect(() => {
    // Refetch subscription status to update the UI
    refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to AJA Intelligence!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Your subscription is now active. You can now see AI Focus scores on all
            job listings to help you find the most AI-focused roles.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              What&apos;s included:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                AI Focus scores on all job listings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Detailed analysis of AI/ML relevance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Confidence ratings for each score
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/jobs")}
              className="w-full gap-2"
            >
              Browse Jobs with AI Focus
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/jobseeker")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
