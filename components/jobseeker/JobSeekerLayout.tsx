"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { JobSeekerSidebar } from "@/components/jobseeker/JobSeekerSidebar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface JobSeekerLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const JobSeekerLayout = ({ children, title }: JobSeekerLayoutProps) => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <JobSeekerSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header with trigger */}
          <header className="h-16 border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
            <Button onClick={() => router.push("/jobs")} className="gap-2">
              <Search className="w-4 h-4" />
              Browse Jobs
            </Button>
          </header>

          {/* Main content */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
