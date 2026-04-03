"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Settings,
  Plus,
  LogOut,
  Users,
  ChevronUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";

const menuItems = [
  // Dashboard - commented out, redundant for now
  // {
  //   title: "Dashboard",
  //   url: "/employer",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Job Management",
    url: "/employer/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    url: "/employer/applications",
    icon: Users,
  },
  // Analytics feature - coming soon!
  // {
  //   title: "Analytics",
  //   url: "/employer/analytics",
  //   icon: BarChart3,
  // },
  // Company Profile - not yet implemented
  // {
  //   title: "Company Profile",
  //   url: "/employer/company-profile",
  //   icon: Building2,
  // },
  {
    title: "Settings",
    url: "/employer/settings",
    icon: Settings,
  },
];

export function EmployerSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const collapsed = state === "collapsed";

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader
        className={`border-b border-border ${!collapsed ? "p-4" : "py-4"}`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">
                Employer Hub
              </h2>
              <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && (
          <div className="p-4">
            <Link href="/post-job">
              <Button className="w-full gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Post New Job
              </Button>
            </Link>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={
                        isActive(item.url)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full px-2 py-2 text-left hover:bg-sidebar-accent/50 rounded-md transition-colors">
              {!collapsed ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate capitalize">
                      {profile?.first_name
                        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                        : user?.user_metadata?.first_name || "Employer"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                </>
              ) : (
                <LogOut className="w-4 h-4 text-sidebar-foreground mx-auto" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer bg-black text-white hover:!bg-white hover:!text-black focus:!bg-white focus:!text-black"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
