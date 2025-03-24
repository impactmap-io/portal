import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors = {
  // Status colors
  'draft': 'bg-gray-100 text-gray-700 border border-gray-200',
  'live': 'bg-green-100 text-green-800 border border-green-200',
  'completed': 'bg-green-100 text-green-800 border border-green-200',
  'terminated': 'bg-red-100 text-red-800 border border-red-200',
  'active': 'bg-green-100 text-green-800 border border-green-200',
  'archived': 'bg-gray-100 text-gray-700 border border-gray-200',
  'paused': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  
  // Priority/Criticality levels
  'low': 'bg-gray-100 text-gray-700 border border-gray-200',
  'medium': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'high': 'bg-red-100 text-red-800 border border-red-200',
  
  // Impact types
  'positive': 'bg-green-100 text-green-800 border border-green-200',
  'negative': 'bg-red-100 text-red-800 border border-red-200',
  'neutral': 'bg-gray-100 text-gray-700 border border-gray-200',
  
  // Other states
  'planned': 'bg-purple-100 text-purple-800 border border-purple-200',
  'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200',
  'failed': 'bg-red-100 text-red-800 border border-red-200',
  'pending': 'bg-gray-100 text-gray-700 border border-gray-200',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  if (!status) return null;
  
  const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
}