"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
    badge: "pending",
  },
  {
    name: "Needs Review",
    href: "/admin/jobs/review",
    icon: AlertTriangle,
    badge: "review",
  },
  {
    name: "Post Job",
    href: "/admin/jobs/new",
    icon: Plus,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Companies",
    href: "/admin/companies",
    icon: Building,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Blog",
    href: "/admin/blog",
    icon: FileText,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Define callback functions first
  const checkAdminAccess = useCallback(async () => {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      router.push("/");
    } else {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, [router]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_approval");

      setPendingCount(count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  }, []);

  const fetchReviewCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "needs_review");

      setReviewCount(count || 0);
    } catch (error) {
      console.error("Error fetching review count:", error);
    }
  }, []);

  // Effect to check admin access and fetch pending count
  useEffect(() => {
    checkAdminAccess();
    fetchPendingCount();
    fetchReviewCount();
  }, [checkAdminAccess, fetchPendingCount, fetchReviewCount]);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Admin Panel</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge === "pending" && pendingCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      {pendingCount}
                    </span>
                  )}
                  {item.badge === "review" && reviewCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                      {reviewCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b px-6 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>System Operational</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-muted/20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}