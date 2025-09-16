"use client";

import { EmployerLayout } from "@/components/employer/EmployerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Eye,
  Users,
  Target,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const EmployerAnalytics = () => {
  const router = useRouter();

  return (
    <EmployerLayout title="Analytics">
      <div className="grid gap-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/employer")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Advanced Analytics Coming Soon</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              We're working on bringing you detailed insights about your job postings, 
              including view trends, conversion rates, and candidate engagement metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1">View Analytics</h4>
                <p className="text-xs text-muted-foreground">
                  Track how many people view your job postings
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1">Conversion Metrics</h4>
                <p className="text-xs text-muted-foreground">
                  Understand your view-to-application rates
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1">Time-to-Hire</h4>
                <p className="text-xs text-muted-foreground">
                  Optimize your recruitment process timing
                </p>
              </div>
            </div>

            {/* Current Available Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  What's Available Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Real-time Application Tracking</p>
                    <p className="text-xs text-muted-foreground">
                      View applications as they come in from your dashboard
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Job Status Management</p>
                    <p className="text-xs text-muted-foreground">
                      Keep track of active and inactive job postings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Application Status Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Mark applications as reviewed, shortlisted, or rejected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Button onClick={() => router.push("/employer/jobs")}>
                <Users className="w-4 h-4 mr-2" />
                View Your Jobs
              </Button>
              <Button variant="outline" onClick={() => router.push("/employer/applications")}>
                Review Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerAnalytics;