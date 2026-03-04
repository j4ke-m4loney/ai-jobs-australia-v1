import { createHash } from 'crypto';

const MAX_CONTENT_LENGTH = 30000;

export interface CareerPageContent {
  text: string;
  hash: string;
}

/**
 * Fetch a career page via Jina Reader and return the text content + MD5 hash.
 * Returns null if the fetch fails (logs error rather than throwing).
 */
export async function fetchCareerPage(
  url: string
): Promise<CareerPageContent | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'text/plain',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `Failed to fetch career page ${url}: HTTP ${response.status}`
      );
      return null;
    }

    let text = await response.text();
    text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    if (text.length > MAX_CONTENT_LENGTH) {
      text = text.slice(0, MAX_CONTENT_LENGTH);
    }

    const hash = createHash('md5').update(text).digest('hex');

    return { text, hash };
  } catch (error) {
    console.error(`Error fetching career page ${url}:`, error);
    return null;
  }
}
