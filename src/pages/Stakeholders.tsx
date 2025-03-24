import React, { useState } from 'react';
import { Users, UserPlus, Mail, Phone, Building2, Tag, Search, Filter, MoreVertical } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { stakeholders, impacts } from '../data/seed';
import CommentSection from '../components/CommentSection';
import FeedbackDialog from '../components/FeedbackDialog';

type StakeholderFilter = 'all' | 'investor' | 'partner' | 'end-user' | 'team' | 'community';
type EngagementLevel = 'high' | 'medium' | 'low';

interface StakeholderDetailsProps {
  stakeholder: typeof stakeholders[0];
  onClose: () => void;
}

function StakeholderDetails({ stakeholder, onClose }: StakeholderDetailsProps) {
  const stakeholderImpacts = impacts.filter((impact) => impact.actorId === stakeholder.id);
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{stakeholder.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{stakeholder.description}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <MoreVertical className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Building2 className="w-4 h-4 mr-2" />
                <span>Type: {stakeholder.type}</span>
              </div>
              {stakeholder.role && (
                <div className="flex items-center text-sm text-gray-500">
                  <Tag className="w-4 h-4 mr-2" />
                  <span>Role: {stakeholder.role}</span>
                </div>
              )}
              {stakeholder.contactInfo && (
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Contact: {stakeholder.contactInfo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Impact Analysis</h4>
            <div className="space-y-4">
              {stakeholderImpacts.map((impact) => (
                <div key={impact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{impact.title}</h5>
                    <p className="mt-1 text-sm text-gray-500">{impact.description}</p>
                  </div>
                  <StatusBadge status={impact.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <CommentSection
              entityId={stakeholder.id}
              entityType="goal"
              entityTitle={stakeholder.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Stakeholders() {
  const [filter, setFilter] = useState<StakeholderFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState<typeof stakeholders[0] | null>(null);

  const filteredStakeholders = stakeholders.filter((stakeholder) => {
    const matchesFilter = filter === 'all' || stakeholder.type === filter;
    const matchesSearch = stakeholder.name.toLowerCase().includes(search.toLowerCase()) ||
      stakeholder.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEngagementLevel = (actorId: string): EngagementLevel => {
    const actorImpacts = impacts.filter((impact) => impact.actorId === actorId);
    const positiveImpacts = actorImpacts.filter((i) => i.status === 'positive').length;
    const totalImpacts = actorImpacts.length;
    
    if (totalImpacts === 0) return 'low';
    const ratio = positiveImpacts / totalImpacts;
    if (ratio > 0.7) return 'high';
    if (ratio > 0.3) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Stakeholders</h2>
        </div>
        <div className="flex space-x-4">
          <FeedbackDialog />
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Stakeholder
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
                  placeholder="Search stakeholders..."
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
                onChange={(e) => setFilter(e.target.value as StakeholderFilter)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="investor">Investor</option>
                <option value="partner">Partner</option>
                <option value="end-user">End User</option>
                <option value="team">Team</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStakeholders.map((stakeholder) => {
            const engagementLevel = stakeholder.engagementLevel || getEngagementLevel(stakeholder.id);
            const stakeholderImpacts = impacts.filter((impact) => impact.actorId === stakeholder.id);
            const positiveImpacts = stakeholderImpacts.filter((i) => i.status === 'positive').length;
            const negativeImpacts = stakeholderImpacts.filter((i) => i.status === 'negative').length;

            return (
              <div
                key={stakeholder.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStakeholder(stakeholder)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{stakeholder.name}</h3>
                  <StatusBadge
                    status={engagementLevel}
                    className="capitalize"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">{stakeholder.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="capitalize">{stakeholder.type.replace('-', ' ')}</span>
                  </div>
                  {stakeholder.role && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>{stakeholder.role}</span>
                    </div>
                  )}
                  {stakeholder.contactInfo && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{stakeholder.contactInfo}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <div className="text-green-600">
                      +{positiveImpacts} impacts
                    </div>
                    <div className="text-red-600">
                      -{negativeImpacts} impacts
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedStakeholder && (
        <StakeholderDetails
          stakeholder={selectedStakeholder}
          onClose={() => setSelectedStakeholder(null)}
        />
      )}
    </div>
  );
}