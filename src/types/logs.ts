export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export type LogCategory = 
  | 'auth'
  | 'user'
  | 'solution'
  | 'goal'
  | 'workflow'
  | 'navigation'
  | 'system';

export interface LogEvent {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export interface LogFilter {
  level?: LogLevel;
  category?: LogCategory;
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
}