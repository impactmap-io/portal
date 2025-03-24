import { Solution, Deliverable, Impact, ImpactGoal, Workflow, WorkflowEvent, Stakeholder } from '../types';

export const solutions: Solution[] = [
  {
    id: '1',
    name: 'ML Training Platform',
    description: 'End-to-end machine learning model training and validation platform',
    status: 'active',
    category: 'platform',
    repository: {
      type: 'github',
      url: 'https://github.com/ml-org/training-platform',
      lastCommit: {
        id: '8f4d76b239c6f091725641b6',
        message: 'Optimize batch processing for GPU clusters',
        timestamp: '2024-03-15T14:32:00Z',
        author: 'Alex Chen'
      }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    owner: {
      id: 'usr_1',
      name: 'Dr. Maria Rodriguez',
      role: 'owner'
    },
    team: [
      {
        id: 'usr_2',
        name: 'Alex Chen',
        role: 'admin'
      },
      {
        id: 'usr_3',
        name: 'Sarah Kim',
        role: 'member'
      },
      {
        id: 'usr_4',
        name: 'James Wilson',
        role: 'viewer'
      }
    ],
    metrics: {
      trainingTime: {
        current: 120,
        target: 90,
        unit: 'minutes',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      modelAccuracy: {
        current: 96.5,
        target: 98,
        unit: 'percent',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      resourceUtilization: {
        current: 85,
        target: 95,
        unit: 'percent',
        updatedAt: '2024-03-15T00:00:00Z'
      }
    }
  },
  {
    id: '6',
    name: 'AI Diagnostic Assistant',
    description: 'AI-powered diagnostic support for healthcare providers',
    status: 'active',
    category: 'platform',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    owner: {
      id: 'usr_5',
      name: 'Dr. Sarah Chen',
      role: 'owner'
    },
    team: [
      {
        id: 'usr_6',
        name: 'Mike Johnson',
        role: 'admin'
      },
      {
        id: 'usr_7',
        name: 'Alex Kim',
        role: 'member'
      },
      {
        id: 'usr_8',
        name: 'Dr. Lisa Wong',
        role: 'viewer'
      }
    ],
    metrics: {
      accuracy: {
        current: 92,
        target: 98,
        unit: 'percent',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      responseTime: {
        current: 1.5,
        target: 0.8,
        unit: 'seconds',
        updatedAt: '2024-03-15T00:00:00Z'
      }
    }
  },
  {
    id: '2',
    name: 'Impact Analytics Platform',
    description: 'Enterprise solution for measuring and tracking social impact metrics',
    status: 'active',
    category: 'platform',
    repository: {
      type: 'gitlab',
      url: 'https://gitlab.com/impact-tech/analytics-platform',
      lastCommit: {
        id: '2a1b3c4d5e6f7890',
        message: 'Add real-time metrics dashboard',
        timestamp: '2024-03-14T09:15:00Z',
        author: 'Emma Davis'
      }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    owner: {
      id: 'usr_9',
      name: 'James Wilson',
      role: 'owner'
    },
    team: [
      {
        id: 'usr_10',
        name: 'Emma Davis',
        role: 'admin'
      },
      {
        id: 'usr_11',
        name: 'Alex Kim',
        role: 'member'
      }
    ],
    metrics: {
      users: {
        current: 3200,
        target: 5000,
        unit: 'users',
        updatedAt: '2024-03-14T00:00:00Z'
      },
      dataProcessed: {
        current: 420,
        target: 1000,
        unit: 'GB',
        updatedAt: '2024-03-14T00:00:00Z'
      }
    }
  },
  {
    id: '3',
    name: 'Community Engagement Portal',
    description: 'Stakeholder engagement and community feedback platform',
    status: 'active',
    category: 'product',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    owner: {
      id: 'usr_12',
      name: 'Lisa Wong',
      role: 'owner'
    },
    team: [
      {
        id: 'usr_13',
        name: 'Robert Chen',
        role: 'member'
      }
    ],
    metrics: {
      engagement: {
        current: 34,
        target: 50,
        unit: 'percent',
        updatedAt: '2024-03-10T00:00:00Z'
      },
      activeGroups: {
        current: 45,
        target: 100,
        unit: 'groups',
        updatedAt: '2024-03-10T00:00:00Z'
      }
    }
  }
];

export const workflows: Workflow[] = [
  {
    id: '1',
    name: 'Model Training Workflow',
    description: 'End-to-end ML model training and validation workflow',
    solutionId: '1',
    status: 'active',
    type: 'automation',
    steps: [
      {
        id: '1',
        name: 'Data Preprocessing',
        description: 'Clean and prepare training data for ML model',
        type: 'automated',
        status: 'completed',
        validations: [
          {
            type: 'data',
            criteria: 'Data quality checks passed',
            status: 'passed',
            timestamp: '2024-03-15T09:00:00Z'
          }
        ]
      },
      {
        id: '2',
        name: 'Model Training',
        description: 'Train model on prepared dataset',
        type: 'automated',
        status: 'in-progress',
        dependencies: ['1'],
        completionCriteria: [
          'Training loss converged',
          'Validation metrics met'
        ]
      },
      {
        id: '3',
        name: 'Model Validation',
        description: 'Validate model performance on test set',
        type: 'automated',
        status: 'pending',
        dependencies: ['2'],
        completionCriteria: [
          'Accuracy > 95%',
          'F1 Score > 0.9'
        ]
      },
      {
        id: '4',
        name: 'Model Review',
        description: 'Expert review of model performance',
        type: 'manual',
        status: 'pending',
        assignee: 'Dr. Maria Rodriguez',
        dependencies: ['3'],
        completionCriteria: [
          'Performance metrics approved',
          'Bias assessment completed'
        ]
      }
    ],
    triggers: [
      {
        type: 'event',
        config: {
          eventType: 'new_training_data'
        }
      },
      {
        type: 'schedule',
        config: {
          schedule: '0 0 * * 0'  // Weekly retraining
        }
      }
    ],
    metrics: [
      {
        name: 'Training Time',
        type: 'duration',
        value: 120,
        target: 90,
        unit: 'minutes'
      },
      {
        name: 'Model Accuracy',
        type: 'count',
        value: 96.5,
        target: 95,
        unit: 'percent'
      }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Diagnostic Analysis Pipeline',
    description: 'AI-powered diagnostic workflow for patient cases',
    solutionId: '1',
    status: 'active',
    type: 'automation',
    steps: [
      {
        id: '1',
        name: 'Data Collection',
        description: 'Gather patient diagnostic data',
        type: 'manual',
        status: 'completed',
        assignee: 'Dr. Lisa Wong',
        validations: [
          {
            type: 'data',
            criteria: 'Required patient data collected',
            status: 'passed',
            timestamp: '2024-03-15T10:00:00Z'
          }
        ]
      },
      {
        id: '2',
        name: 'AI Analysis',
        description: 'Process data through AI diagnostic models',
        type: 'automated',
        status: 'in-progress',
        dependencies: ['1'],
        completionCriteria: [
          'Model confidence score > 95%',
          'All critical checks passed'
        ]
      },
      {
        id: '3',
        name: 'Clinical Review',
        description: 'Healthcare provider reviews AI findings',
        type: 'manual',
        status: 'pending',
        assignee: 'Dr. Sarah Chen',
        dependencies: ['2'],
        completionCriteria: [
          'Findings validated',
          'Recommendations approved'
        ]
      }
    ],
    triggers: [
      {
        type: 'event',
        config: {
          eventType: 'new_diagnostic_request'
        }
      }
    ],
    metrics: [
      {
        name: 'Analysis Time',
        type: 'duration',
        value: 15,
        target: 10,
        unit: 'minutes'
      },
      {
        name: 'Accuracy Rate',
        type: 'count',
        value: 97,
        target: 99,
        unit: 'percent'
      }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Enterprise Integration Process',
    description: 'Standard workflow for integrating enterprise solutions',
    solutionId: '2',
    status: 'active',
    type: 'integration',
    steps: [
      {
        id: '1',
        name: 'Initial Setup',
        description: 'Configure basic integration parameters',
        type: 'manual',
        status: 'completed',
        assignee: 'Sarah Chen',
        validations: [
          {
            type: 'data',
            criteria: 'API credentials validated',
            status: 'passed',
            timestamp: '2024-03-15T10:00:00Z'
          }
        ]
      },
      {
        id: '2',
        name: 'Data Sync',
        description: 'Establish data synchronization',
        type: 'automated',
        status: 'in-progress',
        dependencies: ['1'],
        completionCriteria: [
          'Initial data sync completed',
          'Validation tests passed'
        ]
      }
    ],
    triggers: [
      {
        type: 'event',
        config: {
          eventType: 'new_enterprise_client'
        }
      }
    ],
    metrics: [
      {
        name: 'Integration Time',
        type: 'duration',
        value: 48,
        target: 24,
        unit: 'hours'
      },
      {
        name: 'Success Rate',
        type: 'count',
        value: 92,
        target: 95,
        unit: 'percent'
      }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  }
];

export const workflowEvents: WorkflowEvent[] = [
  {
    id: '1',
    workflowId: '1',
    stepId: '1',
    type: 'complete',
    actor: 'system',
    timestamp: '2024-03-15T09:00:00Z',
    data: {
      metrics: {
        dataQuality: 0.99,
        outliers: 0.01,
        missingValues: 0
      }
    },
    metadata: {
      duration: 15,
      location: 'ml-pipeline'
    }
  },
  {
    id: '2',
    workflowId: '1',
    stepId: '2',
    type: 'start',
    actor: 'system',
    timestamp: '2024-03-15T09:01:00Z',
    data: {
      config: {
        batchSize: 64,
        learningRate: 0.001,
        epochs: 100
      }
    },
    metadata: {
      location: 'ml-pipeline'
    }
  },
  {
    id: '3',
    workflowId: '1',
    stepId: '1',
    type: 'complete',
    actor: 'Dr. Lisa Wong',
    timestamp: '2024-03-15T10:00:00Z',
    data: {
      validationResults: {
        dataCompleteness: 'success',
        dataQuality: 'success'
      }
    },
    metadata: {
      duration: 12,
      location: 'diagnostic-portal'
    }
  },
  {
    id: '2',
    workflowId: '1',
    stepId: '2',
    type: 'start',
    actor: 'system',
    timestamp: '2024-03-15T10:01:00Z',
    data: {
      modelVersion: '2.1.0',
      batchSize: 1
    },
    metadata: {
      location: 'ai-pipeline'
    }
  },
  {
    id: '3',
    workflowId: '1',
    stepId: '1',
    type: 'complete',
    actor: 'Sarah Chen',
    timestamp: '2024-03-15T10:00:00Z',
    data: {
      validationResults: {
        apiConnection: 'success',
        dataAccess: 'success'
      }
    },
    metadata: {
      duration: 45,
      location: 'admin-dashboard'
    }
  }
];

export const goals: ImpactGoal[] = [
  {
    id: '1',
    title: 'Improve Model Performance',
    description: 'Achieve 98% accuracy while reducing training time by 25%',
    deadline: '2024-12-31',
    status: 'live',
    teamMembers: ['Dr. Maria Rodriguez', 'Alex Chen'],
    lastUpdated: '2024-03-15',
    weight: 1.0,
    progress: 0.65,
    contractId: 'contract-1',
    solutions: [
      {
        solutionId: '1',
        contributionWeight: 1.0,
        contributionPercentage: 0.65,
        metrics: {
          accuracy: {
            current: 96.5,
            target: 98.0,
            direction: 'increase',
            unit: 'percent',
            updatedAt: '2024-03-15T00:00:00Z'
          },
          trainingTime: {
            current: 120,
            target: 90,
            direction: 'decrease',
            unit: 'minutes',
            updatedAt: '2024-03-15T00:00:00Z'
          }
        }
      }
    ]
  },
  {
    id: '5',
    title: 'Increase Market Share',
    description: 'Achieve 25% market share in the enterprise segment by Q4 2024',
    deadline: '2024-12-31',
    status: 'draft',
    teamMembers: ['James Wilson', 'Emma Davis'],
    lastUpdated: '2024-03-15',
    weight: 1.0,
    progress: 0.45,
    solutions: [
      {
        solutionId: '2',
        contributionWeight: 0.7,
        contributionPercentage: 0.45,
        metrics: {
          marketShare: {
            current: 15,
            target: 25,
            direction: 'increase',
            unit: 'percent',
            updatedAt: '2024-03-15T00:00:00Z'
          }
        }
      }
    ]
  },
  {
    id: '4',
    title: 'Improve User Retention',
    description: 'Increase monthly active users retention rate to 85%',
    deadline: '2024-09-30',
    status: 'live',
    teamMembers: ['Alex Kim', 'Lisa Wong'],
    lastUpdated: '2024-03-14',
    weight: 1.0,
    progress: 0.75,
    contractId: 'contract-2',
    solutions: [
      {
        solutionId: '3',
        contributionWeight: 1.0,
        contributionPercentage: 0.75,
        metrics: {
          retentionRate: {
            current: 78,
            target: 85,
            direction: 'increase',
            unit: 'percent',
            updatedAt: '2024-03-15T00:00:00Z'
          }
        }
      }
    ]
  },
  {
    id: '7',
    title: 'Improve Diagnostic Accuracy',
    description: 'Achieve 99% accuracy in AI-assisted diagnoses by Q4 2024',
    deadline: '2024-12-31',
    status: 'draft',
    teamMembers: ['Dr. Sarah Chen', 'Dr. Lisa Wong'],
    lastUpdated: '2024-03-15',
    weight: 1.0,
    progress: 0.85,
    solutions: [
      {
        solutionId: '1',
        contributionWeight: 0.8,
        contributionPercentage: 0.85,
        metrics: {
          diagnosticAccuracy: {
            current: 97,
            target: 99,
            direction: 'increase',
            unit: 'percent',
            updatedAt: '2024-03-15T00:00:00Z'
          }
        }
      },
      {
        solutionId: '6',
        contributionWeight: 0.2,
        contributionPercentage: 0.85,
        metrics: {
          diagnosticAccuracy: {
            current: 97,
            target: 99,
            direction: 'increase',
            unit: 'percent',
            updatedAt: '2024-03-15T00:00:00Z'
          }
        }
      }
    ]
  },
];

export const stakeholders: Stakeholder[] = [
  {
    id: '1',
    name: 'ML Research Team',
    type: 'team',
    description: 'Core machine learning research and development team',
    goalId: '1',
    contactInfo: 'ml-team@example.com',
    role: 'Primary Stakeholder',
    engagementLevel: 'high',
    influence: 'high',
    interests: ['Model performance', 'Training efficiency', 'Research publications'],
    expectations: ['Weekly progress updates', 'Performance benchmarks'],
    communicationPreference: 'meeting',
    lastEngagement: '2024-03-15'
  },
  {
    id: '2',
    name: 'Acme Corporation',
    type: 'partner',
    description: 'Large organizations with 1000+ employees',
    goalId: '1',
    contactInfo: 'enterprise@example.com',
    role: 'Strategic Partner',
    engagementLevel: 'high',
    influence: 'high',
    interests: ['Data sharing', 'Impact measurement', 'Sustainability reporting'],
    expectations: ['Quarterly progress updates', 'Joint initiative planning'],
    communicationPreference: 'meeting',
    lastEngagement: '2024-03-15'
  },
  {
    id: '5',
    name: 'Impact Ventures',
    type: 'investor',
    description: 'Social impact investment firm',
    goalId: '1',
    contactInfo: 'partners@impactventures.com',
    role: 'Lead Investor',
    engagementLevel: 'high',
    influence: 'high',
    interests: ['ROI tracking', 'Social impact metrics', 'Scaling strategies'],
    expectations: ['Monthly board meetings', 'Financial reports'],
    communicationPreference: 'meeting',
    lastEngagement: '2024-03-10'
  },
  {
    id: '3',
    name: 'Community Leaders',
    type: 'community',
    description: 'Local community representatives',
    goalId: '2',
    contactInfo: 'community@example.com',
    role: 'Advisory Board',
    engagementLevel: 'medium',
    influence: 'medium',
    interests: ['Local impact', 'Community engagement', 'Sustainability'],
    expectations: ['Regular community forums', 'Impact assessments'],
    communicationPreference: 'newsletter',
    lastEngagement: '2024-03-01'
  },
  {
    id: '4',
    name: 'Platform Users',
    type: 'end-user',
    description: 'Active platform users and beneficiaries',
    goalId: '2',
    role: 'Direct Beneficiary',
    engagementLevel: 'medium',
    influence: 'low',
    interests: ['User experience', 'Feature requests', 'Support'],
    expectations: ['Regular updates', 'Support response time'],
    communicationPreference: 'email',
    lastEngagement: '2024-03-12'
  },
];

export const impacts: Impact[] = [
  {
    id: '1',
    title: 'Training Efficiency',
    description: 'Improved model training speed and resource utilization',
    actorId: '1',
    status: 'positive',
    metrics: [
      {
        name: 'Training Time',
        value: 120,
        target: 90,
        direction: 'decrease',
        unit: 'minutes',
        category: 'performance',
        frequency: 'weekly',
        trend: [180, 150, 135, 120],
        forecast: [110, 100, 95, 90],
        historicalData: [
          { date: '2024-02-15', value: 180, annotations: ['Initial baseline'] },
          { date: '2024-02-22', value: 150, annotations: ['Batch size optimization'] },
          { date: '2024-03-01', value: 135, annotations: ['Pipeline parallelization'] },
          { date: '2024-03-08', value: 120, annotations: ['GPU optimization'] }
        ]
      },
      {
        name: 'Model Accuracy',
        value: 96.5,
        target: 98,
        direction: 'increase',
        unit: 'percent',
        category: 'performance',
        frequency: 'weekly',
        trend: [94.0, 95.2, 96.0, 96.5],
        forecast: [97.0, 97.5, 98.0],
        historicalData: [
          { date: '2024-02-15', value: 94.0, annotations: ['Initial model'] },
          { date: '2024-02-22', value: 95.2, annotations: ['Hyperparameter tuning'] },
          { date: '2024-03-01', value: 96.0, annotations: ['Architecture improvements'] },
          { date: '2024-03-08', value: 96.5, annotations: ['Data augmentation'] }
        ]
      }
    ],
    scenarios: [
      {
        id: '1',
        name: 'Rapid Convergence',
        description: 'Model achieves target metrics ahead of schedule',
        probability: 0.4,
        predictedImpact: 0.9,
        recommendations: [
          'Scale to larger datasets',
          'Explore advanced architectures',
          'Document optimization techniques'
        ]
      },
      {
        id: '2',
        name: 'Performance Plateau',
        description: 'Model performance stabilizes below target',
        probability: 0.3,
        predictedImpact: 0.5,
        recommendations: [
          'Review data quality',
          'Experiment with alternative architectures',
          'Consider ensemble approaches'
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Streamlined Onboarding',
    description: 'Faster and easier onboarding process for enterprise clients',
    actorId: '1',
    status: 'positive',
    metrics: [
      {
        name: 'Onboarding Time',
        value: 3,
        target: 2,
        direction: 'decrease',
        unit: 'days',
        category: 'performance',
        frequency: 'weekly',
        trend: [5, 4.5, 4, 3.5, 3],
        forecast: [2.8, 2.5, 2.2, 2],
        historicalData: [
          { date: '2024-01-01', value: 5.0, annotations: ['Initial baseline'] },
          { date: '2024-01-15', value: 4.5, annotations: ['Process improvements implemented'] },
          { date: '2024-02-01', value: 4.0, annotations: ['Automation added'] },
          { date: '2024-02-15', value: 3.5, annotations: ['Team training completed'] },
          { date: '2024-03-01', value: 3.0, annotations: ['Current state'] }
        ]
      },
      {
        name: 'Customer Satisfaction',
        value: 4.5,
        target: 4.8,
        direction: 'increase',
        unit: 'score',
        category: 'satisfaction',
        frequency: 'monthly',
        trend: [4.0, 4.2, 4.3, 4.5],
        forecast: [4.6, 4.7, 4.8, 4.9],
        historicalData: [
          { date: '2023-12-01', value: 4.0, annotations: ['Pre-improvement baseline'] },
          { date: '2024-01-01', value: 4.2, annotations: ['UI updates released'] },
          { date: '2024-02-01', value: 4.3, annotations: ['Support team expanded'] },
          { date: '2024-03-01', value: 4.5, annotations: ['New features launched'] }
        ]
      },
    ],
    scenarios: [
      {
        id: '1',
        name: 'Optimistic Growth',
        description: 'Rapid adoption of new features',
        probability: 0.6,
        predictedImpact: 0.8,
        recommendations: [
          'Increase customer support capacity',
          'Prepare scalability improvements',
          'Develop advanced feature tutorials',
        ],
      },
      {
        id: '2',
        name: 'Conservative Adoption',
        description: 'Gradual feature adoption with some resistance',
        probability: 0.3,
        predictedImpact: 0.4,
        recommendations: [
          'Focus on core feature education',
          'Enhance onboarding documentation',
          'Implement feedback collection system',
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'Better Analytics',
    description: 'Enhanced analytics and reporting capabilities',
    actorId: '2',
    status: 'positive',
  },
  {
    id: '3',
    title: 'Learning Curve',
    description: 'Initial complexity in understanding advanced features',
    actorId: '3',
    status: 'negative',
  },
];

export const deliverables: Deliverable[] = [
  {
    id: '1',
    title: 'Automated Data Pipeline',
    description: 'Build automated data preprocessing and validation pipeline',
    impactId: '1',
    status: 'completed',
    priority: 'high',
    assignee: 'Alex Chen',
    dueDate: '2024-03-15',
    comments: [
      {
        id: '1',
        author: 'Dr. Maria Rodriguez',
        content: 'Pipeline performance exceeds expectations',
        timestamp: '2024-03-15T10:00:00Z',
      },
    ],
  },
  {
    id: '7',
    title: 'Enterprise SSO Integration',
    description: 'Implement single sign-on for enterprise customers',
    impactId: '1',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    dueDate: '2024-04-15',
    comments: [
      {
        id: '1',
        author: 'Mike Johnson',
        content: 'Integration testing scheduled for next week',
        timestamp: '2024-03-14T10:30:00Z',
      },
    ],
  },
  {
    id: '8',
    title: 'Analytics Dashboard',
    description: 'Create comprehensive analytics dashboard',
    impactId: '2',
    status: 'planned',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Interactive Tutorial',
    description: 'Develop interactive onboarding tutorial',
    impactId: '3',
    status: 'planned',
    priority: 'high',
  },
];