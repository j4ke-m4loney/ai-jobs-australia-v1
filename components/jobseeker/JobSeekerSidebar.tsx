"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Heart,
  FileText,
  Settings,
  LogOut,
  Search,
  Upload,
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Profile",
    url: "/jobseeker/profile",
    icon: User,
  },
  {
    title: "Documents",
    url: "/jobseeker/documents",
    icon: Upload,
  },
  {
    title: "Saved Jobs",
    url: "/jobseeker/saved-jobs",
    icon: Heart,
  },
  {
    title: "Applied Jobs",
    url: "/jobseeker/applications",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/jobseeker/settings",
    icon: Settings,
  },
];

export function JobSeekerSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

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
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">
                Dashboard
              </h2>
              <p className="text-xs text-sidebar-foreground/60">Job Seeker</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Search className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url} 
                      className={isActive(item.url) 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium flex items-center gap-2" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground flex items-center gap-2"
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.user_metadata?.first_name?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    "JS"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.first_name || "Job Seeker"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-2 py-1 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sidebar-accent/50 mx-auto"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-sidebar-foreground" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
