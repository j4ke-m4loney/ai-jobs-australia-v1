import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type {
  AuthService,
  AuthUser,
  AuthSession,
  AuthResult,
  AuthError,
  SignUpData,
  SignInData,
  AuthStateChangeCallback,
  UnsubscribeFunction,
} from '@/types/auth.types';

/**
 * Supabase adapter that implements the AuthService interface
 * Translates Supabase-specific API to our provider-agnostic interface
 */
export class SupabaseAuthAdapter implements AuthService {
  /**
   * Convert Supabase User to our AuthUser type
   */
  private mapUser(user: User | null): AuthUser | null {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email ?? null,
      metadata: {
        firstName: user.user_metadata?.first_name,
        userType: user.user_metadata?.user_type,
        ...user.user_metadata,
      },
      // Legacy support - duplicate metadata for backward compatibility
      user_metadata: user.user_metadata,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
    };
  }

  /**
   * Convert Supabase Session to our AuthSession type
   */
  private mapSession(session: Session | null): AuthSession | null {
    if (!session) return null;
    
    const user = this.mapUser(session.user);
    if (!user) return null;
    
    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
    };
  }

  /**
   * Convert Supabase error to our AuthError type
   */
  private mapError(error: unknown): AuthError | null {
    if (!error) return null;

    const errorObj = error as { message?: string; code?: string; status?: number };
    return {
      message: errorObj.message || 'An error occurred',
      code: errorObj.code,
      status: errorObj.status,
    };
  }

  async signUp(data: SignUpData): Promise<AuthResult> {
    const userType = data.metadata?.userType || 'job_seeker';
    const redirectUrl = `${window.location.origin}/auth/confirm?userType=${userType}`;

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: data.metadata?.firstName,
          user_type: data.metadata?.userType,
          ...data.metadata,
        },
      },
    });

    // Enhanced error handling for duplicate email with different user type
    if (error && error.message?.includes('User already registered')) {
      // Check if user exists with different user type
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      // If we can't determine the existing user type, check by email in auth.users
      // Note: This requires a server-side function or RPC call for security
      // For now, we'll provide a more helpful generic message

      const attemptedType = data.metadata?.userType || 'job_seeker';
      const alternateType = attemptedType === 'employer' ? 'job seeker' : 'employer';

      return {
        user: null,
        session: null,
        error: {
          message: `This email is already registered. If you have an existing ${alternateType} account, please sign in as a ${alternateType}. Otherwise, use a different email for your ${attemptedType === 'employer' ? 'employer' : 'job seeker'} account.`,
          code: 'EMAIL_EXISTS_DIFFERENT_TYPE',
          status: 409,
        },
      };
    }

    return {
      user: this.mapUser(authData?.user ?? null),
      session: this.mapSession(authData?.session ?? null),
      error: this.mapError(error),
    };
  }

  async signIn(data: SignInData): Promise<AuthResult> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return {
      user: this.mapUser(authData?.user ?? null),
      session: this.mapSession(authData?.session ?? null),
      error: this.mapError(error),
    };
  }

  async signOut(): Promise<{ error?: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: this.mapError(error) };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return this.mapUser(user);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return this.mapSession(session);
  }

  async refreshSession(): Promise<AuthResult> {
    const { data, error } = await supabase.auth.refreshSession();
    
    return {
      user: this.mapUser(data?.user ?? null),
      session: this.mapSession(data?.session ?? null),
      error: this.mapError(error),
    };
  }

  onAuthStateChange(callback: AuthStateChangeCallback): UnsubscribeFunction {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Map Supabase events to our generic events
        let mappedEvent: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
        
        switch (event) {
          case 'SIGNED_IN':
            mappedEvent = 'SIGNED_IN';
            break;
          case 'SIGNED_OUT':
            mappedEvent = 'SIGNED_OUT';
            break;
          case 'TOKEN_REFRESHED':
            mappedEvent = 'TOKEN_REFRESHED';
            break;
          case 'USER_UPDATED':
            mappedEvent = 'USER_UPDATED';
            break;
          default:
            // For other events, default to USER_UPDATED
            mappedEvent = 'USER_UPDATED';
        }
        
        callback(mappedEvent, this.mapSession(session));
      }
    );

    return () => subscription.unsubscribe();
  }

  async resetPassword(email: string): Promise<{ error?: AuthError | null }> {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error: this.mapError(error) };
  }

  async updatePassword(newPassword: string): Promise<{ error?: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    return { error: this.mapError(error) };
  }

  async updateUser(updates: { data?: { user_metadata?: Record<string, unknown>; email?: string } }): Promise<{ data?: { user: AuthUser } | null; error?: AuthError | null }> {
    const { data, error } = await supabase.auth.updateUser({
      email: updates.data?.email,
      data: updates.data?.user_metadata,
    });
    
    return {
      data: data?.user ? { user: this.mapUser(data.user) } : null,
      error: this.mapError(error),
    };
  }

  async signInWithOAuth(provider: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'google' | 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // OAuth doesn't immediately return user/session (redirect flow)
    return {
      user: null,
      session: null,
      error: this.mapError(error),
    };
  }

  async signInWithMagicLink(email: string): Promise<{ error?: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    return { error: this.mapError(error) };
  }

  /**
   * Get the raw Supabase client
   * Use this escape hatch only when you need Supabase-specific features
   */
  getRawClient() {
    return supabase;
  }
}