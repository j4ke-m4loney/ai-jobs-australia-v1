import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface CreateBroadcastParams {
  subject: string;
  from: string;
  reply_to: string;
  html: string;
  audienceId?: string;
  segmentId?: string;
}

export interface BroadcastStats {
  id: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

/**
 * Create a broadcast campaign in Resend
 * @param params Broadcast parameters including subject, from, reply_to, html content, and audience ID
 * @returns Broadcast ID
 */
export async function createBroadcast(params: CreateBroadcastParams): Promise<{ id: string }> {
  try {
    // Build payload directly with the correct ID field
    type BroadcastPayload = {
      from: string;
      subject: string;
      reply_to: string;
      html: string;
      segment_id?: string;
      audience_id?: string;
      headers?: {
        'List-Unsubscribe': string;
        'List-Unsubscribe-Post': string;
      };
    };

    let broadcastPayload: BroadcastPayload;

    if (params.segmentId) {
      broadcastPayload = {
        from: params.from,
        subject: params.subject,
        reply_to: params.reply_to,
        html: params.html,
        segment_id: params.segmentId,
        headers: {
          'List-Unsubscribe': '<{{unsubscribe_url}}>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      };
    } else if (params.audienceId) {
      broadcastPayload = {
        from: params.from,
        subject: params.subject,
        reply_to: params.reply_to,
        html: params.html,
        audience_id: params.audienceId,
        headers: {
          'List-Unsubscribe': '<{{unsubscribe_url}}>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      };
    } else {
      throw new Error('Either audienceId or segmentId must be provided');
    }

    console.log('[Broadcast Service] DEBUG - Exact payload being sent to Resend:');
    console.log(JSON.stringify(broadcastPayload, null, 2));

    // Use direct fetch instead of SDK to match curl behavior
    const response = await fetch('https://api.resend.com/broadcasts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(broadcastPayload),
    });

    const result = await response.json();

    console.log('[Broadcast Service] DEBUG - Resend response:', result);

    if (!response.ok) {
      throw new Error(`Failed to create broadcast: ${result.message || JSON.stringify(result)}`);
    }

    if (!result?.id) {
      throw new Error('No broadcast ID returned from Resend');
    }

    console.log(`✅ Created broadcast: ${result.id}`);
    return { id: result.id };
  } catch (error) {
    console.error('Error creating broadcast:', error);
    throw error;
  }
}

/**
 * Send a broadcast campaign to the audience
 * @param broadcastId The Resend broadcast ID to send
 */
export async function sendBroadcast(broadcastId: string): Promise<void> {
  try {
    const { error } = await resend.broadcasts.send(broadcastId);

    if (error) {
      throw new Error(`Failed to send broadcast: ${error.message}`);
    }

    console.log(`✅ Sent broadcast: ${broadcastId}`);
  } catch (error) {
    console.error('Error sending broadcast:', error);
    throw error;
  }
}

/**
 * Get broadcast analytics and statistics
 * This can be used for future admin dashboard
 * @param broadcastId The Resend broadcast ID
 * @returns Broadcast statistics
 */
export async function getBroadcastStats(broadcastId: string): Promise<BroadcastStats> {
  try {
    const { data, error } = await resend.broadcasts.get(broadcastId);

    if (error) {
      throw new Error(`Failed to get broadcast stats: ${error.message}`);
    }

    if (!data) {
      throw new Error('No broadcast data returned from Resend');
    }

    // Extract stats from the response
    // Note: Actual response structure may vary - adjust based on Resend API
    const broadcastData = data as unknown as {
      id: string;
      sent?: number;
      delivered?: number;
      opened?: number;
      clicked?: number;
      bounced?: number;
      complained?: number;
    };

    return {
      id: broadcastData.id,
      sent: broadcastData.sent || 0,
      delivered: broadcastData.delivered || 0,
      opened: broadcastData.opened || 0,
      clicked: broadcastData.clicked || 0,
      bounced: broadcastData.bounced || 0,
      complained: broadcastData.complained || 0,
    };
  } catch (error) {
    console.error('Error getting broadcast stats:', error);
    throw error;
  }
}

/**
 * List all broadcasts
 * This can be used for admin dashboard to show campaign history
 */
export async function listBroadcasts(): Promise<unknown[]> {
  try {
    const { data, error } = await resend.broadcasts.list();

    if (error) {
      throw new Error(`Failed to list broadcasts: ${error.message}`);
    }

    return data?.data || [];
  } catch (error) {
    console.error('Error listing broadcasts:', error);
    throw error;
  }
}
