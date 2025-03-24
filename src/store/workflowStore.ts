import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workflow, WorkflowEvent, WorkflowStep } from '../types';
import { workflows as seedWorkflows, workflowEvents as seedEvents } from '../data/seed';

interface WorkflowState {
  workflows: Workflow[];
  events: WorkflowEvent[];
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  updateStep: (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  recordEvent: (event: Omit<WorkflowEvent, 'id' | 'timestamp'>) => void;
  getWorkflowMetrics: (workflowId: string) => {
    completionRate: number;
    averageDuration: number;
    activeSteps: number;
    totalEvents: number;
  };
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: seedWorkflows,
      events: seedEvents,
      
      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [
            ...state.workflows,
            {
              ...workflow,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id
              ? { ...w, ...updates, updatedAt: new Date().toISOString() }
              : w
          ),
        })),

      updateStep: (workflowId, stepId, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  steps: w.steps.map((s) =>
                    s.id === stepId ? { ...s, ...updates } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        })),

      recordEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      getWorkflowMetrics: (workflowId) => {
        const { workflows, events } = get();
        const workflow = workflows.find((w) => w.id === workflowId);
        const workflowEvents = events.filter((e) => e.workflowId === workflowId);
        
        const completedSteps = workflow?.steps.filter((s) => s.status === 'completed').length || 0;
        const totalSteps = workflow?.steps.length || 0;
        
        const durations = workflowEvents
          .filter((e) => e.metadata?.duration)
          .map((e) => e.metadata!.duration!);
        
        return {
          completionRate: totalSteps ? (completedSteps / totalSteps) * 100 : 0,
          averageDuration: durations.length
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0,
          activeSteps: workflow?.steps.filter((s) => s.status === 'in-progress').length || 0,
          totalEvents: workflowEvents.length,
        };
      },
    }),
    {
      name: 'workflow-store',
    }
  )
);