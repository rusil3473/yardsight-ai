import React from 'react';
import {
  LayoutDashboard,
  Video,
  Truck,
  FileText,
  CloudRain,
  Cpu,
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
}

export const CorporateTabNav: React.FC<CorporateTabNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const TABS: TabDef[] = [
    { id: 'home', label: 'Home Overview', icon: LayoutDashboard },
    { id: 'video', label: 'Live Video (CCTV)', icon: Video, badge: '4 LIVE' },
    { id: 'track', label: 'Fleet & Dock Track', icon: Truck, badge: '1 DETENTION' },
    { id: 'eway_bills', label: 'E-Way Bills & eBOL', icon: FileText, requiredRole: ['corporate_admin', 'yard_master'] },
    { id: 'leak', label: 'Roof Leak AI', icon: CloudRain, badge: 'HAZARD' },
    { id: 'scale', label: 'Scale & Settings', icon: Cpu, requiredRole: ['corporate_admin'], badge: '100k OPS' },
  ];

  const canAccessTab = (tab: TabDef): boolean => {
    if (!tab.requiredRole) return true;
    if (user.permissions.includes('all')) return true;
    return tab.requiredRole.includes(user.role);
  };

  return (
    <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-sm sticky top-[61px] z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
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
                className={`relative flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : isAccessible
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
                title={!isAccessible ? `Restricted to ${tab.requiredRole?.join(', ')}` : undefined}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : isAccessible ? 'text-slate-400' : 'text-slate-600'}`} />
                <span>{tab.label}</span>

                {!isAccessible && (
                  <Lock className="h-3 w-3 text-amber-500/70 ml-0.5" />
                )}

                {tab.badge && isAccessible && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold ${
                      tab.badge.includes('DETENTION') || tab.badge.includes('HAZARD')
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
