import { useForm, Controller } from 'react-hook-form';
import { Flag, Calendar, Users, Target, Package, GitBranch, HelpCircle, X } from 'lucide-react';
import type { ImpactGoal } from '../types';
import { solutions } from '../data/seed';
import Tooltip from './Tooltip';

interface Metric {
  name: string;
  current: number;
  target: number;
  unit: string;
  direction?: 'increase' | 'decrease';
  frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  dataSource?: string;
}

interface Solution {
  solutionId: string;
  contributionWeight: number;
  contributionPercentage: number;
  metrics: Metric[];
}

interface GoalFormData {
  title: string;
  description: string;
  deadline: string;
  teamMembers: string[];
  weight: number;
  solutions: Solution[];
  dependencies: {
    goalId: string;
    relationshipType: 'blocks' | 'enables' | 'influences';
    impactWeight: number;
  }[];
}

const METRIC_TEMPLATES = {
  model_accuracy: {
    name: 'Model Accuracy',
    current: 0,
    target: 100,
    unit: '%',
    frequency: 'daily',
    dataSource: 'Model evaluation pipeline'
  },
  training_time: {
    name: 'Training Time',
    current: 0,
    target: 60,
    unit: 'minutes',
    frequency: 'daily',
    dataSource: 'Training pipeline metrics'
  },
  inference_time: {
    name: 'Inference Time',
    current: 0,
    target: 100,
    unit: 'ms',
    frequency: 'realtime',
    dataSource: 'Production monitoring'
  },
  resource_usage: {
    name: 'Resource Usage',
    current: 0,
    target: 80,
    unit: '%',
    frequency: 'hourly',
    dataSource: 'Infrastructure monitoring'
  },
  adoption_rate: {
    name: 'Adoption Rate',
    current: 0,
    target: 100,
    unit: '%',
    frequency: 'weekly',
    dataSource: 'User analytics'
  },
  satisfaction: {
    name: 'User Satisfaction',
    current: 0,
    target: 5,
    unit: 'stars',
    frequency: 'monthly',
    dataSource: 'User feedback'
  },
  engagement: {
    name: 'User Engagement',
    current: 0,
    target: 60,
    unit: 'minutes/day',
    frequency: 'daily',
    dataSource: 'User analytics'
  },
  throughput: {
    name: 'System Throughput',
    current: 0,
    target: 1000,
    unit: 'requests/sec',
    frequency: 'realtime',
    dataSource: 'System monitoring'
  },
  latency: {
    name: 'System Latency',
    current: 0,
    target: 100,
    unit: 'ms',
    frequency: 'realtime',
    dataSource: 'System monitoring'
  },
  error_rate: {
    name: 'Error Rate',
    current: 0,
    target: 1,
    unit: '%',
    frequency: 'hourly',
    dataSource: 'Error tracking system'
  }
} as const;

const TOOLTIPS = {
  weight: {
    title: 'Goal Weight',
    description: 'Represents the relative importance of this goal compared to other goals. A weight of 1.0 means highest priority, while lower values indicate less critical goals.',
    examples: [
      '1.0: Critical business objective',
      '0.7: Important but not critical',
      '0.3: Nice to have'
    ]
  },
  contributionWeight: {
    title: 'Solution Contribution Weight',
    description: 'Indicates how much this solution is expected to contribute to the goal achievement. For AI-driven solutions, this weight may be adjusted automatically based on model performance and impact analysis.',
    examples: [
      '1.0: Primary solution',
      '0.5: Supporting solution',
      '0.2: Minor contribution'
    ]
  },
  metrics: {
    title: 'Goal Metrics',
    description: 'Measurable indicators of goal progress. For AI solutions, these metrics may be automatically tracked and updated based on model performance, data analysis, and real-world impact.',
    examples: [
      'Model Accuracy: Current vs Target accuracy',
      'Processing Time: Speed improvements',
      'User Adoption: Usage statistics',
      'Business Impact: Revenue or cost metrics'
    ]
  }
};

interface GoalFormProps {
  goal?: ImpactGoal;
  parentGoal?: ImpactGoal;
  onSubmit: (data: Partial<ImpactGoal>, deploy?: boolean) => void;
  onCancel: () => void;
}

type MetricTemplate = keyof typeof METRIC_TEMPLATES;

export default function GoalForm({ goal, parentGoal, onSubmit, onCancel }: GoalFormProps) {
  const { control, handleSubmit, watch, setValue } = useForm<GoalFormData>({
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline.split('T')[0],
      teamMembers: goal.teamMembers || [],
      weight: goal.weight,
      solutions: goal.solutions?.map(s => ({
        ...s,
        contributionPercentage: s.contributionWeight * 100,
        metrics: Array.isArray(s.metrics) ? s.metrics : 
          Object.entries(s.metrics || {}).map(([_, metric]) => ({
            ...metric,
            direction: metric.unit === 'minutes' || metric.unit === 'ms' || metric.unit === 'seconds' || 
                      metric.unit.toLowerCase().includes('error') || metric.unit.toLowerCase().includes('latency')
              ? 'decrease' as const
              : 'increase' as const
          }))
      })) || [],
      dependencies: goal.dependencies?.map(d => ({
        ...d,
        relationshipType: d.relationshipType as 'blocks' | 'enables' | 'influences'
      })) || []
    } : {
      title: '',
      description: '',
      deadline: '',
      teamMembers: [],
      weight: 1.0,
      solutions: [],
      dependencies: []
    }
  });

  const handleFormSubmit = (data: GoalFormData) => {
    onSubmit({
      ...data,
      solutions: data.solutions?.map(solution => ({
        ...solution,
        contributionPercentage: solution.contributionWeight * 100
      }))
    });
  };

  const watchedSolutions = watch('solutions');

  const handleAddSolution = () => {
    setValue('solutions', [
      ...watchedSolutions,
      {
        solutionId: '',
        contributionWeight: 1.0,
        contributionPercentage: 0,
        metrics: []
      }
    ]);
  };

  const handleRemoveSolution = (index: number) => {
    setValue('solutions', watchedSolutions.filter((_, i) => i !== index));
  };

  const handleAddMetric = (solutionIndex: number) => {
    const solutions = [...watchedSolutions];
    const metrics = solutions[solutionIndex].metrics || [];
    solutions[solutionIndex].metrics = [
      ...metrics,
      {
        name: '',
        current: 0,
        target: 0,
        unit: '',
        direction: 'increase',
        frequency: 'daily',
        dataSource: ''
      }
    ];
    setValue('solutions', solutions);
  };

  const handleMetricTemplate = (templateName: MetricTemplate, solution: Solution, index: number) => {
    const template = METRIC_TEMPLATES[templateName];
    const metrics = solution.metrics || [];
    setValue(`solutions.${index}.metrics`, [
      ...metrics,
      { ...template }
    ]);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-20">
      {parentGoal && (
        <div className="bg-indigo-50 rounded-lg p-4 flex items-start">
          <Flag className="w-5 h-5 text-indigo-500 mt-1" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-indigo-800">Parent Goal</h4>
            <p className="mt-1 text-sm text-indigo-600">{parentGoal.title}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Controller
          name="title"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Deadline</label>
          <Controller
            name="deadline"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...field}
                  type="date"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                />
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight</label>
          <div className="mt-1 text-sm text-gray-500 flex items-center">
            <Tooltip
              content={
                <div className="max-w-xs space-y-2 text-gray-700">
                  <p className="font-medium">{TOOLTIPS.weight.title}</p>
                  <p>{TOOLTIPS.weight.description}</p>
                  <div className="mt-2">
                    <p className="font-medium mb-1">Examples:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {TOOLTIPS.weight.examples.map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              }
            >
              <HelpCircle className="w-4 h-4 text-gray-600 hover:text-gray-700 cursor-help" />
            </Tooltip>
          </div>
          <Controller
            name="weight"
            control={control}
            rules={{ required: true, min: 0, max: 1 }}
            render={({ field }) => (
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...field}
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                />
              </div>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Team Members</label>
        <Controller
          name="teamMembers"
          control={control}
          render={({ field }) => (
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...field}
                type="text"
                placeholder="Enter team member names, separated by commas"
                className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                value={field.value?.join(', ') || ''}
              />
            </div>
          )}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Contributing Solutions</label>
          <button
            type="button"
            onClick={handleAddSolution}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Add Solution
          </button>
        </div>
        
        <div className="space-y-4">
          {watchedSolutions.map((solution, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Controller
                    name={`solutions.${index}.solutionId`}
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                          {...field}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                        >
                          <option value="">Select Solution</option>
                          {solutions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSolution(index)}
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  Remove
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Contribution Weight</label>
                <div className="mt-1 text-sm text-gray-500 flex items-center">
                  <Tooltip
                    content={
                      <div className="max-w-xs space-y-2">
                        <p className="font-medium">{TOOLTIPS.contributionWeight.title}</p>
                        <p>{TOOLTIPS.contributionWeight.description}</p>
                        <div className="mt-2">
                          <p className="font-medium mb-1">Examples:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {TOOLTIPS.contributionWeight.examples.map((example) => (
                              <li key={example}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    }
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
                <Controller
                  name={`solutions.${index}.contributionWeight`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                    />
                  )}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Metrics</label>
                  <div className="flex items-center space-x-2">
                    <Tooltip
                      content={
                        <div className="max-w-xs space-y-2">
                          <p className="font-medium">{TOOLTIPS.metrics.title}</p>
                          <p>{TOOLTIPS.metrics.description}</p>
                          <div className="mt-2">
                            <p className="font-medium mb-1">Examples:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {TOOLTIPS.metrics.examples.map((example) => (
                                <li key={example}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      }
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-500 cursor-help" />
                    </Tooltip>
                  <div className="flex items-center space-x-4">
                    <select
                      onChange={(e) => {
                        if (!e.target.value) return;
                        handleMetricTemplate(e.target.value as MetricTemplate, solution, index);
                      }}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select Template</option>
                      {Object.entries(METRIC_TEMPLATES).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddMetric(index)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Custom Metric
                    </button>
                  </div>
                  </div>
                </div>
                {solution.metrics.map((_, metricIndex) => (
                  <div key={metricIndex} className="border border-gray-100 rounded-lg p-4 mb-4 bg-gray-50 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const metrics = [...solution.metrics];
                        metrics.splice(metricIndex, 1);
                        setValue(`solutions.${index}.metrics`, metrics);
                      }}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                    <Controller
                      name={`solutions.${index}.metrics.${metricIndex}.name`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Metric Name</label>
                          <input
                            {...field}
                            placeholder="e.g., Model Accuracy"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name={`solutions.${index}.metrics.${metricIndex}.frequency`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Measurement Frequency</label>
                          <select
                            {...field}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                          >
                            <option value="realtime">Real-time</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                    <Controller
                      name={`solutions.${index}.metrics.${metricIndex}.current`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Current Value</label>
                          <input
                            {...field}
                            type="number"
                            step="any"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name={`solutions.${index}.metrics.${metricIndex}.target`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Target Value</label>
                          <input
                            {...field}
                            type="number"
                            step="any"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name={`solutions.${index}.metrics.${metricIndex}.unit`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
                          <input
                            {...field}
                            placeholder="e.g., %, ms, users"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                          />
                        </div>
                      )}
                    />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Controller
                        name={`solutions.${index}.metrics.${metricIndex}.dataSource`}
                        control={control}
                        render={({ field }) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Data Source</label>
                            <input
                              {...field}
                              placeholder="e.g., Model evaluation pipeline, User analytics, System monitoring"
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Dependencies</label>
          <button
            type="button"
            onClick={() => {
              const dependencies = watch('dependencies') || [];
              setValue('dependencies', [
                ...dependencies,
                {
                  goalId: '',
                  relationshipType: 'influences',
                  impactWeight: 1.0
                }
              ]);
            }}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Add Dependency
          </button>
        </div>

        <div className="space-y-4">
          {watch('dependencies')?.map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name={`dependencies.${index}.goalId`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <GitBranch className="h-5 w-5 text-gray-400 mr-2" />
                      <select
                        {...field}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                      >
                        <option value="">Select Goal</option>
                        {/* Add goal options here */}
                      </select>
                    </div>
                  )}
                />
                <Controller
                  name={`dependencies.${index}.relationshipType`}
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                    >
                      <option value="blocks">Blocks</option>
                      <option value="enables">Enables</option>
                      <option value="influences">Influences</option>
                    </select>
                  )}
                />
                <Controller
                  name={`dependencies.${index}.impactWeight`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="Impact Weight"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end space-x-3 shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <div className="relative">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit((data) => handleFormSubmit(data))}
            className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Save and Deploy
          </button>
        </div>
      </div>
    </form>
  );
}