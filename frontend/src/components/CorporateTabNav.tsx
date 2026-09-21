import React from 'react';
import {
  LayoutDashboard,
  Video,
  Truck,
  FileText,
  CloudRain,
  Settings,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TabId = 'home' | 'video' | 'track' | 'eway_bills' | 'leak' | 'scale';

interface CorporateTabNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
  requiredRole?: string[];
  badge?: string;
  badgeType?: 'info' | 'warning' | 'live';
}

export const CorporateTabNav: React.FC<CorporateTabNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const TABS: TabDef[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'video', label: 'Live Video', icon: Video, badge: '4 LIVE', badgeType: 'live' },
    { id: 'track', label: 'Fleet & Dock', icon: Truck, badge: '1 ALERT', badgeType: 'warning' },
    { id: 'eway_bills', label: 'E-Way Bills', icon: FileText, requiredRole: ['corporate_admin', 'yard_master'] },
    { id: 'leak', label: 'Roof Leak AI', icon: CloudRain, badge: 'HAZARD', badgeType: 'warning' },
    { id: 'scale', label: 'Settings', icon: Settings, requiredRole: ['corporate_admin'] },
  ];

  const canAccessTab = (tab: TabDef): boolean => {
    if (!tab.requiredRole) return true;
    if (user.permissions.includes('all')) return true;
    return tab.requiredRole.includes(user.role);
  };

  return (
    <div className="border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-md sticky top-[61px] z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto py-1.5 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAccessible = canAccessTab(tab);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isAccessible) {
                    setActiveTab(tab.id);
                  }
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800/60 text-white border border-slate-700/50 shadow-sm'
                    : isAccessible
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={!isAccessible ? `Restricted to ${tab.requiredRole?.join(', ')}` : undefined}
              >
                <Icon className={`h-3.5 w-3.5 ${
                  isActive ? 'text-cyan-400' : isAccessible ? 'text-slate-500' : 'text-slate-600'
                }`} />
                <span>{tab.label}</span>

                {!isAccessible && (
                  <Lock className="h-3 w-3 text-amber-500/60" />
                )}

                {tab.badge && isAccessible && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${
                      tab.badgeType === 'warning'
                        ? 'bg-red-500/10 text-red-400 border-red-500/25'
                        : tab.badgeType === 'live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(199,89%,48%), transparent)',
                      boxShadow: '0 0 8px hsla(199,89%,48%,0.5)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
