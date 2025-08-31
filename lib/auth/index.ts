import { AuthService } from '@/types/auth.types';
import { SupabaseAuthAdapter } from './supabase-adapter';

// Future: Import other adapters as needed
// import { ClerkAuthAdapter } from './clerk-adapter';
// import { Auth0Adapter } from './auth0-adapter';

export type AuthProvider = 'supabase' | 'clerk' | 'auth0' | 'firebase';

/**
 * Factory function to create the appropriate auth service
 * based on environment configuration
 */
export function createAuthService(): AuthService {
  // Get the auth provider from environment variable
  // Default to Supabase if not specified
  const provider = (process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase') as AuthProvider;
  
  switch (provider) {
    case 'supabase':
      return new SupabaseAuthAdapter();
    
    // Future providers
    // case 'clerk':
    //   return new ClerkAuthAdapter();
    // case 'auth0':
    //   return new Auth0Adapter();
    // case 'firebase':
    //   return new FirebaseAuthAdapter();
    
    default:
      throw new Error(`Unsupported auth provider: ${provider}`);
  }
}

// Create a singleton instance
let authServiceInstance: AuthService | null = null;

/**
 * Get the singleton auth service instance
 * This ensures we only create one instance of the auth service
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = createAuthService();
  }
  return authServiceInstance;
}

// Export the type for use in components
export type { AuthService } from '@/types/auth.types';