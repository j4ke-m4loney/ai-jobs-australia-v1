/**
 * Provider-agnostic authentication types
 * These interfaces allow us to swap auth providers without changing app logic
 */

export interface AuthUser {
  id: string;
  email: string | null;
  metadata: {
    firstName?: string;
    userType?: 'job_seeker' | 'employer';
    [key: string]: string | number | boolean | undefined; // Allow provider-specific metadata
  };
  // Legacy support for existing code - will be removed in future
  user_metadata?: {
    first_name?: string;
    user_type?: 'job_seeker' | 'employer';
    [key: string]: string | number | boolean | undefined;
  };
  createdAt?: string;
  lastSignInAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthResult {
  user?: AuthUser | null;
  session?: AuthSession | null;
  error?: AuthError | null;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    firstName?: string;
    userType?: 'job_seeker' | 'employer';
    [key: string]: string | number | boolean | undefined;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export type AuthStateChangeCallback = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED',
  session: AuthSession | null
) => void;

export type UnsubscribeFunction = () => void;

/**
 * Main authentication service interface
 * All auth providers must implement this interface
 */
export interface AuthService {
  // Core authentication methods
  signUp(data: SignUpData): Promise<AuthResult>;
  signIn(data: SignInData): Promise<AuthResult>;
  signOut(): Promise<{ error?: AuthError | null }>;
  
  // Session management
  getCurrentUser(): Promise<AuthUser | null>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthResult>;
  
  // State management
  onAuthStateChange(callback: AuthStateChangeCallback): UnsubscribeFunction;
  
  // Password management
  resetPassword?(email: string): Promise<{ error?: AuthError | null }>;
  updatePassword?(newPassword: string): Promise<{ error?: AuthError | null }>;
  
  // User management
  updateUser?(updates: { data?: { user_metadata?: Record<string, string | number | boolean | undefined>; email?: string } }): Promise<{ data?: { user: AuthUser } | null; error?: AuthError | null }>;
  
  // Provider-specific features (optional)
  signInWithOAuth?(
    provider: string,
    options?: { options?: { skipBrowserRedirect?: boolean; redirectTo?: string; userType?: "job_seeker" | "employer" } }
  ): Promise<AuthResult & { url?: string }>;
  signInWithMagicLink?(email: string): Promise<{ error?: AuthError | null }>;
  
  // Get the raw provider client (escape hatch for provider-specific features)
  getRawClient?(): unknown;
}