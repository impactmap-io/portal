import React, { useState, useEffect } from 'react';
import { Link2, GitBranch, Plug, Tags, Plus, X, AlertTriangle, Pencil } from 'lucide-react';
import type { Solution, SolutionCollaboration, SolutionDependency, SolutionIntegration, SolutionVersion } from '../types';
import Tooltip from './Tooltip';
import StatusBadge from './StatusBadge';

const FLOW_TYPES = [
  { value: 'unidirectional', label: 'One-way', description: 'Data flows in a single direction' },
  { value: 'bidirectional', label: 'Two-way', description: 'Data flows in both directions' },
  { value: 'lateral', label: 'Lateral', description: 'Side-by-side data exchange with no direct flow' }
];

interface SolutionRelationshipsProps {
  solution: Solution;
  allSolutions: Solution[];
  onAddCollaboration: (collaboration: Partial<SolutionCollaboration>) => void;
  onAddDependency: (dependency: Partial<SolutionDependency>) => void;
  onAddIntegration: (integration: Partial<SolutionIntegration>) => void;
  onAddVersion: (version: Partial<SolutionVersion>) => void;
  onUpdateCollaboration: (id: string, updates: Partial<SolutionCollaboration>) => void;
  onUpdateDependency: (id: string, updates: Partial<SolutionDependency>) => void;
  onUpdateIntegration: (id: string, updates: Partial<SolutionIntegration>) => void;
  onRemoveCollaboration: (id: string, solutionId: string) => void;
  onRemoveDependency: (id: string, solutionId: string) => void;
  onRemoveIntegration: (id: string, solutionId: string) => void;
}

type TabType = 'collaborations' | 'dependencies' | 'integrations' | 'versions';

export default function SolutionRelationships({
  solution,
  allSolutions,
  onAddCollaboration,
  onAddDependency,
  onAddIntegration,
  onAddVersion,
  onUpdateCollaboration,
  onUpdateDependency,
  onUpdateIntegration,
  onRemoveCollaboration,
  onRemoveDependency,
  onRemoveIntegration,
}: SolutionRelationshipsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('collaborations');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingItem, setEditingItem] = useState<{ id: string; type: TabType } | null>(null);
  const [removingItem, setRemovingItem] = useState<{ id: string; type: TabType; name: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [localSolution, setLocalSolution] = useState(solution);

  // Update local solution when prop changes
  useEffect(() => {
    setLocalSolution(solution);
  }, [solution]);

  const renderForm = () => {
    switch (activeTab) {
      case 'collaborations':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Solution</label>
              <select
                value={formData.targetSolutionId || ''}
                onChange={(e) => setFormData({ ...formData, targetSolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
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
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.collaborationType || ''}
                onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Type</option>
                <option value="data-sharing">Data Sharing</option>
                <option value="joint-development">Joint Development</option>
                <option value="resource-sharing">Resource Sharing</option>
                <option value="knowledge-transfer">Knowledge Transfer</option>
                <option value="co-marketing">Co-Marketing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <div className="mt-1 flex items-center space-x-2">
                <select
                  value={formData.flowType || 'unidirectional'}
                  onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {FLOW_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Flow Types</p>
                      {FLOW_TYPES.map(type => (
                        <div key={type.value} className="text-sm">
                          <span className="font-medium">{type.label}:</span> {type.description}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className="p-1 hover:bg-gray-100 rounded cursor-help">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </>
        );

      case 'dependencies':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dependency Solution</label>
              <select
                value={formData.dependencySolutionId || ''}
                onChange={(e) => setFormData({ ...formData, dependencySolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
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
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.dependencyType || ''}
                onChange={(e) => setFormData({ ...formData, dependencyType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Type</option>
                <option value="api">API</option>
                <option value="data">Data</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="library">Library</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <div className="mt-1 flex items-center space-x-2">
                <select
                  value={formData.flowType || 'unidirectional'}
                  onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {FLOW_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Flow Types</p>
                      {FLOW_TYPES.map(type => (
                        <div key={type.value} className="text-sm">
                          <span className="font-medium">{type.label}:</span> {type.description}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className="p-1 hover:bg-gray-100 rounded cursor-help">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Criticality</label>
              <select
                value={formData.criticality || 'medium'}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700">Target Solution</label>
              <select
                value={formData.targetSolutionId || ''}
                onChange={(e) => setFormData({ ...formData, targetSolutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
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
              <label className="block text-sm font-medium text-gray-700">Integration Type</label>
              <select
                value={formData.integrationType || ''}
                onChange={(e) => setFormData({ ...formData, integrationType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Type</option>
                <option value="rest-api">REST API</option>
                <option value="event-stream">Event Stream</option>
                <option value="database">Database</option>
                <option value="file-exchange">File Exchange</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Flow Type</label>
              <div className="mt-1 flex items-center space-x-2">
                <select
                  value={formData.flowType || 'unidirectional'}
                  onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {FLOW_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">Flow Types</p>
                      {FLOW_TYPES.map(type => (
                        <div key={type.value} className="text-sm">
                          <span className="font-medium">{type.label}:</span> {type.description}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className="p-1 hover:bg-gray-100 rounded cursor-help">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Health Check URL</label>
              <input
                type="url"
                value={formData.healthCheckUrl || ''}
                onChange={(e) => setFormData({ ...formData, healthCheckUrl: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </>
        );

      case 'versions':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Changelog</label>
              <textarea
                value={formData.changelog || ''}
                onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
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
        return localSolution.collaborations?.map((collab) => {
          const solutionDetails = allSolutions.find(s => s.id === collab.targetSolutionId);
          return (
            <div key={collab.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{solutionDetails?.name}</h4>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">{collab.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {collab.collaborationType}</span>
                      <span>Flow: {FLOW_TYPES.find(f => f.value === collab.flowType)?.label}</span>
                      <span>Status: {collab.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(collab.id, 'collaborations', collab)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(collab.id, 'collaborations', solutionDetails?.name || '')}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <StatusBadge status={collab.status} />
              </div>
            </div>
          );
        });

      case 'dependencies':
        return localSolution.dependencies?.map((dep) => {
          const solutionDetails = allSolutions.find(s => s.id === dep.dependencySolutionId);
          return (
            <div key={dep.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{solutionDetails?.name}</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {dep.dependencyType}</span>
                      <span>Flow: {FLOW_TYPES.find(f => f.value === dep.flowType)?.label}</span>
                      <span>Criticality: {dep.criticality}</span>
                    </div>
                    {dep.requirements && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Requirements:</span> {JSON.stringify(dep.requirements)}
                      </div>
                    )}
                    {dep.validationRules && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Validation Rules:</span> {JSON.stringify(dep.validationRules)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(dep.id, 'dependencies', dep)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(dep.id, 'dependencies', solutionDetails?.name || '')}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <StatusBadge status={dep.criticality} />
              </div>
            </div>
          );
        });

      case 'integrations':
        return localSolution.integrations?.map((integration) => {
          const solutionDetails = allSolutions.find(s => s.id === integration.targetSolutionId);
          return (
            <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{solutionDetails?.name}</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {integration.integrationType}</span>
                      <span>Flow: {FLOW_TYPES.find(f => f.value === integration.flowType)?.label}</span>
                      <span>Status: {integration.status}</span>
                    </div>
                    {integration.healthCheckUrl && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Health Check:</span>{' '}
                        <a href={integration.healthCheckUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-600 hover:text-indigo-500">
                          {integration.healthCheckUrl}
                        </a>
                      </div>
                    )}
                    {integration.lastSync && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Last Sync:</span>{' '}
                        {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    )}
                    {integration.config && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Config:</span> {JSON.stringify(integration.config)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(integration.id, 'integrations', integration)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(integration.id, 'integrations', solutionDetails?.name || '')}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>
            </div>
          );
        });

      case 'versions':
        return localSolution.versions?.map((version) => (
          <div key={version.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">v{version.version}</h4>
                <p className="mt-1 text-sm text-gray-500">{version.changelog}</p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(version.releasedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ));

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'collaborations', label: 'Collaborations', icon: Link2 },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'versions', label: 'Versions', icon: Tags },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (activeTab) {
      case 'collaborations':
        onAddCollaboration({ ...formData, sourceSolutionId: localSolution.id });
        setLocalSolution(prev => ({
          ...prev,
          collaborations: [...(prev.collaborations || []), { ...formData, id: crypto.randomUUID(), sourceSolutionId: localSolution.id }]
        }));
        break;
      case 'dependencies':
        onAddDependency({ ...formData, dependentSolutionId: localSolution.id });
        setLocalSolution(prev => ({
          ...prev,
          dependencies: [...(prev.dependencies || []), { ...formData, id: crypto.randomUUID(), dependentSolutionId: localSolution.id }]
        }));
        break;
      case 'integrations':
        onAddIntegration({ ...formData, sourceSolutionId: localSolution.id });
        setLocalSolution(prev => ({
          ...prev,
          integrations: [...(prev.integrations || []), { ...formData, id: crypto.randomUUID(), sourceSolutionId: localSolution.id }]
        }));
        break;
      case 'versions':
        onAddVersion({ ...formData, solutionId: localSolution.id });
        setLocalSolution(prev => ({
          ...prev,
          versions: [...(prev.versions || []), { ...formData, id: crypto.randomUUID(), solutionId: localSolution.id }]
        }));
        break;
    }
    setIsAdding(false);
    setFormData({});
  };

  const handleEdit = (id: string, type: TabType, currentData: any) => {
    setEditingItem({ id, type });
    setFormData(currentData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    switch (editingItem.type) {
      case 'collaborations':
        onUpdateCollaboration(editingItem.id, formData);
        setLocalSolution(prev => ({
          ...prev,
          collaborations: prev.collaborations?.map(c =>
            c.id === editingItem.id ? { ...c, ...formData } : c
          )
        }));
        break;
      case 'dependencies':
        onUpdateDependency(editingItem.id, formData);
        setLocalSolution(prev => ({
          ...prev,
          dependencies: prev.dependencies?.map(d =>
            d.id === editingItem.id ? { ...d, ...formData } : d
          )
        }));
        break;
      case 'integrations':
        onUpdateIntegration(editingItem.id, formData);
        setLocalSolution(prev => ({
          ...prev,
          integrations: prev.integrations?.map(i =>
            i.id === editingItem.id ? { ...i, ...formData } : i
          )
        }));
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
        onRemoveCollaboration(removingItem.id, localSolution.id);
        setLocalSolution(prev => ({
          ...prev,
          collaborations: prev.collaborations?.filter(c => c.id !== removingItem.id)
        }));
        break;
      case 'dependencies':
        onRemoveDependency(removingItem.id, localSolution.id);
        setLocalSolution(prev => ({
          ...prev,
          dependencies: prev.dependencies?.filter(d => d.id !== removingItem.id)
        }));
        break;
      case 'integrations':
        onRemoveIntegration(removingItem.id, localSolution.id);
        setLocalSolution(prev => ({
          ...prev,
          integrations: prev.integrations?.filter(i => i.id !== removingItem.id)
        }));
        break;
    }

    setRemovingItem(null);
    setConfirmText('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`
                border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Remove Confirmation Modal */}
      {removingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Remove Relationship</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. This will permanently remove the relationship
                    and may impact any dependent systems or workflows.
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Please type <span className="font-semibold">{removingItem.name}</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRemovingItem(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={confirmText !== removingItem.name}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Remove Relationship
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {isAdding ? 'Add' : 'Edit'} {activeTab.slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="space-y-4">
              {renderForm()}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isAdding ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">{renderContent()}</div>
    </div>
  );
}