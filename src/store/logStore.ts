import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LogEvent, LogFilter, LogLevel, LogCategory } from '../types/logs';

interface LogState {
  logs: LogEvent[];
  addLog: (
    level: LogLevel,
    category: LogCategory,
    action: string,
    metadata?: Record<string, any>,
    error?: Error
  ) => void;
  clearLogs: () => void;
  filterLogs: (filter: LogFilter) => LogEvent[];
  exportLogs: (filter?: LogFilter) => string;
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (level, category, action, metadata = {}, error) => {
        const newLog: LogEvent = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          level,
          category,
          action,
          userId: metadata.userId,
          metadata,
          ...(error && {
            error: {
              message: error.message,
              stack: error.stack,
            },
          }),
        };

        set((state) => ({
          logs: [newLog, ...state.logs],
        }));

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          const consoleMethod = {
            info: console.info,
            warning: console.warn,
            error: console.error,
            debug: console.debug,
          }[level];

          consoleMethod?.(
            `[${category.toUpperCase()}] ${action}`,
            metadata,
            error || ''
          );
        }
      },

      clearLogs: () => set({ logs: [] }),

      filterLogs: (filter) => {
        const { logs } = get();
        return logs.filter((log) => {
          if (filter.level && log.level !== filter.level) return false;
          if (filter.category && log.category !== filter.category) return false;
          if (filter.userId && log.userId !== filter.userId) return false;
          if (filter.startDate && log.timestamp < filter.startDate) return false;
          if (filter.endDate && log.timestamp > filter.endDate) return false;
          if (
            filter.search &&
            !log.action.toLowerCase().includes(filter.search.toLowerCase()) &&
            !JSON.stringify(log.metadata).toLowerCase().includes(filter.search.toLowerCase())
          ) {
            return false;
          }
          return true;
        });
      },

      exportLogs: (filter) => {
        const logs = filter ? get().filterLogs(filter) : get().logs;
        return JSON.stringify(logs, null, 2);
      },
    }),
    {
      name: 'log-store',
      partialize: (state) => ({ logs: state.logs.slice(0, 1000) }), // Keep last 1000 logs
    }
  )
);

// Log event creators
export const logAuth = (action: string, metadata?: Record<string, any>, error?: Error) =>
  useLogStore.getState().addLog('info', 'auth', action, metadata, error);

export const logUser = (action: string, metadata?: Record<string, any>, error?: Error) =>
  useLogStore.getState().addLog('info', 'user', action, metadata, error);

export const logSolution = (action: string, metadata?: Record<string, any>, error?: Error) =>
  useLogStore.getState().addLog('info', 'solution', action, metadata, error);

export const logGoal = (action: string, metadata?: Record<string, any>, error?: Error) =>
  useLogStore.getState().addLog('info', 'goal', action, metadata, error);

export const logWorkflow = (action: string, metadata?: Record<string, any>, error?: Error) =>
  useLogStore.getState().addLog('info', 'workflow', action, metadata, error);

export const logNavigation = (action: string, metadata?: Record<string, any>) =>
  useLogStore.getState().addLog('debug', 'navigation', action, metadata);

export const logError = (category: LogCategory, action: string, error: Error, metadata?: Record<string, any>) =>
  useLogStore.getState().addLog('error', category, action, metadata, error);