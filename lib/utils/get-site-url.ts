/**
 * Get the correct site URL based on environment
 * - Production: Uses NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_VERCEL_URL
 * - Development: Falls back to window.location.origin
 *
 * This ensures email confirmation links and OAuth redirects work correctly
 * in both local development and production environments
 */
export function getSiteUrl(): string {
  // Check for explicitly configured production URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Check for Vercel's automatic URL (production deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Fall back to current browser origin (for localhost development)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Default fallback for server-side rendering
  return 'http://localhost:3000';
}