import { useState } from 'react';
import { Flag, Plus, Calendar, Users, TrendingUp, Search, Filter, Package, HelpCircle } from 'lucide-react';
import { useSolutionStore } from '../store/solutionStore';
import { useGoalStore } from '../store/goalStore';
import Tooltip from '../components/Tooltip';
import GoalForm from '../components/GoalForm';
import GoalDetails from '../components/GoalDetails';
import StatusBadge from '../components/StatusBadge';
import FeedbackDialog from '../components/FeedbackDialog';
import type { ImpactGoal } from '../types';

export default function Goals() {
  const [selectedGoal, setSelectedGoal] = useState<ImpactGoal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ImpactGoal | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { solutions, activeSolutionId } = useSolutionStore();
  const { goals, addGoal, updateGoal } = useGoalStore();

  const filteredGoals = goals.filter((goal) => {
    const matchesFilter = filter === 'all' || goal.status === filter;
    const matchesSearch = 
      goal.title.toLowerCase().includes(search.toLowerCase()) ||
      goal.description.toLowerCase().includes(search.toLowerCase());
    const matchesSolution = !activeSolutionId || 
      goal.solutions?.some(s => s.solutionId === activeSolutionId);
    return matchesFilter && matchesSearch && matchesSolution;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Flag className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Goals</h2>
        </div>
        <div className="flex space-x-4">
          <FeedbackDialog />
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="max-w-xs flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <p className="text-sm text-gray-500">{goal.description}</p>
                    {goal.contractId && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Contract
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={goal.status} />
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </div>
                {goal.solutions && goal.solutions.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Package className="w-4 h-4 mr-2" />
                    <div className="relative">
                      <Tooltip
                        content={
                          <div className="space-y-2">
                            <p className="font-medium">Contributing Solutions</p>
                            <ul className="space-y-1">
                              {goal.solutions.map((solution) => {
                                const solutionDetails = solutions.find(s => s.id === solution.solutionId);
                                return (
                                  <li key={solution.solutionId} className="flex items-center justify-between">
                                    <span>{solutionDetails?.name}</span>
                                    <span className="ml-4 text-gray-400">
                                      {Math.round(solution.contributionPercentage * solution.contributionWeight * 100)}%
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        }
                      >
                        <span>
                          {goal.solutions.length} contributing {goal.solutions.length === 1 ? 'solution' : 'solutions'}
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                )}
                {goal.teamMembers && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    {goal.teamMembers.length} team members
                  </div>
                )}
                {goal.progress > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {Math.round(goal.progress * 100)}% complete
                  </div>
                )}
              </div>
              {goal.solutions && goal.solutions.length > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{ width: `${Math.round(goal.progress * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-2">
                    {goal.solutions.map((solution) => (
                      <div key={solution.solutionId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          {solutions.find(s => s.id === solution.solutionId)?.name}
                          <Tooltip
                            content={
                              <div className="space-y-2">
                                <p className="font-medium">Metric Progress</p>
                                <ul className="space-y-1">
                                  {Object.entries(solution.metrics).map(([key, metric]) => {
                                    const isInverse = metric.unit === 'minutes' || metric.unit === 'ms' || metric.unit === 'seconds';
                                    return (
                                      <li key={key} className="flex items-center justify-between">
                                        <span>{key}</span>
                                        <span className="ml-4">
                                          {metric.current} / {metric.target} {metric.unit}
                                          {isInverse && <span className="text-gray-400 ml-1">(lower is better)</span>}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            }
                          >
                            <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                          </Tooltip>
                        </div>
                        <div className="text-gray-500">
                          {Math.round(solution.contributionPercentage * solution.contributionWeight * 100)}% contribution
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isCreating && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] overflow-hidden" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] my-[5vh] overflow-hidden flex flex-col" style={{ margin: '5vh 0' }}>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Create New Goal</h3>
              </div>
              <GoalForm
                onSubmit={(data, deploy) => {
                  // Validate the required fields before adding
                  if (data.title && data.description && data.deadline && typeof data.weight === 'number') {
                    addGoal({
                      title: data.title,
                      description: data.description,
                      deadline: data.deadline,
                      weight: data.weight,
                      ...data
                    });
                    setIsCreating(false);
                    if (deploy) {
                      // Add logic to deploy the goal
                    }
                  }
                }}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedGoal && (
        <GoalDetails
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onEdit={() => {
            setEditingGoal(selectedGoal);
            setSelectedGoal(null);
          }}
        />
      )}
      
      {(isCreating || editingGoal) && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] overflow-hidden" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] my-[5vh] overflow-hidden flex flex-col" style={{ margin: '5vh 0' }}>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
              </div>
              <GoalForm
                goal={editingGoal || undefined}
                onSubmit={(data, deploy) => {
                  if (editingGoal) {
                    updateGoal(editingGoal.id, data);
                    setEditingGoal(null);
                    if (deploy) {
                      // Add logic to deploy the updated goal
                    }
                  } else if (data.title && data.description && data.deadline && typeof data.weight === 'number') {
                    addGoal({
                      title: data.title,
                      description: data.description,
                      deadline: data.deadline,
                      weight: data.weight,
                      ...data
                    });
                    setIsCreating(false);
                    if (deploy) {
                      // Add logic to deploy the goal
                    }
                  }
                }}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingGoal(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
