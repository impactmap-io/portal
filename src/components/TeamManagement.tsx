import React, { useState } from 'react';
import { Users, UserPlus, Shield, X } from 'lucide-react';
import type { Solution } from '../types';

type TeamMember = Solution['team'][0] & {
  email?: string;
};

interface TeamManagementProps {
  solution: Solution;
  onUpdateTeam: (members: TeamMember[]) => void;
}

export default function TeamManagement({ solution, onUpdateTeam }: TeamManagementProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member' as const,
  });

  const teamMembers = [solution.owner, ...solution.team];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: newMember.email.split('@')[0].replace('.', ' '),
      role: newMember.role,
      email: newMember.email,
    };
    onUpdateTeam([solution.owner, ...solution.team, member]);
    setIsAddingMember(false);
    setNewMember({ email: '', role: 'member' });
  };

  const handleRemoveMember = (memberId: string) => {
    onUpdateTeam([
      solution.owner,
      ...solution.team.filter(m => m.id !== memberId)
    ]);
  };

  const handleUpdateRole = (memberId: string, newRole: TeamMember['role']) => {
    if (memberId === solution.owner.id) return; // Can't change owner's role
    onUpdateTeam([
      solution.owner,
      ...solution.team.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <li key={member.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value as TeamMember['role'])}
                    disabled={member.role === 'owner'}
                    className="block text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                    {member.role === 'owner' && <option value="owner">Owner</option>}
                  </select>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isAddingMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleAddMember} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add Team Member</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamMember['role'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}