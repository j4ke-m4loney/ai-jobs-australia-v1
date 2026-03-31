"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "email" | "recovery" | "email_change" | null;

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    if (!tokenHash || !type) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link. Please try signing up again.");
      return;
    }

    setStatus("loading");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      setStatus("success");

      // Redirect based on user type after a brief pause so they see the success state
      const userType = data.session?.user?.user_metadata?.user_type || "job_seeker";
      const redirectPath = userType === "employer"
        ? "/employer/settings?verified=true"
        : "/jobseeker/profile?verified=true";

      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  // Missing or invalid parameters
  if (!tokenHash || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid Confirmation Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This link appears to be invalid or has expired. Please try signing up again.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "success" ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Email Confirmed!</CardTitle>
            </>
          ) : status === "error" ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Confirmation Failed</CardTitle>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Confirm Your Email</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "success" && (
            <>
              <p className="text-muted-foreground">
                Your email has been verified. Redirecting you now...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-muted-foreground">{errorMessage}</p>
              <div className="space-y-2">
                <Button onClick={handleConfirm} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Go to Sign In</Link>
                </Button>
              </div>
            </>
          )}

          {(status === "idle" || status === "loading") && (
            <>
              <p className="text-muted-foreground">
                Click the button below to verify your email address and activate your account.
              </p>
              <Button
                onClick={handleConfirm}
                disabled={status === "loading"}
                className="w-full"
                size="lg"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify My Email"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
