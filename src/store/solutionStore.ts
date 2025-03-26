import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { Solution } from '../types';
import type { Node, Edge } from 'reactflow';
import { solutions as seedSolutions } from '../data/seed';

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
}

export const useSolutionStore = create<SolutionState>()(
  devtools(subscribeWithSelector(persist(
    (set) => ({
      solutions: seedSolutions,
      activeSolutionId: null,
      nodePositions: {},
      edges: [],
      
      updateNodePosition: (nodeId, position) =>
        set((state) => ({
          nodePositions: {
            ...state.nodePositions,
            [nodeId]: position,
          },
        })),
        
      updateEdges: (edges) =>
        set({ edges }),
      addSolution: (solution) =>
        set((state) => ({
          solutions: [
            {
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
            },
            ...state.solutions,
          ],
          activeSolutionId: state.activeSolutionId || state.solutions.length === 0 ? solution.id : state.activeSolutionId,
        })),
      addCollaboration: (collaboration) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
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
        }), false, 'addCollaboration'),
      addDependency: (dependency) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
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
        }), false, 'addDependency'),
      addIntegration: (integration) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
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
        }), false, 'addIntegration'),
      updateCollaboration: (id, updates) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.collaborations?.some((c) => c.id === id)
              ? {
                  ...s,
                  collaborations: s.collaborations.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                  ),
                }
              : s
          ),
        })),
      updateDependency: (id, updates) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.dependencies?.some((d) => d.id === id)
              ? {
                  ...s,
                  dependencies: s.dependencies.map((d) =>
                    d.id === id ? { ...d, ...updates } : d
                  ),
                }
              : s
          ),
        })),
      updateIntegration: (id, updates) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.integrations?.some((i) => i.id === id)
              ? {
                  ...s,
                  integrations: s.integrations.map((i) =>
                    i.id === id ? { ...i, ...updates } : i
                  ),
                }
              : s
          ),
        })),
      removeCollaboration: (id, solutionId) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.id === solutionId
              ? {
                  ...s,
                  collaborations: s.collaborations?.filter((c) => c.id !== id),
                }
              : s
          ),
        })),
      removeDependency: (id, solutionId) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.id === solutionId
              ? {
                  ...s,
                  dependencies: s.dependencies?.filter((d) => d.id !== id),
                }
              : s
          ),
        })),
      removeIntegration: (id, solutionId) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.id === solutionId
              ? {
                  ...s,
                  integrations: s.integrations?.filter((i) => i.id !== id),
                }
              : s
          ),
        })),
      addVersion: (version) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
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
      updateSolution: (id, updates) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
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
      setActiveSolution: (id) =>
        set({ activeSolutionId: id }),
      archiveSolution: (id) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.id === id
              ? { ...s, status: 'archived', updatedAt: new Date().toISOString() }
              : s
          ),
          activeSolutionId:
            state.activeSolutionId === id
              ? state.solutions.find((s) => s.id !== id && s.status === 'active')?.id || null
              : state.activeSolutionId,
        })),
    }),
    {
      name: 'solution-store',
    }
  )))
);