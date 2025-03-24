import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImpactGoal } from '../types';
import { goals as seedGoals } from '../data/seed';

interface GoalState {
  goals: ImpactGoal[];
  addGoal: (goal: Partial<ImpactGoal> & Pick<ImpactGoal, 'title' | 'description' | 'deadline' | 'weight'>) => void;
  updateGoal: (id: string, updates: Partial<ImpactGoal>) => void;
  archiveGoal: (id: string) => void;
  calculateProgress: (goalId: string) => number;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: seedGoals,
      
      addGoal: (goal) =>
        set((state) => {
          const newGoal = {
            ...goal,
            id: crypto.randomUUID(),
            lastUpdated: new Date().toISOString(),
            progress: 0, // Initialize progress to 0, we'll calculate it after saving if needed
            status: goal.status || 'draft',
          };
          
          // Add the goal to the state
          const updatedState = {
            goals: [...state.goals, newGoal],
          };
          
          // Calculate progress separately after the goal has been created with an ID
          if (newGoal.solutions?.length) {
            // We need to manually update the progress since we can't call calculateProgress yet
            const totalWeight = newGoal.solutions.reduce((sum, s) => sum + s.contributionWeight, 0);
            const weightedProgress = newGoal.solutions.reduce((sum, solution) => {
              const metrics = Object.values(solution.metrics);
              if (!metrics.length) return sum;
              
              // Calculate average progress across all metrics for this solution
              const metricProgress = metrics.reduce((mSum, metric) => {
                let progress;
                if (metric.direction === 'decrease') {
                  // For decreasing metrics, calculate relative improvement
                  const range = Math.max(metric.current, metric.target) - metric.target;
                  const improvement = Math.max(0, Math.min(metric.current - metric.target, range));
                  const ratio = 1 - (improvement / range);
                  progress = Math.min(ratio * 100, 100);
                } else {
                  // For increasing metrics, calculate relative progress
                  progress = Math.min((metric.current / metric.target) * 100, 100);
                }
                return mSum + progress;
              }, 0) / metrics.length;

              // Update solution's contribution percentage
              solution.contributionPercentage = metricProgress / 100;
              
              // Add weighted contribution to total progress
              return sum + ((metricProgress / 100) * solution.contributionWeight);
            }, 0);

            // Update the progress for the new goal
            const normalizedProgress = Math.min(weightedProgress / totalWeight, 1);
            updatedState.goals[updatedState.goals.length - 1].progress = normalizedProgress;
          }
          
          return updatedState;
        }),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  ...updates,
                  lastUpdated: new Date().toISOString(),
                }
              : g
          ),
        })),

      archiveGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, status: 'on-hold', lastUpdated: new Date().toISOString() }
              : g
          ),
        })),

      calculateProgress: (goalId) => {
        const { goals } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal?.solutions?.length) return 0;

        // Calculate weighted progress across all contributing solutions
        const totalWeight = goal.solutions.reduce((sum, s) => sum + s.contributionWeight, 0);
        const weightedProgress = goal.solutions.reduce((sum, solution) => {
          const metrics = Object.values(solution.metrics);
          if (!metrics.length) return sum;
          // Calculate average progress across all metrics for this solution
          const metricProgress = metrics.reduce((mSum, metric) => {            
            let progress;            
            if (metric.direction === 'decrease') {
              // For decreasing metrics, calculate relative improvement
              const range = Math.max(metric.current, metric.target) - metric.target;
              const improvement = Math.max(0, Math.min(metric.current - metric.target, range));
              const ratio = 1 - (improvement / range);
              progress = Math.min(ratio * 100, 100);
            } else {
              // For increasing metrics, calculate relative progress
              progress = Math.min((metric.current / metric.target) * 100, 100);
            }
            return mSum + progress;
          }, 0) / metrics.length;

          // Update solution's contribution percentage
          solution.contributionPercentage = metricProgress / 100;
          
          // Add weighted contribution to total progress
          return sum + ((metricProgress / 100) * solution.contributionWeight);
        }, 0);

        // Return normalized progress (0-1)
        return Math.min(weightedProgress / totalWeight, 1);
      },
    }),
    {
      name: 'goal-store',
    }
  )
);