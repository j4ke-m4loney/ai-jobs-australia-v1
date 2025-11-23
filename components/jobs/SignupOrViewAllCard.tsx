"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface SignupOrViewAllCardProps {
  hiddenJobsCount: number;
  categoryName?: string;
  cityName?: string;
  redirectPath: string;
  isLocation?: boolean;
}

export const SignupOrViewAllCard: React.FC<SignupOrViewAllCardProps> = ({
  hiddenJobsCount,
  categoryName,
  cityName,
  redirectPath,
  isLocation = false,
}) => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('🔍 [SignupOrViewAllCard] Component render:', {
    loading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    categoryName,
    cityName,
    hiddenJobsCount,
    redirectPath,
    isLocation,
  });

  // Show loading state while checking auth
  if (loading) {
    console.log('⏳ [SignupOrViewAllCard] Showing loading state');

    return (
      <Card className="border-2 border-primary/50 bg-primary/5 mt-8 relative z-20">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-primary/20 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-primary/10 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = categoryName || cityName || "";

  // If user is logged in, show "View All Jobs" button
  if (user) {
    console.log('✅ [SignupOrViewAllCard] User is logged in - showing "View All Jobs" button');
    return (
      <Card className="border-2 border-primary/50 bg-primary/5 mt-8 relative z-20">
        <CardContent className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {hiddenJobsCount > 0
              ? `${hiddenJobsCount} More ${displayName} ${hiddenJobsCount === 1 ? 'Job' : 'Jobs'} Available`
              : `Explore All ${displayName} Jobs`
            }
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {isLocation
              ? `View all available positions in ${displayName} and apply with one click`
              : `Browse all ${displayName.toLowerCase()} opportunities and find your perfect match`
            }
          </p>

          <div className="max-w-md mx-auto">
            <Link href="/jobs">
              <Button size="lg" className="w-full text-lg py-6">
                View All Jobs
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">✓ Full Access</h3>
              <p className="text-sm text-muted-foreground">
                See all job listings with complete details
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✓ Save & Track</h3>
              <p className="text-sm text-muted-foreground">
                Bookmark jobs and track your applications
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✓ Quick Apply</h3>
              <p className="text-sm text-muted-foreground">
                Apply instantly with your saved profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user is NOT logged in, show signup wall
  console.log('❌ [SignupOrViewAllCard] User is NOT logged in - showing signup wall');
  return (
    <Card className="border-2 border-primary/50 bg-primary/5 mt-8 relative z-20">
      <CardContent className="py-12 text-center">
        {hiddenJobsCount > 0 ? (
          <>
            <h2 className="text-3xl font-bold mb-4">
              Sign Up to View {hiddenJobsCount} More {displayName} {hiddenJobsCount === 1 ? 'Job' : 'Jobs'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {isLocation
                ? `Create a free account to access all ${displayName} positions and get instant job alerts`
                : `Create a free account to access all ${displayName.toLowerCase()} positions and get instant job alerts`
              }
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">
              Get Instant {displayName} Job Alerts
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {isLocation
                ? `Create a free account and be the first to know when new positions are posted in ${displayName}`
                : `Create a free account and be the first to know when new ${displayName.toLowerCase()} positions are posted`
              }
            </p>
          </>
        )}

        <div className="max-w-md mx-auto space-y-4">
          <Link
            href={`/login?next=${encodeURIComponent(redirectPath)}`}
            className="inline-block w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Sign Up Free - View All Jobs
          </Link>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          <div>
            <h3 className="font-semibold mb-2">✓ Instant Job Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {isLocation
                ? `Get notified when new jobs are posted in ${displayName}`
                : `Get notified when new ${displayName.toLowerCase()} jobs are posted`
              }
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✓ Save Jobs</h3>
            <p className="text-sm text-muted-foreground">
              Bookmark positions and apply later
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✓ One-Click Apply</h3>
            <p className="text-sm text-muted-foreground">
              Apply to multiple jobs with your profile
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
