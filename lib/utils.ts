import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Appends UTM tracking parameters to an application URL
 * Removes any existing UTM params to prevent duplicates
 * @param url - The application URL
 * @param jobId - Optional job ID to include in tracking
 * @param isFeatured - Whether this is a featured job listing
 */
export function appendUtmParams(url: string, jobId?: string, isFeatured?: boolean): string {
  if (!url) return url;

  try {
    const urlObj = new URL(url);

    // Remove any existing UTM parameters to prevent duplicates
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    utmKeys.forEach(key => urlObj.searchParams.delete(key));

    // Add clean UTM parameters
    urlObj.searchParams.set('utm_source', 'ai_jobs_australia');
    urlObj.searchParams.set('utm_medium', 'job_board');
    urlObj.searchParams.set('utm_campaign', isFeatured ? 'featured_job' : 'job_post');

    if (jobId) {
      urlObj.searchParams.set('utm_content', jobId);
    }

    return urlObj.toString();
  } catch {
    // Fallback for invalid URLs - just append params
    // Strip existing UTM params using regex
    let cleanUrl = url.replace(/[?&]utm_[^&=]+=[^&]*/gi, '');
    // Clean up any leftover ? or & at the end
    cleanUrl = cleanUrl.replace(/[?&]$/, '');

    const utmParams = new URLSearchParams();
    utmParams.set('utm_source', 'ai_jobs_australia');
    utmParams.set('utm_medium', 'job_board');
    utmParams.set('utm_campaign', isFeatured ? 'featured_job' : 'job_post');
    if (jobId) {
      utmParams.set('utm_content', jobId);
    }

    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}${utmParams.toString()}`;
  }
}
