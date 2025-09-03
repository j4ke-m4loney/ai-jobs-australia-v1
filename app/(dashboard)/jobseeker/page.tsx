"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { JobSeekerSidebar } from "@/components/jobseeker/JobSeekerSidebar";
import { JobSeekerDashboardOverview } from "@/components/jobseeker/JobSeekerDashboardOverview";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <JobSeekerSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header bar with sidebar toggle and browse jobs button */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
            <Button onClick={() => router.push("/jobs")} className="gap-2">
              <Search className="w-4 h-4" />
              Browse Jobs
            </Button>
          </header>

          {/* Main content */}
          <div className="flex-1 p-8">
            <JobSeekerDashboardOverview />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
