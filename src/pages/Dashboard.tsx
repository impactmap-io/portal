import React from 'react';
import { BarChart3, Users, Target, Package } from 'lucide-react';
import { goals, stakeholders, impacts, deliverables, solutions } from '../data/seed';
import StatusBadge from '../components/StatusBadge';
import { useSolutionStore } from '../store/solutionStore';

export default function Dashboard() {
  const { activeSolutionId } = useSolutionStore();

  const filteredGoals = goals.filter(goal => 
    !activeSolutionId || goal.solutionId === activeSolutionId
  );

  const stats = [
    { label: 'Active Goals', value: filteredGoals.length, icon: Target, color: 'bg-blue-500' },
    { label: 'Solutions', value: solutions.length, icon: Package, color: 'bg-purple-500' },
    { label: 'Stakeholders', value: stakeholders.length, icon: Users, color: 'bg-green-500' },
    { label: 'Impacts', value: impacts.length, icon: BarChart3, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-lg shadow-card hover:shadow-card-hover p-6 border border-divider transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Goals */}
      <div className="bg-card rounded-lg shadow-card border border-divider">
        <div className="p-6 border-b border-divider bg-white">
          <h2 className="text-lg font-medium text-gray-900">
            {activeSolutionId ? 'Solution Goals' : 'All Goals'}
          </h2>
        </div>
        <div className="divide-y divide-divider">
          {filteredGoals.map((goal) => (
            <div key={goal.id} className="p-6 hover:bg-card-hover transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{goal.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                </div>
                <StatusBadge status={goal.status} />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-1" />
                <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deliverables */}
      <div className="bg-card rounded-lg shadow-card border border-divider">
        <div className="p-6 border-b border-divider bg-white">
          <h2 className="text-lg font-medium text-gray-900">Active Deliverables</h2>
        </div>
        <div className="divide-y divide-divider">
          {deliverables.filter(d => d.status === 'in-progress').map((deliverable) => (
            <div key={deliverable.id} className="p-6 hover:bg-card-hover transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{deliverable.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{deliverable.description}</p>
                </div>
                <div className="flex space-x-2">
                  <StatusBadge status={deliverable.priority} />
                  <StatusBadge status={deliverable.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}