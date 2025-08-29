import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  jobViews: number;
  responseRate: number;
  averageTimeToHire: number;
  conversionRate: number;
}

export interface ApplicationTrend {
  date: string;
  applications: number;
  views: number;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<ApplicationTrend[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false to show mock data immediately
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // For now, return mock data to demonstrate the dashboard
    const mockAnalyticsData: AnalyticsData = {
      totalJobs: 15,
      activeJobs: 8,
      totalApplications: 247,
      newApplications: 23,
      jobViews: 1542,
      responseRate: 16.0,
      averageTimeToHire: 12,
      conversionRate: 16.0
    };

    // Generate realistic trend data for the last 30 days
    const mockTrendData: ApplicationTrend[] = [];
    const baseDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(baseDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Create realistic fluctuating data
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Lower activity on weekends
      const baseApplications = isWeekend ? 2 : 8;
      const baseViews = isWeekend ? 15 : 50;
      
      // Add some randomness
      const applications = Math.floor(baseApplications + Math.random() * 8);
      const views = Math.floor(baseViews + Math.random() * 30);

      mockTrendData.push({
        date: dateStr,
        applications,
        views
      });
    }

    setData(mockAnalyticsData);
    setTrends(mockTrendData);
    setError(null);
    setLoading(false);

    // TODO: Replace with real Supabase queries when ready
    /*
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch job statistics
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, status, created_at')
          .eq('employer_id', user.id);

        if (jobsError) throw jobsError;

        // ... rest of real analytics code
        
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    */
  }, [user]);

  const trackJobView = async (jobId: string) => {
    try {
      await supabase
        .from('job_views')
        .insert({
          job_id: jobId,
          user_id: user?.id,
          viewer_ip: null, // Could be populated on backend
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
    } catch (err) {
      console.error('Error tracking job view:', err);
    }
  };

  const trackApplicationEvent = async (applicationId: string, eventType: string, metadata?: any) => {
    try {
      await supabase
        .from('application_events')
        .insert({
          application_id: applicationId,
          event_type: eventType,
          metadata: metadata || {}
        });
    } catch (err) {
      console.error('Error tracking application event:', err);
    }
  };

  return {
    data,
    trends,
    loading,
    error,
    trackJobView,
    trackApplicationEvent
  };
}