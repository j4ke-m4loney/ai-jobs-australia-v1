"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { DashboardOverview } from "@/components/employer/DashboardOverview";

export default function EmployerDashboard() {
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <EmployerSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header with trigger */}
          <header className="h-16 border-b border-sidebar-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Employer Dashboard</h1>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 p-6">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}