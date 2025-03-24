export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'admin' | 'member' | 'viewer';
  settings?: UserSettings;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  timezone?: string;
  language?: string;
}

export interface AuthSession {
  user: User | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface InviteLink {
  id: string;
  email: string;
  role: User['role'];
  expiresAt: string;
  createdBy: string;
  createdAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}