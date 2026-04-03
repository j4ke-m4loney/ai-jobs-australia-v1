"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, ExternalLink } from "lucide-react";

export default function ImpersonatePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  const handleImpersonate = async () => {
    if (!email || !user) return;

    setLoading(true);
    setLoginUrl(null);

    try {
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user.id,
          targetEmail: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to generate login link");
        return;
      }

      setLoginUrl(data.loginUrl);
      toast.success("Login link generated — open it in an incognito window");
    } catch (error) {
      console.error("Error generating impersonation link:", error);
      toast.error("Failed to generate login link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Impersonate Employer
            </CardTitle>
            <CardDescription>
              Generate a one-time login link to access an employer&apos;s account.
              Open the link in an incognito window to keep your admin session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter employer email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImpersonate()}
              />
              <Button
                onClick={handleImpersonate}
                disabled={loading || !email}
              >
                {loading ? "Generating..." : "Generate Link"}
              </Button>
            </div>

            {loginUrl && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="text-sm font-medium">Login link generated for {email}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(loginUrl);
                      toast.success("Link copied to clipboard");
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(loginUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Right-click &quot;Open in New Tab&quot; and select &quot;Open in Incognito Window&quot;
                  to keep your admin session active.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
