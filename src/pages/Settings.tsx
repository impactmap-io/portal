import React from 'react';
import { Bell, Lock, User, Palette, Globe, Camera, X, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

interface SettingsModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function SettingsModal({ title, isOpen, onClose, children }: SettingsModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

const sections = [
  {
    title: 'Profile',
    icon: User,
    settings: [
      {
        name: 'Name',
        description: 'Update your name and profile information',
        action: 'Edit',
      },
      {
        name: 'Email',
        description: 'Manage your email preferences',
        action: 'Change',
      },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      {
        name: 'Email Notifications',
        description: 'Receive email updates about your impact maps',
        action: 'Configure',
      },
      {
        name: 'Push Notifications',
        description: 'Get instant updates in your browser',
        action: 'Configure',
      },
    ],
  },
  {
    title: 'Security',
    icon: Lock,
    settings: [
      {
        name: 'Password',
        description: 'Update your password regularly',
        action: 'Change',
      },
      {
        name: 'Two-Factor Authentication',
        description: 'Add an extra layer of security',
        action: 'Enable',
      },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    settings: [
      {
        name: 'Theme',
        description: 'Choose between light and dark mode',
        action: 'Select',
      },
      {
        name: 'Layout',
        description: 'Customize your workspace layout',
        action: 'Customize',
      },
    ],
  },
  {
    title: 'Language',
    icon: Globe,
    settings: [
      {
        name: 'Display Language',
        description: 'Choose your preferred language',
        action: 'Select',
      },
      {
        name: 'Date Format',
        description: 'Set your preferred date format',
        action: 'Select',
      },
    ],
  },
];

export default function Settings() {
  const { session, loading, updateProfile, updatePassword, updateSettings, uploadAvatar } = useAuthStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Form states
  const [profile, setProfile] = useState({
    fullName: session?.user?.fullName || '',
    email: session?.user?.email || '',
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [userSettings, setUserSettings] = useState(session?.user?.settings || {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
    language: 'en',
  });
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profile);
    setActiveModal(null);
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return; // Add error handling
    }
    await updatePassword(passwords.current, passwords.new);
    setActiveModal(null);
  };
  
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(userSettings);
    setActiveModal(null);
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Icon className="w-6 h-6 text-gray-400" />
                <h2 className="ml-3 text-lg font-medium text-gray-900">{section.title}</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {section.settings.map((setting) => (
                <div key={setting.name} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{setting.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(setting.name)}
                    className="ml-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {setting.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Profile Modal */}
      <SettingsModal
        title="Edit Profile"
        isOpen={activeModal === 'Name'}
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img
                src={session?.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full"
              />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                <Camera className="w-4 h-4 text-gray-600" />
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </SettingsModal>

      {/* Password Modal */}
      <SettingsModal
        title="Change Password"
        isOpen={activeModal === 'Password'}
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Update Password
            </button>
          </div>
        </form>
      </SettingsModal>

      {/* Theme Modal */}
      <SettingsModal
        title="Appearance Settings"
        isOpen={activeModal === 'Theme'}
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <select
              value={userSettings.theme}
              onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </SettingsModal>

      {/* Language Modal */}
      <SettingsModal
        title="Language Settings"
        isOpen={activeModal === 'Display Language'}
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={userSettings.language}
              onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </SettingsModal>
    </div>
  );
}