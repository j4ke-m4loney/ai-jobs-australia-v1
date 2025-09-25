"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { User, Briefcase, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Loading component for Suspense fallback
function AuthLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Loading...
            </h2>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

// Main component that uses useSearchParams
function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      const userType = profile?.user_type || user.user_metadata?.user_type;
      const defaultRedirect =
        userType === "employer" ? "/employer" : "/jobseeker";
      const next = searchParams.get("next") || defaultRedirect;
      router.push(next);
    }
  }, [user, profile, searchParams, router]);

  // Don't render if redirecting
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome to AI Jobs Australia
            </CardTitle>
            <CardDescription>
              Choose how you&apos;d like to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              asChild
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
            >
              <Link href="/login">
                <User className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">I&apos;m looking for a job</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and apply for AI positions
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
            >
              <Link href="/employer-login">
                <Briefcase className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">I want to hire talent</div>
                  <div className="text-sm text-muted-foreground">
                    Post jobs and find the best candidates
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Job Seeker Sign In
              </Link>
              {" | "}
              <Link
                href="/employer-login"
                className="text-primary hover:underline"
              >
                Employer Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

// Main page component with Suspense wrapper
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}
