import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { JobSeekerSidebar } from "@/components/jobseeker/JobSeekerSidebar";
import { JobSeekerDashboardOverview } from "@/components/jobseeker/JobSeekerDashboardOverview";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
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
            <Button onClick={() => navigate("/jobs")} className="gap-2">
              <Search className="w-4 h-4" />
              Browse Jobs
            </Button>
          </header>

          {/* Main content */}
          <div className="flex-1 p-6">
            <JobSeekerDashboardOverview />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default JobSeekerDashboard;
