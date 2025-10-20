"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface GrowthDataPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function UserGrowthChart() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState({
    totalUsers: true,
    newUsers: true,
  });

  useEffect(() => {
    fetchGrowthData(period);
  }, [period]);

  const toggleMetric = (metric: 'totalUsers' | 'newUsers') => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const fetchGrowthData = async (selectedPeriod: Period) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user ID for authentication
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/admin/user-growth?period=${selectedPeriod}`, {
        headers: {
          'x-admin-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user growth data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      console.error('Error fetching growth data:', err);
      setError('Failed to load user growth data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatXAxis = (dateStr: string) => {
    switch (period) {
      case 'daily':
        // Format: "Jan 15"
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      case 'weekly':
        // Format: "W05 '25"
        const [weekYear, weekStr] = dateStr.split('-W');
        return `W${weekStr} '${weekYear.slice(2)}`;

      case 'monthly':
        // Format: "Jan 2025"
        const [mYear, mMonth] = dateStr.split('-');
        const mDate = new Date(parseInt(mYear), parseInt(mMonth) - 1, 1);
        return mDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      case 'yearly':
        // Format: "2025"
        return dateStr;

      default:
        return dateStr;
    }
  };

  const formatTooltipLabel = (dateStr: string) => {
    switch (period) {
      case 'daily':
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

      case 'weekly':
        const [weekYear, weekStr] = dateStr.split('-W');
        return `Week ${weekStr}, ${weekYear}`;

      case 'monthly':
        const [mYear, mMonth] = dateStr.split('-');
        const mDate = new Date(parseInt(mYear), parseInt(mMonth) - 1, 1);
        return mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      case 'yearly':
        return `Year ${dateStr}`;

      default:
        return dateStr;
    }
  };

  const totalUsers = data.length > 0 ? data[data.length - 1].totalUsers : 0;
  const newUsersThisPeriod = data.length > 0 ? data[data.length - 1].newUsers : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              Track user registrations and total users over time
            </CardDescription>
          </div>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No user data available</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {period === 'daily' ? 'Today' :
                   period === 'weekly' ? 'This Week' :
                   period === 'monthly' ? 'This Month' :
                   'This Year'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  +{newUsersThisPeriod.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Metric Toggle Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={visibleMetrics.totalUsers ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric('totalUsers')}
                className={visibleMetrics.totalUsers ? "bg-primary" : ""}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  Total Users
                </div>
              </Button>
              <Button
                variant={visibleMetrics.newUsers ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric('newUsers')}
                className={visibleMetrics.newUsers ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-background" />
                  New Signups
                </div>
              </Button>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  className="text-xs"
                  angle={period === 'daily' ? -45 : 0}
                  textAnchor={period === 'daily' ? 'end' : 'middle'}
                  height={period === 'daily' ? 60 : 30}
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={formatTooltipLabel}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'totalUsers' ? 'Total Users' : 'New Signups',
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                {(visibleMetrics.totalUsers || visibleMetrics.newUsers) && (
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value: string) =>
                      value === 'totalUsers' ? 'Total Users' : 'New Signups'
                    }
                  />
                )}
                {visibleMetrics.totalUsers && (
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                )}
                {visibleMetrics.newUsers && (
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNew)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
