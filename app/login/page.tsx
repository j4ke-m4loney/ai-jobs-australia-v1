"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomepageSocialProof from "@/components/HomepageSocialProof";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

// Loading component for Suspense fallback
function LoginLoading() {
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
const JobSeekerAuthContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signInError, setSignInError] = useState<string | React.ReactNode>("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [preventRedirect, setPreventRedirect] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const signInErrorRef = useRef<HTMLDivElement>(null);
  const signUpErrorRef = useRef<HTMLDivElement>(null);

  // Focus error alerts when they appear
  useEffect(() => {
    if (signInError) signInErrorRef.current?.focus();
  }, [signInError]);
  useEffect(() => {
    if (signUpError) signUpErrorRef.current?.focus();
  }, [signUpError]);

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user && !preventRedirect && !signingIn) {
      const next = searchParams.get("next") || "/jobseeker";
      router.push(next);
    }
  }, [user, preventRedirect, signingIn, searchParams, router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSignUpError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signUp(email, password, "", "job_seeker");

    if (error) {
      setSignUpError(error.message);
    } else {
      setSignUpSuccess(true);
      toast({
        title: "Job seeker account created!",
        description: "Please check your email to verify your account.",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSigningIn(true);
    setSignInError("");
    setPreventRedirect(false); // Reset prevent redirect flag

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message === "Email not confirmed") {
        setSignInError("Check your inbox to confirm this email");
      } else {
        setSignInError(error.message);
      }
      setLoading(false);
      return;
    }

    // Check user type after successful sign-in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (profile?.user_type === 'employer') {
          // User is an employer trying to sign in as job seeker
          setPreventRedirect(true); // Prevent redirect
          await supabase.auth.signOut({ scope: 'local' }); // Sign them out locally
          setSignInError(
            <>
              This email is registered as an employer account. Please use the{' '}
              <Link href="/employer-login" className="font-medium underline hover:no-underline">
                employer sign-in portal
              </Link>{' '}
              instead.
            </>
          );
          setLoading(false);
          return;
        }
      }

      // Proceed with normal job seeker sign-in
      if (!preventRedirect) {
        const next = searchParams.get("next") || "/jobseeker";
        router.push(next);
      }
    } catch (profileError) {
      console.error('Error checking user type:', profileError);
      // If we can't check profile, proceed normally
      if (!preventRedirect) {
        const next = searchParams.get("next") || "/jobseeker";
        router.push(next);
      }
    }

    setLoading(false);
    setSigningIn(false);
  };

  const getGuestUrl = () => {
    const next = searchParams.get("next");
    if (next) {
      // Parse the next URL to preserve existing parameters
      const url = new URL(next, window.location.origin);
      url.searchParams.set("guest", "true");
      return url.pathname + url.search;
    }
    return "/jobs?guest=true";
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div id="main-content" className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Job Seeker Portal
            </CardTitle>
          </div>
          <CardDescription>
            Find and apply for the best AI jobs in Australia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <Alert variant="destructive" id="signin-error" ref={signInErrorRef} tabIndex={-1}>
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    aria-invalid={!!signInError}
                    aria-describedby={signInError ? "signin-error" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    aria-invalid={!!signInError}
                    aria-describedby={signInError ? "signin-error" : undefined}
                  />
                </div>
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleSignInButton
                  userType="job_seeker"
                  onError={(error) => setSignInError(error)}
                  className="w-full"
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push(getGuestUrl())}
                >
                  Maybe Later
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Are you an employer?{" "}
                  <Link
                    href="/employer-login"
                    className="text-primary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signUpSuccess ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Account Created Successfully!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We&apos;ve sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Once verified, you can sign in and start exploring AI job opportunities.
                    </p>
                  </div>
                  <Button
                    onClick={() => setSignUpSuccess(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {signUpError && (
                    <Alert variant="destructive" id="signup-error" ref={signUpErrorRef} tabIndex={-1}>
                      <AlertDescription>
                        {signUpError.includes('already registered') ? (
                          <div>
                            This email is already registered. If you have an existing employer account, please{' '}
                            <Link href="/employer-login" className="font-medium underline hover:no-underline">
                              sign in as an employer
                            </Link>
                            . Otherwise, use a different email for your job seeker account.
                          </div>
                        ) : (
                          signUpError
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      aria-invalid={!!signUpError}
                      aria-describedby={signUpError ? "signup-error" : undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      minLength={6}
                      required
                      aria-invalid={!!signUpError}
                      aria-describedby={signUpError ? "signup-error" : undefined}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <GoogleSignInButton
                    userType="job_seeker"
                    onError={(error) => setSignUpError(error)}
                    className="w-full"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push(getGuestUrl())}
                  >
                    Maybe Later
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Looking to hire?{" "}
                    <Link
                      href="/employer-login"
                      className="text-primary hover:underline"
                    >
                      Create an employer account
                    </Link>
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Social Proof */}
      <HomepageSocialProof />
      </div>
      <Footer />
    </div>
  );
};

// Main page component with Suspense wrapper
export default function JobSeekerAuthPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <JobSeekerAuthContent />
    </Suspense>
  );
}
