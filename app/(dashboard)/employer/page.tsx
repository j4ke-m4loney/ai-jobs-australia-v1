"use client";

import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { DashboardOverview } from "@/components/employer/DashboardOverview";
import { useRequireUserType } from "@/hooks/useUserTypeGuard";

export default function EmployerDashboard() {
  const { isLoading } = useRequireUserType("employer");

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <EmployerLayout title="Employer Dashboard">
      <DashboardOverview />
    </EmployerLayout>
  );
}
