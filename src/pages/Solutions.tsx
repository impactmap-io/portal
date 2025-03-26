import React, { useState } from 'react';
import { Package, Plus, Users, Calendar, Search, Filter, Archive, Pencil, Check, X, Shield, Github, GitBranch, Map } from 'lucide-react';
import { useSolutionStore } from '../store/solutionStore';
import { useGithubStore } from '../store/githubStore';
import type { Solution } from '../types';
import RepositorySelector from '../components/RepositorySelector';
import TeamManagement from '../components/TeamManagement';
import SolutionRelationships from '../components/SolutionRelationships'; 
import SolutionMap from '../components/SolutionMap';

interface SolutionFormData {
  name: string;
  description: string;
  category: Solution['category'];
  repository?: {
    type: 'github' | 'gitlab' | 'bitbucket';
    url: string;
  };
}

const initialFormData: SolutionFormData = {
  name: '',
  description: '',
  category: 'product',
};

const REPO_TYPES = [
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'gitlab', name: 'GitLab (Coming Soon)', icon: GitBranch, disabled: true },
  { id: 'bitbucket', name: 'Bitbucket (Coming Soon)', icon: GitBranch, disabled: true },
];

// Helper function to format names
function formatName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function Solutions() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SolutionFormData>(initialFormData);
  const [isImportingRepo, setIsImportingRepo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<Solution['category'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showTeam, setShowTeam] = useState(false);
  const [teamSolution, setTeamSolution] = useState<Solution | null>(null);
  const [relationshipSolution, setRelationshipSolution] = useState<Solution | null>(null);
  const [showSolutionMap, setShowSolutionMap] = useState(false);

  const {
    solutions,
    addSolution,
    updateSolution,
    archiveSolution,
    updateCollaboration,
    updateDependency,
    updateIntegration,
    removeCollaboration,
    removeDependency,
    removeIntegration,
    addCollaboration,
    addDependency,
    addIntegration,
    addVersion,
  } = useSolutionStore();

  const filteredSolutions = solutions.filter((solution) => {
    const matchesFilter = filter === 'all' || solution.status === filter;
    const matchesCategory = categoryFilter === 'all' || solution.category === categoryFilter;
    const matchesSearch = 
      solution.name.toLowerCase().includes(search.toLowerCase()) ||
      solution.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch && matchesCategory;
  });

  const categoryInfo = {
    product: {
      description: 'Standalone applications solving specific user needs',
      examples: 'Mobile apps, desktop software, web applications',
      impactAreas: ['User experience', 'Direct business value', 'Market adoption']
    },
    platform: {
      description: 'Foundation systems that other solutions build upon',
      examples: 'API platforms, ML infrastructure, data lakes',
      impactAreas: ['System performance', 'Developer productivity', 'Platform scalability']
    },
    service: {
      description: 'Ongoing operational capabilities combining software and expertise',
      examples: 'Managed services, consulting platforms, expert systems',
      impactAreas: ['Service quality', 'Customer satisfaction', 'Operational efficiency']
    },
    integration: {
      description: 'Connectors enabling seamless data flow and system interoperability',
      examples: 'Data pipelines, API connectors, protocol adapters',
      impactAreas: ['Data accuracy', 'Process automation', 'Cross-system efficiency']
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSolutionId) {
      updateSolution(editingSolutionId, {
        ...formData,
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
      setEditingSolutionId(null);
    } else {
      addSolution({
        ...formData,
        status: 'active',
      });
      setIsCreating(false);
    }
    
    setFormData(initialFormData);
  };

  const startEditing = (solution: Solution) => {
    setEditingSolutionId(solution.id);
    setFormData({
      name: solution.name,
      description: solution.description,
      category: solution.category,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Solutions</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSolutionMap(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Map className="w-4 h-4 mr-2" />
            Solution Map
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Solution
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="max-w-xs flex-1">
              <div className="relative rounded-md shadow-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search solutions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as Solution['category'] | 'all')}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="product">Products</option>
                <option value="platform">Platforms</option>
                <option value="service">Services</option>
                <option value="integration">Integrations</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Category Info */}
        {categoryFilter !== 'all' && (
          <div className="mb-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-900 capitalize">{categoryFilter} Solutions</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-indigo-700">{categoryInfo[categoryFilter].description}</p>
              <p className="text-sm text-black">Examples: {categoryInfo[categoryFilter].examples}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-indigo-800 font-medium">Impact Areas:</span>
                {categoryInfo[categoryFilter].impactAreas.map((area) => (
                  <span key={area} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Solution Form Modal */}
        {(isCreating || editingSolutionId) && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingSolutionId ? 'Edit Solution' : 'Create New Solution'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingSolutionId(null);
                      setFormData(initialFormData);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex justify-center mb-6 space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsImportingRepo(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      !isImportingRepo
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Manual Creation
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportingRepo(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isImportingRepo
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Import from Git
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isImportingRepo && (
                    <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Repository Type</label>
                        <div className="mt-2 flex space-x-4">
                          {REPO_TYPES.map(({ id, name, icon: Icon, disabled }) => (
                            <button
                              key={id}
                              type="button"
                              disabled={disabled}
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                repository: { ...prev.repository, type: id as any }
                              }))}
                              className={`flex items-center px-4 py-2 rounded-md ${
                                disabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                  : formData.repository?.type === id
                                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                  : 'bg-white text-gray-700 border-gray-200'
                              } border`}
                            >
                              <Icon className="w-5 h-5 mr-2" />
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <RepositorySelector
                        onSelect={(repo) => {
                          setFormData(prev => ({
                            ...prev,
                            repository: {
                              type: 'github',
                              url: `https://github.com/${repo.fullName}`,
                            }
                          }));
                        }}
                        onInstallApp={() => {
                          // This will be handled by your GitHub App installation flow
                          window.location.href = '/api/github/install';
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Solution['category'] })}
                      className="mt-1 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500 sm:text-sm group"
                    >
                      <option value="product">Product - Standalone Application</option>
                      <option value="platform">Platform - Foundation System</option>
                      <option value="service">Service - Operational Capability</option>
                      <option value="integration">Integration - Solution Connector</option>
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.category && categoryInfo[formData.category].description}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingSolutionId(null);
                        setFormData(initialFormData);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingSolutionId ? 'Update' : 'Create'} Solution
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredSolutions.map((solution) => (
            <div
              key={solution.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{solution.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{solution.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditing(solution)}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setTeamSolution(solution);
                      setShowTeam(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setRelationshipSolution(solution)}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <Package className="w-5 h-5" />
                  </button>
                  {solution.status === 'active' && (
                    <button
                      onClick={() => archiveSolution(solution.id)}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="capitalize">{solution.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  {(solution.team?.length || 0) + 1} team members
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Updated {new Date(solution.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Repository Information */}
              {solution.repository && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center">
                    {solution.repository.type === 'github' ? (
                      <Github className="w-5 h-5 text-gray-700" />
                    ) : solution.repository.type === 'gitlab' ? (
                      <GitBranch className="w-5 h-5 text-orange-600" />
                    ) : (
                      <GitBranch className="w-5 h-5 text-blue-600" />
                    )}
                    <a
                      href={solution.repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-gray-900 hover:text-black"
                    >
                      {solution.repository.url.split('/').slice(-2).join('/')}
                    </a>
                  </div>
                  {solution.repository.lastCommit && (
                    <div className="mt-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <span className="font-mono">{solution.repository.lastCommit.id.slice(0, 7)}</span>
                        <span className="mx-2">•</span>
                        <span>{solution.repository.lastCommit.message}</span>
                      </div>
                      <div className="mt-1 text-gray-400">
                        by {solution.repository.lastCommit.author} on {new Date(solution.repository.lastCommit.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {solution.owner?.name && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span key={solution.owner.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {formatName(solution.owner.name)} <Shield className="w-3 h-3 ml-1" />
                  </span>
                  {solution.team?.filter(member => member?.id && member?.name).map((member) => (
                    <span
                      key={member.id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-800'
                          : member.role === 'member'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatName(member.name)}
                      {member.role === 'admin' && <Shield className="w-3 h-3 ml-1" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Management Modal */}
      {showTeam && teamSolution && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {teamSolution.name} - Team Management
                </h3>
                <button
                  onClick={() => {
                    setShowTeam(false);
                    setTeamSolution(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <TeamManagement
                solution={teamSolution}
                onUpdateTeam={(team) => {
                  const [owner, ...members] = team;
                  updateSolution(teamSolution.id, {
                    owner,
                    team: members
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {relationshipSolution && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {relationshipSolution.name} - Relationships
                </h3>
                <button
                  onClick={() => setRelationshipSolution(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <SolutionRelationships
                solution={relationshipSolution}
                allSolutions={solutions}
                onAddCollaboration={addCollaboration}
                onAddDependency={addDependency}
                onAddIntegration={addIntegration}
                onUpdateCollaboration={updateCollaboration}
                onUpdateDependency={updateDependency}
                onUpdateIntegration={updateIntegration}
                onRemoveCollaboration={removeCollaboration}
                onRemoveDependency={removeDependency}
                onRemoveIntegration={removeIntegration}
                onAddVersion={addVersion}
              />
            </div>
          </div>
        </div>
      )}

      {/* Solution Map Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[90vw] max-w-7xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-hidden ${
          showSolutionMap ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Solution Map</h3>
            <button
              onClick={() => setShowSolutionMap(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <SolutionMap />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showSolutionMap && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
          onClick={() => setShowSolutionMap(false)}
        />
      )}
    </div>
  );
}
