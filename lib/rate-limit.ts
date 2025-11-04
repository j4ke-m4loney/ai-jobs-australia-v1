// Rate limiting utility to prevent spam and abuse
// In production, consider using Redis or a database for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Key: IP address, Value: submission count and reset time
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000); // 10 minutes

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Usually IP address
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or time window has passed, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get IP address from request headers
 * Supports various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(headers: Headers): string {
  // Check various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default (shouldn't happen in production)
  return 'unknown';
}
