"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getAdminStats } from "@/lib/admin/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Users,
  Building,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminStats {
  total_jobs: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  featured: number;
  expired: number;
  total_companies: number;
  total_users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Jobs",
      value: stats?.total_jobs || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Approval",
      value: stats?.pending_approval || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      action: {
        label: "Review",
        href: "/admin/jobs?status=pending_approval",
      },
    },
    {
      title: "Approved Jobs",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected Jobs",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Featured Jobs",
      value: stats?.featured || 0,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Companies",
      value: stats?.total_companies || 0,
      icon: Building,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      title: "Expired Jobs",
      value: stats?.expired || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage jobs, users, and monitor platform activity
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.action && (
                    <Link href={stat.action.href}>
                      <Button variant="link" size="sm" className="px-0 mt-1">
                        {stat.action.label} →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/jobs?status=pending_approval">
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Review Pending Jobs
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Manage All Jobs
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View Users
                </Button>
              </Link>
              <Link href="/admin/companies">
                <Button variant="outline">
                  <Building className="mr-2 h-4 w-4" />
                  Manage Companies
                </Button>
              </Link>
              <Link href="/admin/jobs/new">
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking will be available soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}