/**
 * OAuth State Storage
 *
 * Stores temporary state for OAuth flows that survives redirects.
 * Uses in-memory Map for development. For production, use Redis/Vercel KV.
 */

interface OAuthState {
  userType: 'job_seeker' | 'employer';
  createdAt: number;
}

// In-memory storage (for development)
// TODO: Replace with Redis/Vercel KV for production
const stateStore = new Map<string, OAuthState>();

// Clean up expired states (older than 10 minutes)
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function cleanupExpiredStates() {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.createdAt > EXPIRY_MS) {
      stateStore.delete(key);
      console.log('🗑️  [OAUTH-STATE] Cleaned up expired state:', key);
    }
  }
}

/**
 * Generate a random state ID and store the user type
 */
export function createOAuthState(userType: 'job_seeker' | 'employer'): string {
  // Clean up old states first
  cleanupExpiredStates();

  // Generate random state ID
  const stateId = crypto.randomUUID();

  // Store user type
  stateStore.set(stateId, {
    userType,
    createdAt: Date.now(),
  });

  console.log('💾 [OAUTH-STATE] Created state:', {
    stateId,
    userType,
    totalStates: stateStore.size,
  });

  return stateId;
}

/**
 * Retrieve and remove the user type for a given state ID
 */
export function consumeOAuthState(stateId: string): 'job_seeker' | 'employer' | null {
  const state = stateStore.get(stateId);

  if (!state) {
    console.warn('⚠️  [OAUTH-STATE] State not found:', stateId);
    return null;
  }

  // Check if expired
  if (Date.now() - state.createdAt > EXPIRY_MS) {
    stateStore.delete(stateId);
    console.warn('⚠️  [OAUTH-STATE] State expired:', stateId);
    return null;
  }

  // Consume (delete) the state - one-time use
  stateStore.delete(stateId);

  console.log('✅ [OAUTH-STATE] Consumed state:', {
    stateId,
    userType: state.userType,
    age: Date.now() - state.createdAt,
  });

  return state.userType;
}

/**
 * Get current state count (for debugging)
 */
export function getStateCount(): number {
  cleanupExpiredStates();
  return stateStore.size;
}
