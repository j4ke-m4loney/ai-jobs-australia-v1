import { Resend } from 'resend';
import { supabase } from '@/integrations/supabase/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface Contact {
  email: string;
  first_name?: string;
  unsubscribed?: boolean;
}

export interface SyncResult {
  success: boolean;
  audienceId?: string;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Create the main newsletter audience in Resend
 * This should be run once during initial setup
 */
export async function createNewsletterAudience(name: string = 'AI Jobs Australia Newsletter'): Promise<string> {
  try {
    const { data, error } = await resend.audiences.create({ name });

    if (error) {
      throw new Error(`Failed to create audience: ${error.message}`);
    }

    if (!data?.id) {
      throw new Error('No audience ID returned from Resend');
    }

    console.log(`✅ Created Resend audience: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error('Error creating audience:', error);
    throw error;
  }
}

/**
 * Sync all subscribed users from local database to Resend audience
 * @param audienceId The Resend audience ID to sync to
 */
export async function syncSubscribersToAudience(audienceId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    audienceId,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    // Fetch all subscribed users from profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('newsletter_subscribed', true)
      .not('email', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch subscribers: ${fetchError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('No subscribers to sync');
      result.success = true;
      return result;
    }

    console.log(`Found ${profiles.length} subscribers to sync`);

    // Add contacts one by one with rate limiting
    // Resend allows 2 requests per second, so we add 500ms delay between each
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];

      try {
        await addContactToAudience(audienceId, {
          email: profile.email!,
          first_name: profile.first_name || undefined,
          unsubscribed: false,
        });
        result.syncedCount++;

        // Log progress every 10 contacts
        if ((i + 1) % 10 === 0) {
          console.log(`Synced ${i + 1} / ${profiles.length} contacts...`);
        }
      } catch (error) {
        result.failedCount++;
        result.errors.push({
          email: profile.email!,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limiting: 500ms delay between requests (2 requests per second)
      if (i < profiles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    result.success = result.failedCount === 0;
    console.log(`✅ Sync complete: ${result.syncedCount} synced, ${result.failedCount} failed`);

    return result;
  } catch (error) {
    console.error('Error syncing subscribers:', error);
    throw error;
  }
}

/**
 * Add a single contact to the Resend audience
 * @param audienceId The Resend audience ID
 * @param contact Contact information to add
 */
export async function addContactToAudience(audienceId: string, contact: Contact): Promise<void> {
  try {
    // Resend contacts.create expects: audienceId, email, firstName (optional), unsubscribed (optional)
    const contactData: {
      audienceId: string;
      email: string;
      firstName?: string;
      unsubscribed?: boolean;
    } = {
      audienceId: audienceId,
      email: contact.email,
    };

    // Only add optional fields if they have values
    if (contact.first_name) {
      contactData.firstName = contact.first_name;
    }

    if (contact.unsubscribed !== undefined) {
      contactData.unsubscribed = contact.unsubscribed;
    }

    const { error } = await resend.contacts.create(contactData);

    if (error) {
      throw new Error(`Failed to add contact ${contact.email}: ${error.message}`);
    }
  } catch (error) {
    // If contact already exists, ignore the error
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log(`Contact ${contact.email} already exists in audience`);
      return;
    }
    throw error;
  }
}

/**
 * Remove a contact from the Resend audience (marks as unsubscribed)
 * @param audienceId The Resend audience ID
 * @param email Email address to remove
 */
export async function removeContactFromAudience(audienceId: string, email: string): Promise<void> {
  try {
    // First, get the contact by email
    const { data: contact, error: getError } = await resend.contacts.list({
      audienceId: audienceId,
    });

    if (getError) {
      throw new Error(`Failed to find contact ${email}: ${getError.message}`);
    }

    // Find the contact with matching email
    const targetContact = contact?.data?.find((c) => c.email === email);

    if (!targetContact) {
      console.log(`Contact ${email} not found in audience`);
      return;
    }

    // Update contact to mark as unsubscribed
    const { error: updateError } = await resend.contacts.update({
      audienceId: audienceId,
      id: targetContact.id,
      unsubscribed: true,
    });

    if (updateError) {
      throw new Error(`Failed to unsubscribe contact ${email}: ${updateError.message}`);
    }

    console.log(`✅ Contact ${email} marked as unsubscribed`);
  } catch (error) {
    console.error(`Error removing contact from audience:`, error);
    throw error;
  }
}

/**
 * Full two-way sync between local database and Resend
 * This ensures both systems are in sync
 */
export async function fullSync(audienceId: string): Promise<SyncResult> {
  console.log('Starting full sync between local DB and Resend...');

  // For now, we'll do a one-way sync from local DB to Resend
  // Future enhancement: Also sync unsubscribes from Resend back to local DB
  const result = await syncSubscribersToAudience(audienceId);

  console.log('Full sync complete');
  return result;
}

/**
 * Get the current subscriber count from local database
 */
export async function getSubscriberCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('newsletter_subscribed', true);

  if (error) {
    console.error('Error getting subscriber count:', error);
    return 0;
  }

  return count || 0;
}
