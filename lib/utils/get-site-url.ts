/**
 * Get the correct site URL based on environment.
 *
 * - If NEXT_PUBLIC_SITE_URL is set, it is ALWAYS used — even in development.
 *   This ensures outbound emails and webhooks never contain localhost URLs.
 * - In the browser during development (no NEXT_PUBLIC_SITE_URL), falls back
 *   to window.location.origin so local navigation still works.
 */
export function getSiteUrl(): string {
  // Always prefer the explicitly configured production URL.
  // This prevents localhost URLs leaking into emails sent from local dev.
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Check for Vercel's automatic URL (production deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Fallback: browser origin or localhost
  return typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';
}