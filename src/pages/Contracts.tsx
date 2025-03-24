import React, { useState } from 'react';
import { Contact as FileContract, Plus, Calendar, Users, FileCheck, Search, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CommentSection from '../components/CommentSection';
import FeedbackDialog from '../components/FeedbackDialog';

interface Contract {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  parties: string[];
  type: 'service' | 'partnership' | 'data-sharing' | 'funding';
  value?: number;
  terms: string[];
  lastUpdated: string;
}

// Sample data - In a real app, this would come from your backend
const contracts: Contract[] = [
  {
    id: '1',
    title: 'Data Sharing Agreement',
    description: 'Agreement for sharing impact measurement data between partners',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    parties: ['Organization A', 'Organization B'],
    type: 'data-sharing',
    terms: [
      'Quarterly data updates',
      'Confidentiality requirements',
      'Usage restrictions'
    ],
    lastUpdated: '2024-03-15'
  },
  {
    id: '2',
    title: 'Impact Partnership',
    description: 'Strategic partnership for environmental impact initiatives',
    status: 'draft',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    parties: ['EcoTech Inc', 'Green Future Foundation'],
    type: 'partnership',
    value: 50000,
    terms: [
      'Joint project management',
      'Resource sharing',
      'Impact reporting requirements'
    ],
    lastUpdated: '2024-03-10'
  }
];

export default function Contracts() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredContracts = contracts.filter((contract) => {
    const matchesFilter = filter === 'all' || contract.status === filter;
    const matchesSearch = 
      contract.title.toLowerCase().includes(search.toLowerCase()) ||
      contract.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileContract className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Contracts</h2>
        </div>
        <div className="flex space-x-4">
          <FeedbackDialog />
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
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
                  placeholder="Search contracts..."
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
                onChange={(e) => setFilter(e.target.value)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedContract(contract)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{contract.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{contract.description}</p>
                </div>
                <StatusBadge status={contract.status} />
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  {contract.parties.length} parties
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileCheck className="w-4 h-4 mr-2" />
                  {contract.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedContract && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedContract.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{selectedContract.description}</p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <Plus className="h-6 w-6 transform rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Contract Details</h4>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Type</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">{selectedContract.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Status</dt>
                      <dd><StatusBadge status={selectedContract.status} /></dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Duration</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedContract.startDate).toLocaleDateString()} - {new Date(selectedContract.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                    {selectedContract.value && (
                      <div>
                        <dt className="text-sm text-gray-500">Value</dt>
                        <dd className="text-sm font-medium text-gray-900">${selectedContract.value.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Parties</h4>
                  <ul className="mt-2 space-y-2">
                    {selectedContract.parties.map((party) => (
                      <li key={party} className="text-sm text-gray-900">{party}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Key Terms</h4>
                <ul className="mt-2 space-y-2">
                  {selectedContract.terms.map((term, index) => (
                    <li key={index} className="text-sm text-gray-600">• {term}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <CommentSection
                  entityId={selectedContract.id}
                  entityType="goal"
                  entityTitle={selectedContract.title}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}