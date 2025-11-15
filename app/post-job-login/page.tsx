"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmployerHeader from "@/components/EmployerHeader";
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
import { Rocket, CheckCircle } from "lucide-react";

// Loading component for Suspense fallback
function PostJobLoginLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <EmployerHeader />
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
const PostJobLoginContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // If user is already logged in, redirect to post-job
  useEffect(() => {
    if (user) {
      const next = searchParams.get("next") || "/post-job";
      router.push(next);
    }
  }, [user, searchParams, router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signUp(email, password, "", "employer");

    if (error) {
      setError(error.message);
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
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect to post-job after successful signin
      const next = searchParams.get("next") || "/post-job";
      router.push(next);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <EmployerHeader />
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Rocket className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl text-foreground font-bold">
                Post Your First Job
              </CardTitle>
            </div>
            <CardDescription>
              Sign in or create an account to start hiring AI talent
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
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
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
                    {loading ? "Signing in..." : "Sign In & Post Job"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Want to access your dashboard instead?{" "}
                    <Link
                      href="/employer-login"
                      className="text-primary hover:underline"
                    >
                      Go to Dashboard Login
                    </Link>
                  </p>
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
                        Once verified, you can sign in and start posting your first job to find top AI talent.
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
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
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
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up & Post Job"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="/employer-login"
                        className="text-primary hover:underline"
                      >
                        Access your dashboard
                      </Link>
                    </p>
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
export default function PostJobLoginPage() {
  return (
    <Suspense fallback={<PostJobLoginLoading />}>
      <PostJobLoginContent />
    </Suspense>
  );
}