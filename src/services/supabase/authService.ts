import { supabase } from '../../config/supabase';
import { User, Session } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// Types
interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role?: 'admin' | 'manager' | 'employee' | 'viewer';
}

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

// Security utilities
const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Auth service class
export class AuthService {
  private static instance: AuthService;
  private sessionKey = 'serrano-tex-session';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign in with email and password
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      // Update last login
      if (data.user) {
        await this.updateLastLogin(data.user.id);
      }

      // Store session securely if remember me is enabled
      if (credentials.rememberMe && data.session) {
        this.storeSecureSession(data.session);
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      return { user: null, session: null, error: 'Authentication failed' };
    }
  }

  // Sign up new user
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role || 'viewer',
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, userData);
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      return { user: null, session: null, error: 'Registration failed' };
    }
  }

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear stored session
      this.clearStoredSession();
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Sign out failed' };
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Refresh session
  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return { user: null, session: null, error: error.message };
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      return { user: null, session: null, error: 'Session refresh failed' };
    }
  }

  // Update user profile
  async updateProfile(updates: { full_name?: string; email?: string }): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Profile update failed' };
    }
  }

  // Change password
  async changePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Password change failed' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Password reset failed' };
    }
  }

  // Private methods
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  private async createUserProfile(user: User, userData: SignUpData): Promise<void> {
    try {
      await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: userData.fullName,
          role: userData.role || 'viewer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        });
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  }

  private storeSecureSession(session: Session): void {
    try {
      const encryptedSession = encryptData(JSON.stringify(session), this.sessionKey);
      localStorage.setItem('secure_session', encryptedSession);
    } catch (error) {
      console.error('Failed to store secure session:', error);
    }
  }

  private clearStoredSession(): void {
    try {
      localStorage.removeItem('secure_session');
    } catch (error) {
      console.error('Failed to clear stored session:', error);
    }
  }

  // Auth state listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();