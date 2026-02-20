"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { Briefcase, CheckCircle } from "lucide-react";

// Loading component for Suspense fallback
function EmployerLoginLoading() {
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
const EmployerAuthContent = () => {
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

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user && !preventRedirect && !signingIn) {
      const next = searchParams.get("next") || "/employer";
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

    const { error } = await signUp(email, password, "", "employer");

    if (error) {
      setSignUpError(error.message);
    } else {
      setSignUpSuccess(true);
      toast({
        title: "Employer account created!",
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

        if (profile?.user_type === 'job_seeker') {
          // User is a job seeker trying to sign in as employer
          setPreventRedirect(true); // Prevent redirect
          await supabase.auth.signOut({ scope: 'local' }); // Sign them out locally
          setSignInError(
            <>
              This email is registered as a job seeker account. Please use the{' '}
              <Link href="/login" className="font-medium underline hover:no-underline">
                job seeker sign-in portal
              </Link>{' '}
              instead.
            </>
          );
          setLoading(false);
          return;
        }
      }

      // Proceed with normal employer sign-in
      if (!preventRedirect) {
        const next = searchParams.get("next") || "/employer";
        router.push(next);
      }
    } catch (profileError) {
      console.error('Error checking user type:', profileError);
      // If we can't check profile, proceed normally
      if (!preventRedirect) {
        const next = searchParams.get("next") || "/employer";
        router.push(next);
      }
    }

    setLoading(false);
    setSigningIn(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl text-foreground font-bold">
                Employer Portal
              </CardTitle>
            </div>
            <CardDescription>
              Post jobs and find the best AI talent in Australia
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
                    <Alert variant="destructive" id="signin-error">
                      <AlertDescription>{signInError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@company.com"
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

                  <p className="text-center text-sm text-muted-foreground">
                    Looking for a job?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline"
                    >
                      Sign in as job seeker
                    </Link>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {signUpSuccess ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Account Created Successfully!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        We&apos;ve sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Once verified, you can sign in and start posting jobs to find top AI talent.
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
                      <Alert variant="destructive" id="signup-error">
                        <AlertDescription>
                          {signUpError.includes('already registered') ? (
                            <div>
                              This email is already registered. If you have an existing job seeker account, please{' '}
                              <Link href="/login" className="font-medium underline hover:no-underline">
                                sign in as a job seeker
                              </Link>
                              . Otherwise, use a different email for your employer account.
                            </div>
                          ) : (
                            signUpError
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Company Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@company.com"
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

                    <p className="text-center text-sm text-muted-foreground">
                      Looking for a job?{" "}
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        Create a job seeker account
                      </Link>
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

// Main page component with Suspense wrapper
export default function EmployerAuthPage() {
  return (
    <Suspense fallback={<EmployerLoginLoading />}>
      <EmployerAuthContent />
    </Suspense>
  );
}
