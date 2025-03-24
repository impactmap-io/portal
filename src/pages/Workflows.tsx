import React, { useState } from 'react';
import { GitBranch, Plus, Search, Filter, Play, Pause, CheckCircle, XCircle, Clock, Activity, BarChart3 } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { useSolutionStore } from '../store/solutionStore';
import StatusBadge from '../components/StatusBadge';

export default function Workflows() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('active');
  const [search, setSearch] = useState('');
  const { workflows, events, getWorkflowMetrics } = useWorkflowStore();
  const { activeSolutionId } = useSolutionStore();

  const filteredWorkflows = workflows
    .filter((workflow) => {
      const matchesSolution = !activeSolutionId || workflow.solutionId === activeSolutionId;
      const matchesFilter = filter === 'all' || workflow.status === filter;
      const matchesSearch = 
        workflow.name.toLowerCase().includes(search.toLowerCase()) ||
        workflow.description.toLowerCase().includes(search.toLowerCase());
      return matchesSolution && matchesFilter && matchesSearch;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <GitBranch className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Workflows</h2>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="max-w-xs flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredWorkflows.map((workflow) => {
            const metrics = getWorkflowMetrics(workflow.id);
            const recentEvents = events
              .filter((e) => e.workflowId === workflow.id)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 3);

            return (
              <div key={workflow.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={workflow.status} />
                    {workflow.status === 'active' ? (
                      <button className="p-2 text-gray-400 hover:text-gray-500">
                        <Pause className="w-5 h-5" />
                      </button>
                    ) : (
                      <button className="p-2 text-gray-400 hover:text-gray-500">
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Completion Rate</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {Math.round(metrics.completionRate)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Avg Duration</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {Math.round(metrics.averageDuration)}m
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Active Steps</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {metrics.activeSteps}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Total Events</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {metrics.totalEvents}
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Steps</h4>
                  <div className="mt-2 space-y-3">
                    {workflow.steps.map((step) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex-shrink-0">
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : step.status === 'failed' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{step.name}</p>
                            <StatusBadge status={step.status} />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Events */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Recent Events</h4>
                  <div className="mt-2 space-y-3">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center text-sm">
                        <Activity className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {event.actor}
                        </span>
                        <span className="mx-2 text-gray-500">
                          {event.type}
                        </span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}