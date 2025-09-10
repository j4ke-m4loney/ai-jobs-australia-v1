import { supabase } from "@/integrations/supabase/client";

/**
 * Manually apply storage policies for employer document access
 * This can be run from the browser console if needed
 */
export const applyStoragePolicies = async (): Promise<boolean> => {
  try {
    console.log("Applying storage policies...");

    // The policies need to be applied server-side via migrations
    // But we can check if they exist
    const { data, error } = await supabase.rpc('check_storage_policies');
    
    if (error) {
      console.error("Error checking policies:", error);
      return false;
    }

    console.log("Policies check result:", data);
    return true;
  } catch (error) {
    console.error("Error in applyStoragePolicies:", error);
    return false;
  }
};

/**
 * Debug function to list all files in storage buckets
 */
export const debugStorageContents = async (): Promise<void> => {
  try {
    console.log("=== Storage Debug ===");
    
    // List resumes bucket
    const { data: resumesData, error: resumesError } = await supabase.storage
      .from('resumes')
      .list('', { limit: 100 });
    
    if (resumesError) {
      console.error("Error listing resumes:", resumesError);
    } else {
      console.log("Resumes bucket contents:", resumesData);
    }

    // List cover-letters bucket  
    const { data: coverLettersData, error: coverLettersError } = await supabase.storage
      .from('cover-letters')
      .list('', { limit: 100 });

    if (coverLettersError) {
      console.error("Error listing cover letters:", coverLettersError);
    } else {
      console.log("Cover letters bucket contents:", coverLettersData);
    }
  } catch (error) {
    console.error("Error in debugStorageContents:", error);
  }
};

/**
 * Debug function to check current user's access to storage
 */
export const debugUserStorageAccess = async (): Promise<void> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("User not authenticated");
      return;
    }

    console.log("Current user:", user.id);

    // Try to access storage with current user
    const { data, error } = await supabase.storage
      .from('resumes')
      .list(user.id, { limit: 10 });

    if (error) {
      console.error("User storage access error:", error);
    } else {
      console.log("User's files in storage:", data);
    }
  } catch (error) {
    console.error("Error in debugUserStorageAccess:", error);
  }
};