import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { isIndexingConfigured } from '@/lib/google-indexing';

/**
 * GET /api/indexing/test
 * Test that Google Indexing API credentials are configured correctly
 */
export async function GET() {
  // Check if credentials are set
  if (!isIndexingConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'GOOGLE_INDEXING_CREDENTIALS environment variable is not set',
    }, { status: 503 });
  }

  try {
    // Parse credentials
    const credentials = JSON.parse(process.env.GOOGLE_INDEXING_CREDENTIALS!);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    // Test authentication by getting an access token
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    return NextResponse.json({
      success: true,
      message: 'Google Indexing API credentials are valid',
      serviceAccountEmail: credentials.client_email,
      projectId: credentials.project_id,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      error: 'Failed to authenticate with Google Indexing API',
      details: errorMessage,
    }, { status: 500 });
  }
}
