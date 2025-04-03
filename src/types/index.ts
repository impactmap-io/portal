export interface Solution {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  category: 'product' | 'service' | 'platform' | 'integration';
  spiffeId?: {
    trustDomain: string;
    path: string;
    fullId: string;
  };
  workloads?: {
    id: string;
    name: string;
    environment: string;
    spiffeId: {
      trustDomain: string;
      path: string;
      fullId: string;
    };
    status: 'active' | 'inactive';
    lastSeen?: string;
  }[];
  services?: {
    id: string;
    name: string;
    type: string;
    spiffeId: {
      trustDomain: string;
      path: string;
      fullId: string;
    };
    endpoints?: string[];
    status: 'active' | 'inactive';
  }[];
  repository?: {
    type: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    lastCommit?: {
      id: string;
      message: string;
      timestamp: string;
      author: string;
    };
  };
  createdAt: string;
  updatedAt: string;
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
  metrics: {
    [key: string]: {
      current: number;
      target: number;
      unit: string;
      updatedAt: string;
      dataSource?: string;
    }
  };
  collaborations?: SolutionCollaboration[];
  dependencies?: SolutionDependency[];
  integrations?: SolutionIntegration[];
  versions?: SolutionVersion[];
}

export interface SolutionCollaboration {
  id: string;
  sourceSolutionId: string;
  targetSolutionId: string;
  collaborationType: string;
  flowType: 'unidirectional' | 'bidirectional' | 'lateral';
  status: string;
  description?: string;
  startDate: string;
  endDate?: string;
  terms?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionDependency {
  id: string;
  dependentSolutionId: string;
  dependencySolutionId: string;
  dependencyType: string;
  flowType: 'unidirectional' | 'bidirectional' | 'lateral';
  criticality: 'low' | 'medium' | 'high';
  description?: string;
  requirements?: Record<string, any>;
  validationRules?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionIntegration {
  id: string;
  sourceSolutionId: string;
  targetSolutionId: string;
  integrationType: string;
  flowType: 'unidirectional' | 'bidirectional' | 'lateral';
  config?: Record<string, any>;
  status: string;
  healthCheckUrl?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionVersion {
  id: string;
  solutionId: string;
  version: string;
  state: 'alpha' | 'beta' | 'rc' | 'stable' | 'lts' | 'deprecated' | 'eol';
  changelog?: string;
  compatibility?: Record<string, any>;
  stabilityScore?: number;
  supportedUntil?: string;
  minimumRequirements?: Record<string, any>;
  breakingChanges?: string[];
  knownIssues?: string[];
  upgradeGuide?: string;
  approvalStatus?: string;
  approvedBy?: string[];
  approvalNotes?: string;
  releasedAt: string;
  releasedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  solutionId: string;
  status: 'active' | 'paused' | 'completed';
  type: 'integration' | 'engagement' | 'automation' | 'collaboration';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metrics: WorkflowMetric[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignee?: string;
  dependencies?: string[];
  completionCriteria?: string[];
  validations?: WorkflowValidation[];
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'condition';
  config: {
    eventType?: string;
    schedule?: string;
    condition?: string;
  };
}

export interface WorkflowMetric {
  name: string;
  type: 'duration' | 'count' | 'success-rate';
  value: number;
  target?: number;
  unit: string;
}

export interface WorkflowValidation {
  type: 'data' | 'process' | 'outcome';
  criteria: string;
  status: 'pending' | 'passed' | 'failed';
  timestamp?: string;
}

export interface WorkflowEvent {
  id: string;
  workflowId: string;
  stepId?: string;
  type: 'start' | 'complete' | 'fail' | 'validate' | 'interact';
  actor: string;
  timestamp: string;
  data?: Record<string, any>;
  metadata?: {
    location?: string;
    device?: string;
    duration?: number;
  };
}

export interface ImpactGoal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'draft' | 'live' | 'completed' | 'terminated' | 'on-hold';
  teamMembers?: string[];
  lastUpdated?: string;
  parentGoalId?: string;
  weight: number;
  progress: number;
  solutions?: {
    solutionId: string;
    contributionWeight: number;
    contributionPercentage: number;
    metrics: Record<string, any>;
  }[];
  dependencies?: {
    goalId: string;
    relationshipType: string;
    impactWeight: number;
  }[];
  contractId?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'investor' | 'partner' | 'end-user' | 'team' | 'community';
  description: string;
  goalId: string;
  contactInfo?: string;
  role?: string;
  engagementLevel?: 'high' | 'medium' | 'low';
  influence?: 'high' | 'medium' | 'low';
  interests?: string[];
  expectations?: string[];
  communicationPreference?: 'email' | 'phone' | 'meeting' | 'newsletter';
  lastEngagement?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  entityId: string;
  entityType: 'goal' | 'impact' | 'deliverable';
  parentId?: string;
  reactions?: {
    type: '👍' | '👎' | '❤️' | '🎯' | '💡';
    count: number;
    users: string[];
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  entityId?: string;
  entityType?: 'goal' | 'impact' | 'deliverable' | 'comment';
  actionUrl?: string;
}

export interface Feedback {
  id: string;
  type: 'suggestion' | 'issue' | 'praise';
  title: string;
  description: string;
  status: 'new' | 'under-review' | 'planned' | 'in-progress' | 'completed' | 'declined';
  priority: 'low' | 'medium' | 'high';
  submittedBy: string;
  submittedAt: string;
  category: string;
  votes: number;
  entityId?: string;
  entityType?: 'goal' | 'impact' | 'deliverable';
}

export interface Impact {
  id: string;
  title: string;
  description: string;
  actorId: string;
  status: 'positive' | 'negative' | 'neutral';
  metrics?: {
    name: string;
    value: number;
    target: number;
    trend?: number[];
    forecast?: number[];
    direction: 'increase' | 'decrease';
    unit?: string;
    category?: 'performance' | 'engagement' | 'satisfaction' | 'adoption';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    historicalData?: {
      date: string;
      value: number;
      annotations?: string[];
    }[];
  }[];
  scenarios?: {
    id: string;
    name: string;
    description: string;
    probability: number;
    predictedImpact: number;
    recommendations: string[];
  }[];
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  impactId: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  comments?: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
}