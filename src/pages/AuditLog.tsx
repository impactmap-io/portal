import React, { useState, useMemo } from 'react';
import { ScrollText, Search, Filter, Download, Trash2, RefreshCw, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useLogStore } from '../store/logStore';
import type { LogLevel, LogCategory, LogFilter } from '../types/logs';

const LEVEL_STYLES = {
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  error: 'bg-red-50 text-red-700 border-red-100',
  debug: 'bg-gray-50 text-gray-700 border-gray-100',
};

const LEVEL_ICONS = {
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
  debug: CheckCircle2,
};

const CATEGORIES = [
  { value: 'auth', label: 'Authentication' },
  { value: 'user', label: 'User Activity' },
  { value: 'solution', label: 'Solutions' },
  { value: 'goal', label: 'Goals' },
  { value: 'workflow', label: 'Workflows' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'system', label: 'System' },
];

const LEVELS = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'debug', label: 'Debug' },
];

export default function AuditLog() {
  const { logs, filterLogs, clearLogs, exportLogs } = useLogStore();
  const [filter, setFilter] = useState<LogFilter>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    return filterLogs({
      ...filter,
      search,
    });
  }, [filter, search, filterLogs]);

  const handleExport = () => {
    const json = exportLogs({ ...filter, search });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      clearLogs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ScrollText className="w-6 h-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Audit Log</h2>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={() => {
                  setFilter({});
                  setSearch('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    value={filter.level || ''}
                    onChange={(e) => setFilter({ ...filter, level: e.target.value as LogLevel || undefined })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Levels</option>
                    {LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={filter.category || ''}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value as LogCategory || undefined })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Range</label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="date"
                      value={filter.startDate || ''}
                      onChange={(e) => setFilter({ ...filter, startDate: e.target.value || undefined })}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                    <input
                      type="date"
                      value={filter.endDate || ''}
                      onChange={(e) => setFilter({ ...filter, endDate: e.target.value || undefined })}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const Icon = LEVEL_ICONS[log.level];
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEVEL_STYLES[log.level]}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {CATEGORIES.find(c => c.value === log.category)?.label || log.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.error ? (
                        <span className="text-red-600">{log.error.message}</span>
                      ) : (
                        Object.entries(log.metadata || {})
                          .filter(([key]) => key !== 'userId')
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                          ))
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}