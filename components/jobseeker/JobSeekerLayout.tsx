"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { JobSeekerSidebar } from "@/components/jobseeker/JobSeekerSidebar";
import { useUserTypeGuard } from "@/hooks/useUserTypeGuard";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSeekerLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const JobSeekerLayout = ({ children, title }: JobSeekerLayoutProps) => {
  const { user } = useAuth();
  const { isUserType, getUserTypeRoute, isLoading } = useUserTypeGuard();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  // Loading state while checking user type
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-job seekers
  if (!isUserType("job_seeker")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This page is only available for job seekers. Please use your job seeker account to access this area.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push(getUserTypeRoute())}>
              Go to My Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <JobSeekerSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header with trigger */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
            <Link href="/" className="flex items-center">
              <Image
                src="/aja-300x300-blue-logo.svg"
                alt="AI Jobs Australia Logo"
                width={48}
                height={48}
                className="hover:opacity-80 transition-opacity mx-7"
              />
            </Link>
          </header>

          {/* Main content */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
