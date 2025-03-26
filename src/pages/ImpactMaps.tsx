import React, { useState } from 'react';
import { goals, stakeholders, impacts, deliverables } from '../data/seed';
import StatusBadge from '../components/StatusBadge';
import { ChevronDown, ChevronRight, Plus, TrendingUp, Lightbulb, Gauge, MessageSquare, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CommentSection from '../components/CommentSection';
import FeedbackDialog from '../components/FeedbackDialog';

export default function ImpactMaps() {
  const [expandedGoals, setExpandedGoals] = useState<string[]>([goals[0].id]);
  const [showScenarios, setShowScenarios] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: 'goal' | 'impact' | 'deliverable';
    title: string;
  } | null>(null);

  const toggleGoal = (goalId: string) => {
    setExpandedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const toggleScenarios = (impactId: string) => {
    setShowScenarios((prev) =>
      prev.includes(impactId) ? prev.filter((id) => id !== impactId) : [...prev, impactId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Impact Maps</h2>
        <div className="flex space-x-4">
          <FeedbackDialog />
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            New Impact Map
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {goals.map((goal) => {
          const isExpanded = expandedGoals.includes(goal.id);
          const goalStakeholders = stakeholders.filter((stakeholder) => stakeholder.goalId === goal.id);

          return (
            <div key={goal.id} className="border-b border-gray-200 last:border-b-0">
              {/* Goal Header */}
              <button
                onClick={() => toggleGoal(goal.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{goal.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({
                          id: goal.id,
                          type: 'goal',
                          title: goal.title,
                        });
                      }}
                      className="mt-2 inline-flex items-center text-sm text-black hover:text-gray-800"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuss
                    </button>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      {goal.lastUpdated && (
                        <span>Updated: {new Date(goal.lastUpdated).toLocaleDateString()}</span>
                      )}
                    </div>
                    {goal.teamMembers && goal.teamMembers.length > 0 && (
                      <div className="mt-2 flex items-center space-x-2">
                        {goal.teamMembers.map((member) => (
                          <span
                            key={member}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <StatusBadge status={goal.status} />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6">
                  {goalStakeholders.map((stakeholder) => {
                    const stakeholderImpacts = impacts.filter((impact) => impact.actorId === stakeholder.id);

                    return (
                      <div key={stakeholder.id} className="ml-8 mt-4">
                        {/* Stakeholder */}
                        <div className="flex items-center">
                          <div className="w-32 py-2 px-4 bg-blue-50 rounded-lg text-sm font-medium text-blue-700">
                            {stakeholder.name}
                          </div>
                          {stakeholder.role && (
                            <span className="ml-4 text-sm text-gray-500">
                              Role: {stakeholder.role}
                            </span>
                          )}
                          {stakeholder.contactInfo && (
                            <span className="ml-4 text-sm text-gray-500">
                              Contact: {stakeholder.contactInfo}
                            </span>
                          )}
                          <div className="flex-1 h-px bg-gray-200 mx-4" />
                        </div>

                        {/* Impacts */}
                        {stakeholderImpacts.map((impact) => {
                          const impactDeliverables = deliverables.filter(
                            (d) => d.impactId === impact.id
                          );

                          return (
                            <div key={impact.id} className="ml-8 mt-4">
                              <div className="flex items-center">
                                <div
                                  className={`w-48 py-2 px-4 rounded-lg text-sm font-medium ${
                                    impact.status === 'positive'
                                      ? 'bg-green-50 text-green-700'
                                      : impact.status === 'negative'
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{impact.title}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEntity({
                                          id: impact.id,
                                          type: 'impact',
                                          title: impact.title,
                                        });
                                      }}
                                      className="ml-2 inline-flex items-center text-sm hover:opacity-75"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 h-px bg-gray-200 mx-4" />
                              </div>

                              {/* Deliverables */}
                              {impactDeliverables.map((deliverable) => (
                                <div key={deliverable.id} className="ml-8 mt-4">
                                  <div className="flex items-center">
                                    <div className="w-64 py-2 px-4 bg-purple-50 rounded-lg text-sm font-medium text-purple-700">
                                      {deliverable.title}
                                    </div>
                                    {deliverable.assignee && (
                                      <span className="ml-4 text-sm text-gray-500">
                                        Assigned to: {deliverable.assignee}
                                      </span>
                                    )}
                                    <StatusBadge
                                      status={deliverable.status}
                                      className="ml-4"
                                    />
                                    <StatusBadge
                                      status={deliverable.priority}
                                      className="ml-2"
                                    />
                                    {deliverable.dueDate && (
                                      <span className="ml-4 text-sm text-gray-500">
                                        Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEntity({
                                          id: deliverable.id,
                                          type: 'deliverable',
                                          title: deliverable.title,
                                        });
                                      }}
                                      className="ml-2 inline-flex items-center text-sm text-purple-600 hover:text-purple-500"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      Discuss
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {/* Impact Metrics */}
                              {impact.metrics && (
                                <div className="ml-8 mt-2 grid grid-cols-2 gap-4">
                                  {impact.metrics.map((metric) => (
                                    <div key={metric.name} className="text-sm">
                                      <span className="font-medium">{metric.name}: </span>
                                      <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                          <Gauge className="w-4 h-4 text-gray-400" />
                                          <span className="text-gray-600">
                                            Current: {metric.value} / Target: {metric.target}
                                          </span>
                                        </div>
                                        {metric.trend && metric.forecast && (
                                          <div className="mt-2 h-24">
                                            <ResponsiveContainer width="100%" height="100%">
                                              <LineChart
                                                data={[
                                                  ...metric.trend.map((value, i) => ({
                                                    value,
                                                    type: 'Historical',
                                                    index: i,
                                                  })),
                                                  ...metric.forecast.map((value, i) => ({
                                                    value,
                                                    type: 'Forecast',
                                                    index: metric.trend.length + i,
                                                  })),
                                                ]}
                                              >
                                                <XAxis dataKey="index" hide />
                                                <YAxis domain={['auto', 'auto']} hide />
                                                <Tooltip />
                                                <Line
                                                  type="monotone"
                                                  dataKey="value"
                                                  stroke="#4F46E5"
                                                  strokeWidth={2}
                                                  dot={false}
                                                />
                                              </LineChart>
                                            </ResponsiveContainer>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Scenarios and Recommendations */}
                              {impact.scenarios && (
                                <div className="ml-8 mt-4">
                                  <button
                                    onClick={() => toggleScenarios(impact.id)}
                                    className="flex items-center text-sm font-medium text-black hover:text-gray-800"
                                  >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    View Scenarios & Recommendations
                                  </button>
                                  {showScenarios.includes(impact.id) && (
                                    <div className="mt-4 space-y-4">
                                      {impact.scenarios.map((scenario) => (
                                        <div
                                          key={scenario.id}
                                          className="bg-white rounded-lg border border-gray-200 p-4"
                                        >
                                          <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">
                                              {scenario.name}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                              Probability: {scenario.probability * 100}%
                                            </span>
                                          </div>
                                          <p className="mt-1 text-sm text-gray-600">
                                            {scenario.description}
                                          </p>
                                          <div className="mt-4">
                                            <div className="flex items-center mb-2">
                                              <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                                              <span className="text-sm font-medium text-gray-900">
                                                Recommendations
                                              </span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1">
                                              {scenario.recommendations.map((rec, index) => (
                                                <li key={index} className="text-sm text-gray-600">
                                                  {rec}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Comments Dialog */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEntity(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Discussion: {selectedEntity.title}
                </h3>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <CommentSection
                entityId={selectedEntity.id}
                entityType={selectedEntity.type}
                entityTitle={selectedEntity.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
