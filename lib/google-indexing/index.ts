import { google } from 'googleapis';

const SITE_URL = 'https://www.aijobsaustralia.com.au';

// Types for the Indexing API
type IndexingType = 'URL_UPDATED' | 'URL_DELETED';

interface IndexingResult {
  success: boolean;
  url: string;
  error?: string;
}

/**
 * Get authenticated Google Indexing API client
 * Requires GOOGLE_INDEXING_CREDENTIALS environment variable with service account JSON
 */
function getIndexingClient() {
  const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;

  if (!credentials) {
    throw new Error('GOOGLE_INDEXING_CREDENTIALS environment variable is not set');
  }

  let parsedCredentials;
  try {
    parsedCredentials = JSON.parse(credentials);
  } catch {
    throw new Error('GOOGLE_INDEXING_CREDENTIALS is not valid JSON');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  return google.indexing({ version: 'v3', auth });
}

/**
 * Request indexing for a single URL
 */
export async function requestIndexing(
  url: string,
  type: IndexingType = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    const indexing = getIndexingClient();

    await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    console.log(`[Google Indexing] Successfully requested ${type} for: ${url}`);
    return { success: true, url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Google Indexing] Failed to request ${type} for ${url}:`, errorMessage);
    return { success: false, url, error: errorMessage };
  }
}

/**
 * Request indexing for a job page by job ID
 */
export async function requestJobIndexing(jobId: string): Promise<IndexingResult> {
  const url = `${SITE_URL}/jobs/${jobId}`;
  return requestIndexing(url, 'URL_UPDATED');
}

/**
 * Request removal of a job page from the index (for expired/deleted jobs)
 */
export async function requestJobRemoval(jobId: string): Promise<IndexingResult> {
  const url = `${SITE_URL}/jobs/${jobId}`;
  return requestIndexing(url, 'URL_DELETED');
}

/**
 * Request indexing for multiple job pages
 * Note: Google Indexing API has a quota of 200 requests per day
 */
export async function requestBatchJobIndexing(
  jobIds: string[]
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  for (const jobId of jobIds) {
    const result = await requestJobIndexing(jobId);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Check if Google Indexing API is configured
 */
export function isIndexingConfigured(): boolean {
  return !!process.env.GOOGLE_INDEXING_CREDENTIALS;
}
