import React from 'react';
import { BarChart3, Home, Map, Users, Rocket, Flag, Contact as FileContract, GitBranch, Menu, Settings, LogOut, ChevronDown, ScrollText, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { useNavigationStore } from '../store/navigationStore';
import { useHubStore } from '../store/hubStore';
import { cn } from '../utils/cn';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { logNavigation } from '../store/logStore';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Rocket, label: 'Get Started', path: '/get-started' },
  { icon: Package, label: 'Solutions', path: '/solutions' },
  { icon: Flag, label: 'Goals', path: '/goals' },
  { icon: FileContract, label: 'Contracts', path: '/contracts' },
  { icon: Map, label: 'Impact Maps', path: '/maps' },
  { icon: GitBranch, label: 'Workflows', path: '/workflows' },
  { icon: Users, label: 'Stakeholders', path: '/stakeholders' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: ScrollText, label: 'Audit Log', path: '/audit-log' }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isExpanded, toggle } = useNavigationStore();
  const { hubs, activeHubId, setActiveHub } = useHubStore();
  const { session, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const activeHubs = useMemo(() => 
    hubs.filter(h => h.status === 'active'),
    [hubs]
  );
  
  useEffect(() => {
    logNavigation('Page changed', {
      from: location.state?.from || 'unknown',
      to: location.pathname,
      userId: session?.user?.id
    });
  }, [location.pathname, session?.user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#f5f5f5] border-r border-divider transition-all duration-300 ease-in-out shadow-card fixed top-0 bottom-0 left-0 z-30",
        isExpanded ? "w-64" : "w-16"
      )}>
        <style>
          {`
            .nav-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
            }
            .nav-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .nav-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .nav-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(156, 163, 175, 0.5);
              border-radius: 20px;
            }
            .nav-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(156, 163, 175, 0.7);
            }
          `}
        </style>
        <div className={cn(
          "h-16 flex items-center border-b border-divider bg-[#f5f5f5]",
          isExpanded ? "px-6" : "px-4"
        )}>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <Map className="w-8 h-8 text-black ml-2" />
            <span className={cn(
              "ml-2 text-xl font-semibold text-gray-900 transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}>
              ImpactMap
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1 nav-scrollbar" style={{
          height: 'calc(100vh - 64px)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center py-2 text-sm font-medium rounded-lg transition-colors",
                  isExpanded ? "px-4" : "px-2 justify-center",
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                )}
                title={item.label}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isExpanded ? "mr-3" : "mr-0",
                  !isActive && "text-gray-600"
                )} />
                <span className={cn(
                  "transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className={cn("flex-1 overflow-auto bg-gray-50", isExpanded ? "ml-64" : "ml-16")}>
        <div className="h-16 border-b border-divider flex items-center px-8 shadow-card fixed top-0 right-0 left-0 z-20 bg-[#f5f5f5]" style={{ left: isExpanded ? '16rem' : '4rem' }}>
          <div className="flex-1 flex items-center">
            <div className="flex items-center space-x-4">
              {activeHubs.length > 0 && (
                <div className="flex items-center space-x-2 mr-4">
                  <Map className="w-5 h-5 text-gray-400" />
                  <select
                    value={activeHubId || ''}
                    onChange={(e) => setActiveHub(e.target.value)}
                    className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option key="default" value="">Select Hub</option>
                    {activeHubs.map((hub) => hub.id && (
                        <option key={hub.id} value={hub.id}>
                          {hub.displayName}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationCenter />
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={session.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{session.user.fullName}</span>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/hubs"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Map className="w-4 h-4 mr-3" />
                      Manage Hubs
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="p-8 mt-16">{children}</div>
      </main>
    </div>
  );
}
