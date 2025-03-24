import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  isExpanded: boolean;
  toggle: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isExpanded: true,
      toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
    }),
    {
      name: 'navigation-state',
    }
  )
);