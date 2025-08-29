import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSavedJobs = () => {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch saved job IDs for the current user
  const fetchSavedJobs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const jobIds = new Set(data?.map(item => item.job_id) || []);
      setSavedJobIds(jobIds);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save a job
  const saveJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      return;
    }

    // Optimistic update
    setSavedJobIds(prev => new Set([...prev, jobId]));

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: user.id,
          job_id: jobId
        });

      if (error) throw error;
      toast.success('Job saved successfully');
    } catch (error: any) {
      // Revert optimistic update
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      if (error.code === '23505') {
        toast.error('Job is already saved');
      } else {
        toast.error('Failed to save job');
        console.error('Error saving job:', error);
      }
    }
  };

  // Unsave a job
  const unsaveJob = async (jobId: string) => {
    if (!user) return;

    // Optimistic update
    setSavedJobIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      return newSet;
    });

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) throw error;
      toast.success('Job removed from saved');
    } catch (error) {
      // Revert optimistic update
      setSavedJobIds(prev => new Set([...prev, jobId]));
      toast.error('Failed to remove job');
      console.error('Error removing saved job:', error);
    }
  };

  // Toggle save/unsave
  const toggleSaveJob = async (jobId: string) => {
    if (savedJobIds.has(jobId)) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  // Check if a job is saved
  const isJobSaved = (jobId: string) => savedJobIds.has(jobId);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  return {
    savedJobIds,
    loading,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    refetch: fetchSavedJobs
  };
};