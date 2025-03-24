export interface Hub {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  domain: string;
  status: 'active' | 'archived' | 'suspended';
  settings: {
    theme?: 'light' | 'dark' | 'system';
    features?: Record<string, boolean>;
  };
  billing?: {
    plan: 'free' | 'pro' | 'enterprise';
    subscriptionId?: string;
    trialEndsAt?: string;
  };
  owner: {
    id: string;
    name: string;
    role: 'owner';
  };
  team: {
    id: string;
    name: string;
    role: 'admin' | 'member' | 'viewer';
  }[];
  createdAt: string;
  updatedAt: string;
}