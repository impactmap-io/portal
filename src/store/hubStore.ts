import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { Hub } from '../types/hub';

interface HubState {
  hubs: Hub[];
  activeHubId: string | null;
  addHub: (hub: Omit<Hub, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Hub>;
  updateHub: (id: string, updates: Partial<Hub>) => void;
  setActiveHub: (id: string) => void;
  archiveHub: (id: string) => void;
  isDomainAvailable: (domain: string) => Promise<boolean>;
  deleteHub: (hubId: string) => void;
}

// Mock data for development
const mockHubs: Hub[] = [
  {
    id: '1',
    name: 'healthcare-ai',
    displayName: 'Healthcare AI Solutions',
    description: 'AI solutions for healthcare providers',
    domain: 'healthcare.impactmap.com',
    status: 'active',
    settings: {
      theme: 'system',
      features: {
        analytics: true,
        apiAccess: true,
      },
    },
    billing: {
      plan: 'pro',
      subscriptionId: 'sub_123',
    },
    owner: {
      id: 'usr_1',
      name: 'Dr. Sarah Chen',
      role: 'owner',
    },
    team: [
      {
        id: 'usr_2',
        name: 'Alex Kim',
        role: 'admin',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  },
];

export const useHubStore = create<HubState>()(
  devtools(subscribeWithSelector(persist(
    (set, get) => ({
      hubs: mockHubs,
      activeHubId: mockHubs[0]?.id || null,

      addHub: async (hub) => {
        // Check domain availability
        const isDomainAvailable = await get().isDomainAvailable(hub.domain);
        if (!isDomainAvailable) {
          throw new Error('Domain is not available');
        }

        const newHub = {
          ...hub,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          hubs: [...state.hubs, newHub],
          activeHubId: state.activeHubId || newHub.id,
        }));

        return newHub;
      },

      updateHub: (id, updates) =>
        set((state) => ({
          hubs: state.hubs.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        })),

      setActiveHub: (id) =>
        set({ activeHubId: id }),

      archiveHub: (id) =>
        set((state) => ({
          hubs: state.hubs.map((h) =>
            h.id === id
              ? { ...h, status: 'archived', updatedAt: new Date().toISOString() }
              : h
          ),
          activeHubId:
            state.activeHubId === id
              ? state.hubs.find((h) => h.id !== id && h.status === 'active')?.id || null
              : state.activeHubId,
        })),

      isDomainAvailable: async (domain: string) => {
        // Simulate API call to check domain availability
        await new Promise((resolve) => setTimeout(resolve, 500));
        return !get().hubs.some((h) => h.domain === domain);
      },

      deleteHub: (hubId: string) => {
        set((state) => ({
          hubs: state.hubs.filter((hub) => hub.id !== hubId)
        }));
      },
    }),
    {
      name: 'hub-store',
    }
  )))
);