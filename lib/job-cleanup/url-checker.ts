import * as cheerio from 'cheerio';
import { detectExpiredIndicators, HTTP_ERROR_CODES } from './expired-patterns';

export interface CheckResult {
  method: 'http' | 'html_scan' | 'error';
  decision: 'keep_active' | 'mark_expired' | 'needs_review';
  statusCode?: number;
  evidence?: string[];
  errorMessage?: string;
  responseTimeMs: number;
}

export async function checkJobUrl(
  url: string,
  attemptHtmlScan = true
): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    // Step 1: Basic HTTP check with HEAD request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'AI Jobs Australia Bot/1.0 (Job Validation)',
        },
      });
      clearTimeout(timeoutId);
    } catch {
      // Some servers don't support HEAD, try GET
      const getTimeoutId = setTimeout(() => controller.abort(), 15000);
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'AI Jobs Australia Bot/1.0 (Job Validation)',
        },
      });
      clearTimeout(getTimeoutId);
    }

    const responseTimeMs = Date.now() - startTime;

    // Check HTTP status codes
    if (HTTP_ERROR_CODES.DEFINITELY_EXPIRED.includes(response.status)) {
      return {
        method: 'http',
        decision: 'mark_expired',
        statusCode: response.status,
        evidence: [`HTTP ${response.status}`],
        responseTimeMs,
      };
    }

    if (HTTP_ERROR_CODES.PROBABLY_EXPIRED.includes(response.status)) {
      return {
        method: 'http',
        decision: 'needs_review',
        statusCode: response.status,
        evidence: [`HTTP ${response.status} - uncertain`],
        responseTimeMs,
      };
    }

    if (HTTP_ERROR_CODES.TEMPORARY_ISSUE.includes(response.status)) {
      return {
        method: 'http',
        decision: 'needs_review',
        statusCode: response.status,
        evidence: [`HTTP ${response.status} - temporary issue`],
        responseTimeMs,
      };
    }

    // Step 2: If status is OK and HTML scan requested, fetch content
    if (attemptHtmlScan && response.ok) {
      // Fetch HTML content if not already fetched
      let html: string;
      if (response.headers.get('content-type')?.includes('text/html')) {
        // Try to get HTML from response body if available
        try {
          html = await response.text();
        } catch {
          // If HEAD request was used, make a new GET request
          const htmlResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'AI Jobs Australia Bot/1.0 (Job Validation)',
            },
          });
          html = await htmlResponse.text();
        }
      } else {
        // Not HTML, make a GET request
        const htmlResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'AI Jobs Australia Bot/1.0 (Job Validation)',
          },
        });
        html = await htmlResponse.text();
      }

      // Extract text content using cheerio
      const $ = cheerio.load(html);

      // Remove script, style, and other non-content elements
      $('script, style, nav, header, footer, iframe').remove();

      // Get main text content
      const textContent = $('body').text();

      // Check for expired indicators
      const detection = detectExpiredIndicators(textContent);

      if (detection.shouldExpire) {
        return {
          method: 'html_scan',
          decision: 'mark_expired',
          statusCode: response.status,
          evidence: detection.found.map(p => p.phrase),
          responseTimeMs: Date.now() - startTime,
        };
      }

      if (detection.shouldReview) {
        return {
          method: 'html_scan',
          decision: 'needs_review',
          statusCode: response.status,
          evidence: detection.found.map(
            p => `${p.phrase} (${p.confidence} confidence)`
          ),
          responseTimeMs: Date.now() - startTime,
        };
      }

      // No expired indicators found, keep active
      return {
        method: 'html_scan',
        decision: 'keep_active',
        statusCode: response.status,
        responseTimeMs: Date.now() - startTime,
      };
    }

    // HTTP OK, no HTML scan performed
    return {
      method: 'http',
      decision: 'keep_active',
      statusCode: response.status,
      responseTimeMs,
    };
  } catch (error) {
    // Network errors, timeouts, etc.
    return {
      method: 'error',
      decision: 'needs_review', // Don't auto-expire on errors
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      responseTimeMs: Date.now() - startTime,
    };
  }
}
