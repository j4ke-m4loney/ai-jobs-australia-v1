"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSiteUrl } from "@/lib/utils/get-site-url";

interface AuthError {
  error: string;
  error_code: string;
  error_description: string;
}

export function AuthErrorHandler() {
  const [error, setError] = useState<AuthError | null>(null);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Check for error parameters in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    if (hashParams.get("error")) {
      setError({
        error: hashParams.get("error") || "",
        error_code: hashParams.get("error_code") || "",
        error_description: hashParams.get("error_description") || "",
      });

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleResendConfirmation = async () => {
    if (!email) return;

    setResending(true);
    setResent(false);

    try {
      // Attempt to resend the confirmation email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
        },
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        // If resend fails, try signing up again (in case the user exists but isn't confirmed)
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: Math.random().toString(36).slice(-8), // Temporary password
          options: {
            emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
          },
        });

        if (signUpError && !signUpError.message?.includes("already registered")) {
          throw signUpError;
        }
      }

      setResent(true);
      setError(null);
    } catch (err) {
      console.error("Failed to resend confirmation email:", err);
    } finally {
      setResending(false);
    }
  };

  if (!error) return null;

  // Handle different error types
  if (error.error_code === "otp_expired") {
    return (
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Confirmation Link Expired</AlertTitle>
        <AlertDescription className="text-orange-800">
          <p className="mb-4">
            Your email confirmation link has expired. Please enter your email address below to receive a new confirmation link.
          </p>
          {!resent ? (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white"
                />
              </div>
              <Button
                onClick={handleResendConfirmation}
                disabled={!email || resending}
                className="whitespace-nowrap"
              >
                {resending ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>New confirmation email sent! Please check your inbox.</span>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (error.error === "access_denied") {
    return (
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">Access Denied</AlertTitle>
        <AlertDescription className="text-red-800">
          {error.error_description || "There was an issue with your authentication. Please try again or contact support if the problem persists."}
        </AlertDescription>
      </Alert>
    );
  }

  // Generic error handler
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        {error.error_description || "An unexpected error occurred. Please try again."}
      </AlertDescription>
    </Alert>
  );
}