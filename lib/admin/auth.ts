import { supabase } from "@/integrations/supabase/client";
import { redirect } from "next/navigation";

export interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.user_type === 'admin';
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const isAdmin = await checkIsAdmin(user.id);

    if (!isAdmin) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      isAdmin: true,
    };
  } catch (error) {
    console.error('Error getting current admin user:', error);
    return null;
  }
}

export async function requireAdmin() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    redirect('/');
  }

  return adminUser;
}

export async function getAdminStats() {
  try {
    // Use count queries to avoid Supabase's default 1000 row limit
    // First day of the current month in ISO format
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const [
      totalResult,
      pendingResult,
      approvedResult,
      rejectedResult,
      featuredResult,
      expiredResult,
      usersResult,
      paidFeaturedResult,
      paidStandardResult,
      companiesResult,
      jobsThisMonthResult,
      jobsLastMonthResult,
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'succeeded').eq('pricing_tier', 'featured'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'succeeded').eq('pricing_tier', 'standard'),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).gte('created_at', firstOfLastMonth).lt('created_at', firstOfMonth),
    ]);

    const stats = {
      total_jobs: totalResult.count || 0,
      pending_approval: pendingResult.count || 0,
      approved: approvedResult.count || 0,
      rejected: rejectedResult.count || 0,
      featured: featuredResult.count || 0,
      expired: expiredResult.count || 0,
      total_companies: companiesResult.count || 0,
      total_users: usersResult.count || 0,
      paid_featured_jobs: paidFeaturedResult.count || 0,
      paid_standard_jobs: paidStandardResult.count || 0,
      jobs_this_month: jobsThisMonthResult.count || 0,
      jobs_last_month: jobsLastMonthResult.count || 0,
    };

    return stats;
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return null;
  }
}

export async function updateJobStatus(
  jobIds: string[],
  status: 'pending_approval' | 'approved' | 'rejected' | 'expired' | 'paused',
  rejectionReason?: string
) {
  try {
    console.log('Attempting to update jobs:', jobIds, 'to status:', status);

    // Verify user is admin
    const isAdmin = await checkIsAdmin((await supabase.auth.getUser()).data.user?.id || '');
    if (!isAdmin) {
      console.error('User is not admin, cannot update jobs');
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // First, update just the status (this column definitely exists)
    const { data: statusData, error: statusError } = await supabase
      .from('jobs')
      .update({ status })
      .in('id', jobIds)
      .select();

    if (statusError) {
      console.error('Error updating job status:', statusError);
      return { success: false, error: statusError.message };
    }

    if (!statusData || statusData.length === 0) {
      console.error('No jobs were updated. This might be due to RLS policies.');
      console.log('Tried to update job IDs:', jobIds);
    }

    // Try to update additional fields if they exist (won't fail if columns don't exist)
    if (rejectionReason) {
      try {
        await supabase
          .from('jobs')
          .update({ rejection_reason: rejectionReason })
          .in('id', jobIds);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        console.log('rejection_reason column may not exist yet');
      }
    }

    // Try to update review metadata
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      await supabase
        .from('jobs')
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId
        })
        .in('id', jobIds);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      console.log('Review metadata columns may not exist yet');
    }

    console.log(`Successfully updated ${statusData?.length || 0} job(s) to status: ${status}`);

    // Note: Email sending is now handled by the API route /api/admin/jobs/[id]/status
    // This function only handles direct database updates for other use cases

    return { success: true, updatedCount: statusData?.length || 0 };
  } catch (error) {
    console.error('Error in updateJobStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function markJobAsDuplicate(
  duplicateJobId: string,
  originalJobId: string
) {
  try {
    // Mark job as duplicate directly instead of using RPC function
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'rejected',
        rejection_reason: `Duplicate of job: ${originalJobId}`,
        admin_notes: `Marked as duplicate of: ${originalJobId}`,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', duplicateJobId);

    if (error) {
      console.error('Error marking job as duplicate:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markJobAsDuplicate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function logAdminAction(
  actionType: 'approve_job' | 'reject_job' | 'delete_job' | 'update_job' | 'bulk_action',
  targetType: 'job' | 'user' | 'company',
  targetId: string,
  details: Record<string, unknown> = {}
) {
  try {
    // For now, just log to console since admin_actions table doesn't exist yet
    console.log('Admin action:', {
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    return null;
  }
}