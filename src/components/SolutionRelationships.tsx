import React, { useState } from 'react';
import { GitBranch, Package, Users, Plus, X } from 'lucide-react';
import type { Solution, SolutionCollaboration, SolutionDependency, SolutionIntegration, SolutionVersion } from '../types';
import { useSolutionStore } from '../store/solutionStore';

type TabType = 'collaborations' | 'dependencies' | 'integrations' | 'versions';

interface Props {
  solution: Solution;
  allSolutions: Solution[];
  onAddCollaboration: (collaboration: Partial<SolutionCollaboration>) => void;
  onAddDependency: (dependency: Partial<SolutionDependency>) => void;
  onAddIntegration: (integration: Partial<SolutionIntegration>) => void;
  onUpdateCollaboration: (id: string, updates: Partial<SolutionCollaboration>) => void;
  onUpdateDependency: (id: string, updates: Partial<SolutionDependency>) => void;
  onUpdateIntegration: (id: string, updates: Partial<SolutionIntegration>) => void;
  onRemoveCollaboration: (id: string, solutionId: string) => void;
  onRemoveDependency: (id: string, solutionId: string) => void;
  onRemoveIntegration: (id: string, solutionId: string) => void;
  onAddVersion: (version: Partial<SolutionVersion>) => void;
}

export default function SolutionRelationships({
  solution,
  allSolutions,
  onAddCollaboration,
  onAddDependency,
  onAddIntegration,
  onUpdateCollaboration,
  onUpdateDependency,
  onUpdateIntegration,
  onRemoveCollaboration,
  onRemoveDependency,
  onRemoveIntegration,
  onAddVersion
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('collaborations');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [removingItem, setRemovingItem] = useState<{ id: string; type: TabType; name: string; } | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { solutions, updateSolution } = useSolutionStore();

  const currentSolution = solutions.find(s => s.id === solution.id) || solution;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let newRelation: any = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    let updatedSolution = { ...currentSolution };
    
    switch (activeTab) {
      case 'collaborations':
        // Add required fields for SolutionCollaboration
        newRelation = {
          ...newRelation,
          sourceSolutionId: solution.id,
          targetSolutionId: formData.targetSolutionId || '',
          collaborationType: formData.collaborationType || 'default',
          flowType: formData.flowType || 'unidirectional',
          startDate: formData.startDate || new Date().toISOString()
        };
        await onAddCollaboration(newRelation);
        updatedSolution.collaborations = [...(updatedSolution.collaborations || []), newRelation];
        break;
      case 'dependencies':
        // Add required fields for SolutionDependency
        newRelation = {
          ...newRelation,
          dependentSolutionId: solution.id,
          dependencySolutionId: formData.dependencySolutionId || '',
          dependencyType: formData.dependencyType || 'default',
          flowType: formData.flowType || 'unidirectional',
          criticality: formData.criticality || 'medium'
        };
        await onAddDependency(newRelation);
        updatedSolution.dependencies = [...(updatedSolution.dependencies || []), newRelation];
        break;
      case 'integrations':
        // Add required fields for SolutionIntegration
        newRelation = {
          ...newRelation,
          sourceSolutionId: solution.id,
          targetSolutionId: formData.targetSolutionId || '',
          integrationType: formData.integrationType || 'default',
          flowType: formData.flowType || 'unidirectional'
        };
        await onAddIntegration(newRelation);
        updatedSolution.integrations = [...(updatedSolution.integrations || []), newRelation];
        break;
    }
    
    // Update the solution in the store to trigger a re-render
    updateSolution(solution.id, updatedSolution);
    
    // Close modal and reset form
    setShowAddModal(false);
    setFormData({});
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (activeTab) {
      case 'collaborations':
        onUpdateCollaboration(editingItem.id, formData);
        break;
      case 'dependencies':
        onUpdateDependency(editingItem.id, formData);
        break;
      case 'integrations':
        onUpdateIntegration(editingItem.id, formData);
        break;
    }
    
    setEditingItem(null);
    setFormData({});
  };

  const handleRemove = (id: string, type: TabType, name: string) => {
    setRemovingItem({ id, type, name });
    setConfirmText('');
  };

  const confirmRemove = () => {
    if (!removingItem || confirmText !== removingItem.name) return;

    switch (removingItem.type) {
      case 'collaborations':
        onRemoveCollaboration(removingItem.id, solution.id);
        break;
      case 'dependencies':
        onRemoveDependency(removingItem.id, solution.id);
        break;
      case 'integrations':
        onRemoveIntegration(removingItem.id, solution.id);
        break;
    }

    setRemovingItem(null);
    setConfirmText('');
  };

  const renderVersionContent = (version: SolutionVersion) => {
    const getStateColor = (state: SolutionVersion['state']) => {
      switch (state) {
        case 'stable': return 'bg-green-100 text-green-700';
        case 'lts': return 'bg-blue-100 text-blue-700';
        case 'rc': return 'bg-yellow-100 text-yellow-700';
        case 'beta': return 'bg-orange-100 text-orange-700';
        case 'alpha': return 'bg-red-100 text-red-700';
        case 'deprecated': return 'bg-gray-100 text-gray-700';
        case 'eol': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h4 className="text-lg font-medium">v{version.version}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(version.state)}`}>
              {(version.state || 'unknown').toUpperCase()}
            </span>
          </div>
        </div>

        {version.changelog && (
          <div>
            <h5 className="font-medium mb-2">Changelog</h5>
            <p className="text-gray-600">{version.changelog}</p>
          </div>
        )}

        {version.stabilityScore !== undefined && (
          <div>
            <h5 className="font-medium mb-2">Stability Score</h5>
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${version.stabilityScore * 100}%` }}
                />
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {Math.round(version.stabilityScore * 100)}%
              </span>
            </div>
          </div>
        )}

        {version.supportedUntil && (
          <div>
            <h5 className="font-medium mb-2">Support Status</h5>
            <p className="text-gray-600">
              Supported until {new Date(version.supportedUntil).toLocaleDateString()}
            </p>
          </div>
        )}

        {version.minimumRequirements && (
          <div>
            <h5 className="font-medium mb-2">Minimum Requirements</h5>
            <div className="space-y-1">
              {Object.entries(version.minimumRequirements).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {version.breakingChanges && version.breakingChanges.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Breaking Changes</h5>
            <ul className="list-disc list-inside space-y-1">
              {version.breakingChanges.map((change, i) => (
                <li key={i} className="text-gray-600">{change}</li>
              ))}
            </ul>
          </div>
        )}

        {version.knownIssues && version.knownIssues.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Known Issues</h5>
            <ul className="list-disc list-inside space-y-1">
              {version.knownIssues.map((issue, i) => (
                <li key={i} className="text-gray-600">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {version.upgradeGuide && (
          <div>
            <h5 className="font-medium mb-2">Upgrade Guide</h5>
            <p className="text-gray-600">{version.upgradeGuide}</p>
          </div>
        )}

        {version.approvalStatus && (
          <div>
            <h5 className="font-medium mb-2">Approval Status</h5>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  version.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  version.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {version.approvalStatus.toUpperCase()}
                </span>
              </div>
              {version.approvedBy && version.approvedBy.length > 0 && (
                <div className="text-sm text-gray-600">
                  Approved by: {version.approvedBy.join(', ')}
                </div>
              )}
              {version.approvalNotes && (
                <p className="text-sm text-gray-600">{version.approvalNotes}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'collaborations':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Collaboration Type</label>
              <select
                value={formData.collaborationType || ''}
                onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                required
              >
                <option value="">Select Type</option>
                <option value="data_sharing">Data Sharing</option>
                <option value="api_integration">API Integration</option>
                <option value="shared_resources">Shared Resources</option>
                <option value="joint_development">Joint Development</option>
                <option value="service_provision">Service Provision</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Solution</label>
              <select
                value={formData.targetSolutionId || ''}
                onChange={(e) => setFormData({ ...formData, targetSolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="">Select Solution</option>
                {allSolutions
                  .filter((s) => s.id !== solution.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <select
                value={formData.flowType || 'unidirectional'}
                onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="unidirectional">Unidirectional</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              />
            </div>
          </>
        );

      case 'dependencies':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dependency Type</label>
              <select
                value={formData.dependencyType || ''}
                onChange={(e) => setFormData({ ...formData, dependencyType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                required
              >
                <option value="">Select Type</option>
                <option value="runtime">Runtime Dependency</option>
                <option value="buildtime">Build-time Dependency</option>
                <option value="development">Development Dependency</option>
                <option value="testing">Testing Dependency</option>
                <option value="deployment">Deployment Dependency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dependency</label>
              <select
                value={formData.dependencySolutionId || ''}
                onChange={(e) => setFormData({ ...formData, dependencySolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="">Select Solution</option>
                {allSolutions
                  .filter((s) => s.id !== solution.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <select
                value={formData.flowType || 'unidirectional'}
                onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="unidirectional">Unidirectional</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Criticality</label>
              <select
                value={formData.criticality || 'medium'}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </>
        );

      case 'integrations':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Integration Type</label>
              <select
                value={formData.integrationType || ''}
                onChange={(e) => setFormData({ ...formData, integrationType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                required
              >
                <option value="">Select Type</option>
                <option value="api">API Integration</option>
                <option value="event_stream">Event Stream</option>
                <option value="data_pipeline">Data Pipeline</option>
                <option value="webhook">Webhook</option>
                <option value="file_sync">File Sync</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Solution</label>
              <select
                value={formData.targetSolutionId || ''}
                onChange={(e) => setFormData({ ...formData, targetSolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="">Select Solution</option>
                {allSolutions
                  .filter((s) => s.id !== solution.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <select
                value={formData.flowType || 'unidirectional'}
                onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
              >
                <option value="unidirectional">Unidirectional</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="lateral">Lateral</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'collaborations':
        return currentSolution.collaborations?.map((collab) => {
          const targetSolution = allSolutions.find((s) => s.id === collab.targetSolutionId);
          return (
            <div key={collab.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{targetSolution?.name}</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-500">Type: {collab.collaborationType}</p>
                    <p className="text-sm text-gray-500">Flow: {collab.flowType}</p>
                    <p className="text-sm text-gray-500">Status: {collab.status}</p>
                    <p className="text-sm text-gray-500">
                      Started: {new Date(collab.startDate).toLocaleDateString()}
                      {collab.endDate && ` - Ends: ${new Date(collab.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(collab);
                      setFormData(collab);
                    }}
                    className="text-black hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(collab.id, 'collaborations', targetSolution?.name || '')}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        });

      case 'dependencies':
        return currentSolution.dependencies?.map((dep) => {
          const dependencySolution = allSolutions.find((s) => s.id === dep.dependencySolutionId);
          return (
            <div key={dep.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{dependencySolution?.name}</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-500">Type: {dep.dependencyType}</p>
                    <p className="text-sm text-gray-500">Flow: {dep.flowType}</p>
                    <p className="text-sm text-gray-500">Criticality: {dep.criticality}</p>
                    {dep.requirements && (
                      <p className="text-sm text-gray-500">
                        Requirements: {JSON.stringify(dep.requirements)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(dep);
                      setFormData(dep);
                    }}
                    className="text-black hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(dep.id, 'dependencies', dependencySolution?.name || '')}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        });

      case 'integrations':
        return currentSolution.integrations?.map((integration) => {
          const targetSolution = allSolutions.find((s) => s.id === integration.targetSolutionId);
          return (
            <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{targetSolution?.name}</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-500">Type: {integration.integrationType}</p>
                    <p className="text-sm text-gray-500">Flow: {integration.flowType}</p>
                    <p className="text-sm text-gray-500">Status: {integration.status}</p>
                    {integration.lastSync && (
                      <p className="text-sm text-gray-500">
                        Last Sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(integration);
                      setFormData(integration);
                    }}
                    className="text-black hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(integration.id, 'integrations', targetSolution?.name || '')}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        });

      case 'versions':
        return currentSolution.versions?.map((version) => (
          <div key={version.id} className="relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              <button
                onClick={() => {
                  setEditingItem(version);
                  setFormData(version);
                }}
                className="text-black hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(version.id, 'versions', `v${version.version}`)}
                className="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </div>
            {renderVersionContent(version)}
          </div>
        ));

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'collaborations', label: 'Collaborations', icon: Users },
            { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
            { id: 'integrations', label: 'Integrations', icon: Package },
            { id: 'versions', label: 'Versions', icon: Package }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => activeTab === 'versions' ? setShowVersionModal(true) : setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'versions' ? 'Add Version' : 
             activeTab === 'dependencies' ? 'Add Dependency' :
             `Add ${activeTab.slice(0, -1)}`}
          </button>
        </div>

        <div className="space-y-4">
          {renderContent()}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add {activeTab.slice(0, -1)}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderForm()}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit {activeTab.slice(0, -1)}</h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {renderForm()}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {removingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Removal</h3>
            <p className="text-sm text-gray-500 mb-4">
              Type <span className="font-medium">{removingItem.name}</span> to confirm removal.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-indigo-500 sm:text-sm mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRemovingItem(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={confirmText !== removingItem.name}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add Version</h3>
              <button
                onClick={() => {
                  setShowVersionModal(false);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddVersion({
                ...formData,
                solutionId: solution.id,
                releasedAt: new Date().toISOString(),
              });
              setShowVersionModal(false);
              setFormData({});
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Version</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  placeholder="e.g., 1.0.0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  required
                >
                  <option value="">Select State</option>
                  <option value="alpha">Alpha</option>
                  <option value="beta">Beta</option>
                  <option value="rc">Release Candidate</option>
                  <option value="stable">Stable</option>
                  <option value="lts">Long Term Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Changelog</label>
                <textarea
                  value={formData.changelog || ''}
                  onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  placeholder="List the changes in this version..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Breaking Changes</label>
                <textarea
                  value={formData.breakingChanges?.join('\n') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    breakingChanges: e.target.value.split('\n').filter(Boolean)
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  placeholder="One breaking change per line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Known Issues</label>
                <textarea
                  value={formData.knownIssues?.join('\n') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    knownIssues: e.target.value.split('\n').filter(Boolean)
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  placeholder="One issue per line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Upgrade Guide</label>
                <textarea
                  value={formData.upgradeGuide || ''}
                  onChange={(e) => setFormData({ ...formData, upgradeGuide: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-gray-500"
                  placeholder="Instructions for upgrading to this version..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVersionModal(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Add Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
