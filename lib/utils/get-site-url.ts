/**
 * Get the correct site URL based on environment
 * - Development: Always uses localhost:3000
 * - Production: Uses NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_VERCEL_URL
 *
 * This ensures email confirmation links and OAuth redirects work correctly
 * in both local development and production environments
 */
export function getSiteUrl(): string {
  // In development, always use localhost (prioritize over env vars)
  if (process.env.NODE_ENV === 'development') {
    // Use window.location.origin if in browser, otherwise localhost:3000
    return typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';
  }

  // Production: Check for explicitly configured production URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Check for Vercel's automatic URL (production deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Final fallback
  return typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';
}