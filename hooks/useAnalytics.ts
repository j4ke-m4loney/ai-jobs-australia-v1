import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  recentApplications: Array<{
    id: string;
    applicantName: string;
    jobTitle: string;
    appliedAt: string;
    status: string;
  }>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch job statistics
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, status, title')
          .eq('employer_id', user.id);

        if (jobsError) throw jobsError;

        const totalJobs = jobs?.length || 0;
        const activeJobs = jobs?.filter(job => job.status === 'approved').length || 0;

        // Get all job IDs for this employer
        const jobIds = jobs?.map(job => job.id) || [];

        // Initialize analytics data
        const analyticsData: AnalyticsData = {
          totalJobs,
          activeJobs,
          totalApplications: 0,
          pendingApplications: 0,
          reviewedApplications: 0,
          recentApplications: []
        };

        if (jobIds.length > 0) {
          // Fetch applications for employer's jobs
          const { data: applications, error: appsError } = await supabase
            .from('job_applications')
            .select(`
              id,
              status,
              created_at,
              job_id,
              applicant_id
            `)
            .in('job_id', jobIds)
            .order('created_at', { ascending: false });

          if (appsError) throw appsError;

          // Get applicant profiles for recent applications
          const recentApps = applications?.slice(0, 5) || [];
          const applicantIds = [...new Set(recentApps.map(app => app.applicant_id))];
          
          const profilesMap = new Map();
          if (applicantIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, first_name, last_name')
              .in('user_id', applicantIds);
            
            profiles?.forEach(profile => {
              profilesMap.set(profile.user_id, profile);
            });
          }

          // Create jobs map for quick lookup
          const jobsMap = new Map();
          jobs?.forEach(job => {
            jobsMap.set(job.id, job);
          });

          // Calculate application metrics
          analyticsData.totalApplications = applications?.length || 0;
          analyticsData.pendingApplications = applications?.filter(app => app.status === 'pending').length || 0;
          analyticsData.reviewedApplications = applications?.filter(app => 
            app.status === 'reviewed' || app.status === 'shortlisted' || app.status === 'rejected'
          ).length || 0;

          // Format recent applications
          analyticsData.recentApplications = recentApps.map(app => {
            const profile = profilesMap.get(app.applicant_id);
            const job = jobsMap.get(app.job_id);
            return {
              id: app.id,
              applicantName: profile 
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Applicant'
                : 'Unknown Applicant',
              jobTitle: job?.title || 'Unknown Position',
              appliedAt: app.created_at,
              status: app.status || 'pending'
            };
          });

          // Generate simple trend data for last 7 days
          const trendData: ApplicationTrend[] = [];
          const today = new Date();
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Count applications for this date
            const dayApplications = applications?.filter(app => {
              const appDate = new Date(app.created_at).toISOString().split('T')[0];
              return appDate === dateStr;
            }).length || 0;

            trendData.push({
              date: dateStr,
              applications: dayApplications,
              views: 0 // We'll implement views tracking later
            });
          }

          setTrends(trendData);
        }

        setData(analyticsData);
        
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
        // Set default data on error
        setData({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          pendingApplications: 0,
          reviewedApplications: 0,
          recentApplications: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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

  const trackApplicationEvent = async (applicationId: string, eventType: string, metadata?: Record<string, string | number | boolean | null | undefined>) => {
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