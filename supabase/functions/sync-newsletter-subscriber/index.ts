// Supabase Edge Function to sync new newsletter subscribers to Resend Audience
// Triggered by Database Webhook when a new profile is created

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    user_id: string;
    email: string;
    first_name: string | null;
    newsletter_subscribed: boolean;
  };
  old_record?: {
    user_id: string;
    email: string;
    first_name: string | null;
    newsletter_subscribed: boolean;
  };
}

serve(async (req) => {
  try {
    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const RESEND_AUDIENCE_ID = Deno.env.get('RESEND_AUDIENCE_ID');

    if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY or RESEND_AUDIENCE_ID' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    console.log('Received webhook:', payload.type, payload.table);

    const { record, old_record } = payload;

    // Only process if user is subscribed and has an email
    if (!record.newsletter_subscribed || !record.email) {
      console.log('Skipping: User not subscribed or no email');
      return new Response(
        JSON.stringify({ success: true, message: 'User not subscribed or no email' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle INSERT (new subscriber)
    if (payload.type === 'INSERT') {
      console.log(`Syncing new subscriber to Resend: ${record.email}`);

      const response = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            email: record.email,
            firstName: record.first_name || '',
            unsubscribed: false,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If contact already exists, that's fine
        if (data.message && data.message.includes('already exists')) {
          console.log(`Contact already exists: ${record.email}`);
          return new Response(
            JSON.stringify({ success: true, message: 'Contact already exists' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.error('Resend API error:', data);
        throw new Error(`Resend API error: ${JSON.stringify(data)}`);
      }

      console.log(`Successfully synced: ${record.email}`);
      return new Response(
        JSON.stringify({ success: true, contact_id: data.id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle UPDATE (resubscribe)
    if (payload.type === 'UPDATE') {
      // Only sync if user changed from unsubscribed to subscribed
      if (old_record && !old_record.newsletter_subscribed && record.newsletter_subscribed) {
        console.log(`Re-syncing subscriber to Resend: ${record.email}`);

        const response = await fetch(
          `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              email: record.email,
              firstName: record.first_name || '',
              unsubscribed: false,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok && !data.message?.includes('already exists')) {
          console.error('Resend API error:', data);
          throw new Error(`Resend API error: ${JSON.stringify(data)}`);
        }

        console.log(`Successfully re-synced: ${record.email}`);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('Skipping UPDATE: Not a resubscribe event');
      return new Response(
        JSON.stringify({ success: true, message: 'Not a resubscribe event' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Event type not handled' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-newsletter-subscriber:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
