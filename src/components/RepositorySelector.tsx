import React, { useState, useEffect } from 'react';
import { Search, Github, Plus, Check } from 'lucide-react';
import { useGithubStore } from '../store/githubStore';
import type { GitHubRepository } from '../types/github';

interface RepositorySelectProps {
  onSelect: (repository: GitHubRepository) => void;
  onInstallApp: () => void;
}

export default function RepositorySelector({ onSelect, onInstallApp }: RepositorySelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { 
    installations,
    selectedInstallation,
    loading,
    error,
    fetchInstallations,
    searchRepositories
  } = useGithubStore();

  useEffect(() => {
    if (installations.length === 0) {
      fetchInstallations();
    }
  }, [fetchInstallations, installations.length]);

  const filteredRepositories = searchQuery
    ? searchRepositories(searchQuery)
    : selectedInstallation?.repositories || [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white relative flex items-center text-left cursor-default rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <Github className="w-5 h-5 text-gray-400 mr-2" />
        {selectedRepo ? (
          <div className="flex items-center justify-between flex-1">
            <div>
              <div className="text-sm font-medium text-gray-900">{selectedRepo.name}</div>
              <div className="text-xs text-gray-500">{selectedRepo.fullName}</div>
            </div>
            <Check className="w-5 h-5 text-green-500" />
          </div>
        ) : (
          <span className="block truncate text-gray-900">
            {selectedInstallation ? 'Select Repository' : 'Connect GitHub Repository'}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-200">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading repositories...</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-500">Error loading repositories</div>
          ) : filteredRepositories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No repositories found</p>
                <button
                  onClick={onInstallApp}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Install GitHub App
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredRepositories.map((repo) => (
                <button
                  key={repo.id}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedRepo(repo);
                    onSelect(repo);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <Github className="w-4 h-4 text-gray-400 mr-2" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                      <div className="text-xs text-gray-500">{repo.fullName}</div>
                    </div>
                    {selectedRepo?.id === repo.id && (
                      <Check className="w-4 h-4 text-green-500 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}