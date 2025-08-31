"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Building2,
  Settings,
  Plus,
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/employer",
    icon: LayoutDashboard,
  },
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
  {
    title: "Analytics",
    url: "/employer/analytics",
    icon: BarChart3,
  },
  {
    title: "Company Profile",
    url: "/employer/company-profile",
    icon: Building2,
  },
  {
    title: "Settings",
    url: "/employer/settings",
    icon: Settings,
  },
];

export function EmployerSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const collapsed = state === "collapsed";

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">
                JobPortal
              </h2>
              <p className="text-xs text-sidebar-foreground/60">Employer Hub</p>
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
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
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

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.user_metadata?.first_name?.[0] || "E"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.user_metadata?.first_name || "Employer"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}