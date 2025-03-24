import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthSession, InviteLink, AuthError, UserSettings } from '../types/auth';
import { logAuth, logError, logUser } from './logStore';

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  pendingInvites: InviteLink[];
  
  // Authentication
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  
  // Team management
  inviteUser: (email: string, role: User['role']) => Promise<void>;
  acceptInvite: (inviteId: string, password: string) => Promise<void>;
  revokeInvite: (inviteId: string) => Promise<void>;
}

// Mock functions - these will be replaced with Supabase implementations
const mockAuth = {
  async signIn(email: string, password: string): Promise<AuthSession> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@demo.com' && password === '1234') {
      return {
        user: {
          id: 'mock-user-id',
          email,
          fullName: 'Demo User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          settings: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              desktop: true,
            },
          },
        },
        accessToken: 'mock-token',
        expiresAt: Date.now() + 3600000, // 1 hour
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  async signUp(email: string, password: string, fullName: string): Promise<AuthSession> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        id: crypto.randomUUID(),
        email,
        fullName,
        role: 'member',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock-token',
      expiresAt: Date.now() + 3600000,
    };
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      loading: false,
      error: null,
      pendingInvites: [],
      
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const session = await mockAuth.signIn(email, password);
          set({ session, loading: false });
          logAuth('User signed in', { userId: session.user?.id });
        } catch (error) {
          logError('auth', 'Sign in failed', error as Error);
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to sign in',
            },
            loading: false,
          });
        }
      },
      
      signUp: async (email, password, fullName) => {
        set({ loading: true, error: null });
        try {
          const session = await mockAuth.signUp(email, password, fullName);
          set({ session, loading: false });
          logAuth('User signed up', { userId: session.user?.id });
        } catch (error) {
          logError('auth', 'Sign up failed', error as Error);
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to sign up',
            },
            loading: false,
          });
        }
      },
      
      signOut: async () => {
        set({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const userId = get().session?.user?.id;
        set({ session: null, loading: false });
        if (userId) {
          logAuth('User signed out', { userId });
        }
      },
      
      resetPassword: async (email) => {
        set({ loading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ loading: false });
        logAuth('Password reset requested', { email });
      },
      
      updatePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ loading: false });
        logUser('Password updated', { userId: get().session?.user?.id });
      },
      
      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No user logged in');
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            session: {
              ...session,
              user: {
                ...session.user,
                ...data,
              },
            },
            loading: false,
          });
          logUser('Profile updated', { userId: session.user.id, updates: Object.keys(data) });
        } catch (error) {
          logError('user', 'Profile update failed', error as Error);
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to update profile',
            },
            loading: false,
          });
        }
      },
      
      updateSettings: async (settings) => {
        set({ loading: true, error: null });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No user logged in');
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            session: {
              ...session,
              user: {
                ...session.user,
                settings: {
                  ...session.user.settings,
                  ...settings,
                },
              },
            },
            loading: false,
          });
          logUser('Settings updated', { userId: session.user.id, updates: Object.keys(settings) });
        } catch (error) {
          logError('user', 'Settings update failed', error as Error);
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to update settings',
            },
            loading: false,
          });
        }
      },
      
      uploadAvatar: async (file) => {
        set({ loading: true, error: null });
        try {
          const { session } = get();
          if (!session?.user) throw new Error('No user logged in');
          
          // Simulate file upload
          await new Promise(resolve => setTimeout(resolve, 2000));
          const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`;
          
          set({
            session: {
              ...session,
              user: {
                ...session.user,
                avatarUrl: mockUrl,
              },
            },
            loading: false,
          });
        } catch (error) {
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to upload avatar',
            },
            loading: false,
          });
        }
      },
      
      inviteUser: async (email, role) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const invite: InviteLink = {
            id: crypto.randomUUID(),
            email,
            role,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            createdBy: get().session?.user?.id || '',
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            pendingInvites: [...state.pendingInvites, invite],
            loading: false,
          }));
        } catch (error) {
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to invite user',
            },
            loading: false,
          });
        }
      },
      
      acceptInvite: async (inviteId, password) => {
        set({ loading: true, error: null });
        try {
          const invite = get().pendingInvites.find(i => i.id === inviteId);
          if (!invite) throw new Error('Invalid invite');
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            pendingInvites: state.pendingInvites.filter(i => i.id !== inviteId),
            loading: false,
          }));
        } catch (error) {
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to accept invite',
            },
            loading: false,
          });
        }
      },
      
      revokeInvite: async (inviteId) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            pendingInvites: state.pendingInvites.filter(i => i.id !== inviteId),
            loading: false,
          }));
        } catch (error) {
          set({
            error: {
              message: error instanceof Error ? error.message : 'Failed to revoke invite',
            },
            loading: false,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        session: state.session,
        pendingInvites: state.pendingInvites,
      }),
    }
  )
);