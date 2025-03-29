import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { Solution, SolutionCollaboration, SolutionDependency, SolutionIntegration, SolutionVersion } from '../types';
import type { Node, Edge } from 'reactflow';
import { solutions as seedSolutions } from '../data/seed';
import { solutionsToJsonLd } from '../features/export';

interface SolutionState {
  solutions: Solution[];
  activeSolutionId: string | null;
  nodePositions: Record<string, { x: number; y: number }>;
  edges: Edge[];
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateEdges: (edges: Edge[]) => void;
  addSolution: (solution: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addCollaboration: (collaboration: Partial<SolutionCollaboration>) => void;
  addDependency: (dependency: Partial<SolutionDependency>) => void;
  addIntegration: (integration: Partial<SolutionIntegration>) => void;
  updateCollaboration: (id: string, updates: Partial<SolutionCollaboration>) => void;
  updateDependency: (id: string, updates: Partial<SolutionDependency>) => void;
  updateIntegration: (id: string, updates: Partial<SolutionIntegration>) => void;
  removeCollaboration: (id: string, solutionId: string) => void;
  removeDependency: (id: string, solutionId: string) => void;
  removeIntegration: (id: string, solutionId: string) => void;
  addVersion: (version: Partial<SolutionVersion>) => void;
  updateSolution: (id: string, updates: Partial<Solution>) => void;
  setActiveSolution: (id: string) => void;
  archiveSolution: (id: string) => void;
  exportToJsonLd: () => string;
}

const initialState: Omit<SolutionState, 
  'updateNodePosition' | 'updateEdges' | 'addSolution' | 'addCollaboration' | 
  'addDependency' | 'addIntegration' | 'updateCollaboration' | 'updateDependency' | 
  'updateIntegration' | 'removeCollaboration' | 'removeDependency' | 'removeIntegration' | 
  'addVersion' | 'updateSolution' | 'setActiveSolution' | 'archiveSolution' | 'exportToJsonLd'
> = {
  solutions: seedSolutions,
  activeSolutionId: null,
  nodePositions: {},
  edges: [],
};

export const useSolutionStore = create<SolutionState>()(
  devtools(subscribeWithSelector(persist(
    (set: any, get: any) => ({
      ...initialState,
      
      updateNodePosition: (nodeId: string, position: { x: number; y: number }) =>
        set((state: SolutionState) => ({
          nodePositions: {
            ...state.nodePositions,
            [nodeId]: position,
          },
        })),
        
      updateEdges: (edges: Edge[]) =>
        set({ edges }),
      addSolution: (solution: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'>) =>
        set((state: SolutionState) => {
          const newSolution: Solution = {
            ...solution,
            id: crypto.randomUUID(),
            owner: {
              id: 'current-user', // In real app, get from auth context
              name: 'Current User',
              role: 'owner'
            },
            team: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            solutions: [newSolution, ...state.solutions],
            activeSolutionId: state.activeSolutionId || state.solutions.length === 0 ? newSolution.id : state.activeSolutionId,
          };
        }),
      addCollaboration: (collaboration: Partial<SolutionCollaboration>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === collaboration.sourceSolutionId 
              ? {
                  ...s,
                  collaborations: [
                    ...(s.collaborations || []),
                    {
                      ...collaboration,
                      id: crypto.randomUUID(),
                      status: 'active',
                      flowType: collaboration.flowType || 'unidirectional',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                }
              : s
          ),
        })),
      addDependency: (dependency: Partial<SolutionDependency>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === dependency.dependentSolutionId 
              ? {
                  ...s,
                  dependencies: [
                    ...(s.dependencies || []),
                    {
                      ...dependency,
                      id: crypto.randomUUID(),
                      flowType: dependency.flowType || 'unidirectional',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                }
              : s
          ),
        })),
      addIntegration: (integration: Partial<SolutionIntegration>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === integration.sourceSolutionId 
              ? {
                  ...s,
                  integrations: [
                    ...(s.integrations || []),
                    {
                      ...integration,
                      id: crypto.randomUUID(),
                      status: 'active',
                      flowType: integration.flowType || 'unidirectional',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                }
              : s
          ),
        })),
      updateCollaboration: (id: string, updates: Partial<SolutionCollaboration>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.collaborations?.some((c: SolutionCollaboration) => c.id === id)
              ? {
                  ...s,
                  collaborations: s.collaborations.map((c: SolutionCollaboration) =>
                    c.id === id ? { ...c, ...updates } : c
                  ),
                }
              : s
          ),
        })),
      updateDependency: (id: string, updates: Partial<SolutionDependency>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.dependencies?.some((d: SolutionDependency) => d.id === id)
              ? {
                  ...s,
                  dependencies: s.dependencies.map((d: SolutionDependency) =>
                    d.id === id ? { ...d, ...updates } : d
                  ),
                }
              : s
          ),
        })),
      updateIntegration: (id: string, updates: Partial<SolutionIntegration>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.integrations?.some((i: SolutionIntegration) => i.id === id)
              ? {
                  ...s,
                  integrations: s.integrations.map((i: SolutionIntegration) =>
                    i.id === id ? { ...i, ...updates } : i
                  ),
                }
              : s
          ),
        })),
      removeCollaboration: (id: string, solutionId: string) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === solutionId
              ? {
                  ...s,
                  collaborations: s.collaborations?.filter((c: SolutionCollaboration) => c.id !== id),
                }
              : s
          ),
        })),
      removeDependency: (id: string, solutionId: string) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === solutionId
              ? {
                  ...s,
                  dependencies: s.dependencies?.filter((d: SolutionDependency) => d.id !== id),
                }
              : s
          ),
        })),
      removeIntegration: (id: string, solutionId: string) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === solutionId
              ? {
                  ...s,
                  integrations: s.integrations?.filter((i: SolutionIntegration) => i.id !== id),
                }
              : s
          ),
        })),
      addVersion: (version: Partial<SolutionVersion>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === version.solutionId
              ? {
                  ...s,
                  versions: [
                    ...(s.versions || []),
                    {
                      ...version,
                      id: crypto.randomUUID(),
                      releasedAt: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                }
              : s
          ),
        })),
      updateSolution: (id: string, updates: Partial<Solution>) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === id ? {
              ...s,
              ...updates,
              updatedAt: new Date().toISOString(),
              // Preserve owner if not explicitly updated
              owner: updates.owner || s.owner,
              // Preserve team if not explicitly updated
              team: updates.team || s.team,
            } : s
          ),
        })),
      setActiveSolution: (id: string) =>
        set({ activeSolutionId: id }),
      archiveSolution: (id: string) =>
        set((state: SolutionState) => ({
          solutions: state.solutions.map((s: Solution) =>
            s.id === id
              ? { ...s, status: 'archived', updatedAt: new Date().toISOString() }
              : s
          ),
          activeSolutionId:
            state.activeSolutionId === id
              ? state.solutions.find((s: Solution) => s.id !== id && s.status === 'active')?.id || null
              : state.activeSolutionId,
        })),
      exportToJsonLd: () => {
        const state = get();
        const jsonLd = solutionsToJsonLd(state.solutions);
        return JSON.stringify(jsonLd, null, 2);
      },
    }),
    {
      name: 'solution-store',
    }
  )))
);