import React, { useState, useEffect } from 'react';
import { 
  Map,
  Plus, 
  Search,
  Filter,
  X,
  Cloud,
  Database,
  Server,
  Loader,
  Settings,
  CreditCard,
  Building2,
  Users,
  LifeBuoy,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useHubStore } from '../store/hubStore';
import { cn } from '../utils/cn';
import { Hub } from '../types/hub';

interface HubFormStep {
  id: string;
  title: string;
  description: string;
}

interface HubFormData {
  name: string;
  displayName: string;
  description?: string;
  domain: string;
  organization: {
    name: string;
    industry: string;
    size: string;
  };
  deployment: {
    provider: 'aws' | 'azure' | 'gcp' | 'custom';
    region: string;
  };
  team: {
    email: string;
    role: 'admin' | 'member' | 'viewer';
  }[];
  plan: 'free' | 'pro' | 'enterprise';
}

interface FormState {
  formData: HubFormData;
  currentStep: number;
  isCreating: boolean;
  isSubmitting: boolean;
  progressMessage: string;
  domainError: string;
}

const initialState: FormState = {
  formData: {
    name: '',
    displayName: '',
    description: '',
    domain: '', 
    organization: {
      name: '',
      industry: '',
      size: ''
    },
    deployment: {
      provider: 'aws',
      region: 'us-east-1'
    },
    team: [],
    plan: 'free'
  },
  currentStep: 0,
  isCreating: false,
  isSubmitting: false,
  progressMessage: '',
  domainError: ''
};

const FORM_STEPS: HubFormStep[] = [
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Let\'s start with the essential details of your hub.'
  },
  {
    id: 'deployment',
    title: 'Deployment Model',
    description: 'Choose where and how your hub will be deployed.'
  },
  {
    id: 'team',
    title: 'Initial Team',
    description: 'Invite your team members to get started.'
  },
  {
    id: 'plan',
    title: 'Choose Plan',
    description: 'Select the plan that best fits your needs.'
  }
];

const BILLING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals and small teams',
    features: ['Up to 3 team members', 'Basic analytics', 'Community support'],
    price: '$0'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing organizations',
    features: ['Unlimited team members', 'Advanced analytics', 'Priority support', 'Custom domains'],
    price: '$49/month'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    features: ['Custom contracts', 'Dedicated support', 'SLA guarantees', 'Advanced security'],
    price: 'Contact us'
  }
];

const DEPLOYMENT_PROVIDERS = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    icon: Cloud,
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    icon: Database,
    regions: ['eastus', 'westeurope', 'southeastasia']
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    icon: Server,
    regions: ['us-central1', 'europe-west1', 'asia-east1']
  },
  {
    id: 'custom',
    name: 'Custom Infrastructure',
    icon: Server,
    regions: ['custom']
  }
];

const progressMessages = [
  'Configuring hub environment...',
  'Setting up data storage...',
  'Configuring security policies...',
  'Deploying infrastructure...',
  'Running validation checks...',
  'Finalizing setup...'
];

interface HubSettingsProps {
  hub: Hub;
  onClose: () => void;
}

const HubSettings = ({ hub, onClose }: HubSettingsProps) => {
  const [activeTab, setActiveTab] = useState('configure');
  const [formChanged, setFormChanged] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Get update method from hub store and use it directly
  const { updateHub, deleteHub } = useHubStore();
  
  // Create a save handler that uses updateHub
  const handleSaveChanges = () => {
    // Demonstrate updating hub data
    if (formChanged) {
      console.log('Would update hub:', hub.id);
      updateHub(hub.id, {
        ...hub,
        updatedAt: new Date().toISOString()
      });
    }
    
    // Close the modal
    onClose();
  };

  const handleDeleteHub = async () => {
    if (deleteConfirmation !== hub.name) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHub(hub.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete hub:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Track form changes to enable/disable save button
  const handleFormChange = () => {
    setFormChanged(true);
  };

  const tabs = [
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configure':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Hub Configuration</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hub Name</label>
                  <input
                    type="text"
                    defaultValue={hub.name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lowercase letters, numbers, and hyphens only. This will be used in URLs and API endpoints.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    defaultValue={hub.displayName}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Domain</label>
                  <div className="mt-1 flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      defaultValue={hub.domain?.replace('.impactmap.com', '')}
                      className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                    />
                    <span className="inline-flex items-center px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      .impactmap.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Organization Settings</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <select className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <div className="mt-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </button>
              </div>
              <div className="mt-6">
                <div className="bg-white shadow overflow-hidden rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {hub.team?.map((member) => (
                      <li key={member.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.id}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 capitalize">
                            {member.role}
                          </span>
                        </div>
                      </li>
                    ))}
                    {hub.owner && (
                      <li className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{hub.owner.name}</p>
                            <p className="text-sm text-gray-500">{hub.owner.id}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                            {hub.owner.role}
                          </span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Subscription Management</h3>
              <div className="mt-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h4 className="text-base font-medium text-gray-900">Current Plan</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      You are currently on the {hub.billing?.plan || 'Free'} plan.
                    </p>
                    <div className="mt-4">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
              <div className="mt-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h4 className="text-base font-medium text-gray-900">Payment Method</h4>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">No payment methods added yet</span>
                        <button className="text-sm text-black hover:text-gray-800">
                          Add method
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h4 className="text-base font-medium text-gray-900">Billing History</h4>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        No billing history available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Support</h3>
              <div className="mt-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h4 className="text-base font-medium text-gray-900">Need Help?</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Contact our support team for assistance with your hub.
                    </p>
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
                      Contact Support
                    </button>
                  </div>
                </div>
                <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h4 className="text-base font-medium text-gray-900">Documentation</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Browse our documentation for guides and tutorials.
                    </p>
                    <a
                      href="#"
                      className="mt-4 inline-flex items-center text-sm text-black hover:text-gray-800"
                    >
                      View Documentation
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'danger':
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h3 className="text-lg font-medium text-red-900">Delete Hub</h3>
              <p className="mt-2 text-sm text-red-700">
                Once you delete a hub, there is no going back. Please be certain.
              </p>
              <div className="mt-4">
                <label htmlFor="delete-confirmation" className="block text-sm font-medium text-red-700">
                  Type the hub name to confirm deletion
                </label>
                <input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-red-300 bg-white shadow-sm hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-colors duration-200"
                  placeholder={hub.name}
                />
                <button
                  onClick={handleDeleteHub}
                  disabled={deleteConfirmation !== hub.name || isDeleting}
                  className={cn(
                    "mt-4 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-150",
                    deleteConfirmation === hub.name && !isDeleting
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-400 cursor-not-allowed"
                  )}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete Hub"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Hub Settings</h2>
          </div>
          <nav className="px-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-1",
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{hub.displayName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
          <div className="p-6 border-t border-gray-200">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hubs = () => {
  const [editingHubId, setEditingHubId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [hubsList, setHubsList] = useState<Hub[]>([]);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  const { formData, currentStep, isCreating, isSubmitting, domainError, progressMessage } = formState;

  // Destructure only what we need from the hub store
  const { 
    addHub, 
    isDomainAvailable, 
    hubs 
  } = useHubStore();
  
  // Update hubsList when hubs changes
  useEffect(() => {
    // Filter hubs based on search and filter
    const filtered = hubs.filter((hub) => {
      const matchesFilter = filter === 'all' || hub.status === filter;
      const matchesSearch = !search || 
        hub.name.toLowerCase().includes(search.toLowerCase()) ||
        hub.displayName.toLowerCase().includes(search.toLowerCase()) ||
        hub.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    
    setHubsList(filtered);
  }, [hubs, filter, search]);

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const updateFormData = (updates: Partial<HubFormData>) => {
    updateFormState({
      formData: { ...formData, ...updates }
    });
  };

  const handleNext = async () => {
    if (currentStep === FORM_STEPS.length - 1) {
      updateFormState({
        isSubmitting: true,
        progressMessage: progressMessages[0]
      });
      
      // Simulate creation with progress messages
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % progressMessages.length;
        updateFormState({ progressMessage: progressMessages[messageIndex] });
      }, 800);
      
      // Submit the form
      try {
        // Wait 5 seconds to show progress messages
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Stop the progress messages
        clearInterval(progressInterval);
        
        await handleSubmit({
          preventDefault: () => {}
        } as React.FormEvent<HTMLFormElement>);
        
        // Reset form state and close the modal properly
        setFormState({
          ...initialState,
          isCreating: false
        });
      } catch (error) {
        clearInterval(progressInterval);
        updateFormState({
          isSubmitting: false,
          domainError: error instanceof Error ? error.message : 'Failed to create hub',
          currentStep: currentStep
        });
      }
    } else {
      updateFormState({ currentStep: currentStep + 1 });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      updateFormState({ currentStep: currentStep - 1 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    updateFormState({ isSubmitting: true, domainError: '' });
    
    try {
      if (editingHubId) {
        const newTeamMembers = formData.team.map(member => ({
          id: Math.random().toString(36).substring(2, 11), // Generate an ID for new members
          name: member.email.split('@')[0], // Use part of email as name for demo
          role: member.role
        }));
        
        console.log('Would update hub with ID:', editingHubId, {
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description,
          domain: formData.domain,
          team: newTeamMembers,
          status: 'active',
        });
        
        setEditingHubId(null);
        updateFormState(initialState);
      } else {
        let domain = formData.domain;
        if (!domain.includes('.')) {
          domain = `${domain}.impactmap.com`;
        } else if (!domain.endsWith('.impactmap.com')) {
          domain = `${domain}.impactmap.com`;
        }
          
        const isAvailable = await isDomainAvailable(domain);
        if (!isAvailable) {
          updateFormState({ 
            domainError: 'This domain is not available. Please try a different name.',
            isSubmitting: false
          });
          return;
        }

        const newTeam = formData.team.map(member => ({
          id: Math.random().toString(36).substring(2, 11),
          name: member.email.split('@')[0],
          role: member.role
        }));
        
        const newHub: Hub = {
          id: Math.random().toString(36).substring(2, 10),
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description,
          domain: domain,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          team: newTeam,
          owner: {
            id: 'current-user',
            name: 'Current User',
            role: 'owner'
          },
          settings: {
            theme: 'light',
            features: {}
          },
          billing: {
            plan: formData.plan
          }
        };
        
        await addHub(newHub);
        
        updateFormState({
          ...initialState,
          isCreating: false 
        });
      }
      
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('domain')) {
          errorMessage = 'Domain error: ' + errorMessage;
        }
      }
      
      updateFormState({
        domainError: errorMessage,
        isSubmitting: false
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Map className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Hubs</h2>
        </div>
        <button
          onClick={() => updateFormState({ isCreating: true })}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Hub
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
                  placeholder="Search hubs..."
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
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hub Form Modal */}
        {(isCreating || editingHubId) && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white w-full h-full flex flex-col">
              {/* Fixed header section */}
              <div className="flex-none border-b border-gray-200 bg-white">
                <div className="py-4 px-6 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingHubId ? 'Edit Hub' : 'Create New Hub'}
                  </h3>
                  <button
                    onClick={() => updateFormState(initialState)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main content area with flex layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar with progress steps */}
                <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-8">
                      {FORM_STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-start">
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                                index < currentStep
                                  ? "bg-black text-white"
                                  : index === currentStep
                                  ? "bg-black text-white"
                                  : "bg-gray-200 text-gray-500"
                              )}
                            >
                              {index + 1}
                            </div>
                            {index < FORM_STEPS.length - 1 && (
                              <div className={cn(
                                "h-16 w-0.5 ml-4",
                                index < currentStep ? "bg-black" : "bg-gray-200"
                              )}></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {step.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right content area with form */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Scrollable content area with bottom padding for button bar */}
                  <div className="flex-1 overflow-y-auto relative">
                    {/* Add scroll indicator at the bottom of the scrollable area */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    
                    {isSubmitting ? (
                      <div className="p-8 flex flex-col items-center justify-center">
                        <div className="animate-spin mb-4">
                          <Loader className="h-10 w-10 text-black" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Your Hub</h3>
                        <p className="text-gray-500">{progressMessage}</p>
                      </div>
                    ) : (
                      <div className="p-6">
                        <form onSubmit={handleSubmit} className="pb-16">
                          {/* Step 1: Basic Information */}
                          {currentStep === 0 && (
                            <div className="space-y-6">
                              <div>
                                <label htmlFor="hub-name" className="block text-sm font-medium text-gray-700">
                                  Hub Name (Unique Identifier)
                                </label>
                                <input
                                  id="hub-name"
                                  name="name"
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => updateFormData({ name: e.target.value })}
                                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                                  placeholder="my-hub-name"
                                  required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  Lowercase letters, numbers, and hyphens only. This will be used in URLs and API endpoints.
                                </p>
                              </div>
                              
                              <div>
                                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                                  Display Name
                                </label>
                                <input
                                  id="display-name"
                                  name="displayName"
                                  type="text"
                                  value={formData.displayName}
                                  onChange={(e) => updateFormData({ displayName: e.target.value })}
                                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                                  placeholder="My Hub Name"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <textarea
                                  id="description"
                                  name="description"
                                  value={formData.description}
                                  onChange={(e) => updateFormData({ description: e.target.value })}
                                  rows={3}
                                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                                  placeholder="A brief description of this hub"
                                ></textarea>
                              </div>
                              
                              <div>
                                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                                  Domain
                                </label>
                                <div className="mt-1 flex rounded-lg shadow-sm">
                                  <input
                                    id="domain"
                                    name="domain"
                                    type="text"
                                    value={formData.domain}
                                    onChange={(e) => updateFormData({ domain: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-colors duration-200"
                                    placeholder="your-hub-name"
                                  />
                                  <span className="inline-flex items-center px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    .impactmap.com
                                  </span>
                                </div>
                                {domainError && (
                                  <p className="mt-1 text-sm text-red-600">{domainError}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Step 2: Deployment Model */}
                          {currentStep === 1 && (
                            <div className="space-y-6">
                              <h3 className="text-lg font-medium text-gray-900">Select Deployment Provider</h3>
                              <div className="grid grid-cols-2 gap-4">
                                {DEPLOYMENT_PROVIDERS.map((provider) => {
                                  const Icon = provider.icon;
                                  return (
                                    <button
                                      key={provider.id}
                                      type="button"
                                      onClick={() => updateFormData({
                                        deployment: {
                                          ...formData.deployment,
                                          provider: provider.id as any
                                        }
                                      })}
                                      className={cn(
                                        "flex items-center p-4 border rounded-lg transition-colors",
                                        formData.deployment.provider === provider.id
                                          ? "border-indigo-500 bg-indigo-50"
                                          : "border-gray-200 hover:border-indigo-300"
                                      )}
                                    >
                                      <Icon className="w-5 h-5 mr-2" />
                                      {provider.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Step 3: Billing Plan */}
                          {currentStep === 2 && (
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-base font-medium text-gray-900 mb-4">Choose a plan that fits your needs</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  {BILLING_PLANS.map((plan) => (
                                    <div 
                                      key={plan.id}
                                      className={cn(
                                        "relative rounded-lg border p-4 shadow-sm cursor-pointer",
                                        formData.plan === plan.id 
                                          ? "border-indigo-500 ring-2 ring-indigo-500" 
                                          : "border-gray-300 hover:border-gray-400"
                                      )}
                                      onClick={() => updateFormData({ plan: plan.id as 'free' | 'pro' | 'enterprise' })}
                                    >
                                      <div className="flex flex-col h-full">
                                        <div className="flex justify-between">
                                          <h3 className="text-sm font-medium text-gray-900">{plan.name}</h3>
                                          {formData.plan === plan.id && (
                                            <div className="h-5 w-5 rounded-full bg-black flex items-center justify-center">
                                              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                                        <p className="text-lg font-medium text-gray-900 mt-4">{plan.price}</p>
                                        <ul className="mt-4 space-y-2 flex-grow">
                                          {plan.features.map((feature, index) => (
                                            <li key={index} className="flex text-sm">
                                              <svg className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              <span className="text-gray-700">{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Button bar contained within the right column */}
                  <div className="flex-none border-t border-gray-200 bg-white p-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${
                        currentStep === 0 ? 'invisible' : ''
                      }`}
                      disabled={currentStep === 0}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800"
                    >
                      {currentStep === FORM_STEPS.length - 1 ? 'Create Hub' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hubsList.map((hub) => (
          <div key={hub.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 truncate">{hub.displayName}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  hub.status === 'active' ? 'bg-green-100 text-green-800' : 
                  hub.status === 'archived' ? 'bg-gray-100 text-gray-800' : 
                  hub.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {hub.status.charAt(0).toUpperCase() + hub.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                {hub.description || 'No description provided'}
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Domain:</span>
                  <span className="truncate">{hub.domain}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Plan:</span>
                  <span className="capitalize">{hub.billing?.plan || 'Free'}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Team:</span>
                  <span>{hub.team?.length || 0} members</span>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => window.open(`https://${hub.domain}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit
                </button>
                <button
                  className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => {
                    setSelectedHub(hub);
                  }}
                >
                  <Settings className="w-4 h-4 mr-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Hub Settings Modal */}
      {selectedHub && (
        <HubSettings 
          hub={selectedHub} 
          onClose={() => setSelectedHub(null)} 
        />
      )}
      
    </div>
  );
}

export default Hubs;
