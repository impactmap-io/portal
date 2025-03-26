import React from 'react';
import { Calendar, Users, Package, TrendingUp, GitBranch, X } from 'lucide-react';
import { solutions } from '../data/seed';
import type { ImpactGoal } from '../types';
import StatusBadge from './StatusBadge';
import CommentSection from './CommentSection';

interface GoalDetailsProps {
  goal: ImpactGoal;
  onClose: () => void;
  onEdit: () => void;
}

export default function GoalDetails({ goal, onClose, onEdit }: GoalDetailsProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999] overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] my-[5vh] overflow-hidden flex flex-col" style={{ margin: '5vh 0' }}>
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-semibold text-gray-900">{goal.title}</h2>
              <StatusBadge status={goal.status} />
            </div>
            <p className="mt-1 text-gray-500">{goal.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Key Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </div>
                {goal.teamMembers && goal.teamMembers.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Team: {goal.teamMembers.join(', ')}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Progress: {Math.round(goal.progress * 100)}%
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(goal.progress * 100)}%` }}
                  />
                </div>
              </div>

              {/* Dependencies */}
              {goal.dependencies && goal.dependencies.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Dependencies</h3>
                  <div className="space-y-3">
                    {goal.dependencies.map((dep) => (
                      <div
                        key={dep.goalId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <GitBranch className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{dep.relationshipType}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Impact Weight: {dep.impactWeight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contributing Solutions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contributing Solutions</h3>
              <div className="space-y-4">
                {goal.solutions?.map((solution) => {
                  const solutionDetails = solutions.find(s => s.id === solution.solutionId);
                  return (
                    <div key={solution.solutionId} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{solutionDetails?.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Weight: {solution.contributionWeight}
                        </span>
                      </div>
                      {Object.entries(solution.metrics).map(([key, metric]) => (
                        <div key={key} className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{key}</span>
                            <span className="text-gray-900">
                              {metric.current} / {metric.target} {metric.unit}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((metric.current / metric.target) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <CommentSection
              entityId={goal.id}
              entityType="goal"
              entityTitle={goal.title}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
            >
              Edit Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
