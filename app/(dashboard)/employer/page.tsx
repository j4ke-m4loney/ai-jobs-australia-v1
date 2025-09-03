"use client";

import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { DashboardOverview } from "@/components/employer/DashboardOverview";

export default function EmployerDashboard() {
  return (
    <EmployerLayout title="Employer Dashboard">
      <DashboardOverview />
    </EmployerLayout>
  );
}
