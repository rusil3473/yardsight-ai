import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getSidebarNavItems,
  type TabId
} from './sidebar/SidebarNavItems';
import { SidebarFacilitySelector } from './sidebar/SidebarFacilitySelector';
import { SidebarUserProfile } from './sidebar/SidebarUserProfile';

export type { TabId };

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
  onSelectMarketMode: (mode: 'IN_GST' | 'US_FREIGHT') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  cameraCount?: number;
  detentionCount?: number;
  hasLeak?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  marketMode,
  onSelectMarketMode,
  isCollapsed,
  onToggleCollapse,
  cameraCount = 4,
  detentionCount = 0,
  hasLeak = false
}) => {
  const navItems = getSidebarNavItems(cameraCount, detentionCount, hasLeak);

  return (
    <aside
      className={`relative flex flex-col shrink-0 border-r transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-slate-950 border-slate-800 text-slate-200`}
      style={{
        boxShadow: '4px 0 24px -4px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25">
            <span className="text-white font-mono font-black text-sm">YS</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 font-mono">
                YardSight<span className="text-cyan-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 truncate font-mono">
                OPENCV + NEBIUS VLM
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Facility Selector & Market Mode Switcher */}
      {!isCollapsed && (
        <SidebarFacilitySelector
          marketMode={marketMode}
          onSelectMarketMode={onSelectMarketMode}
        />
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & CASL Role Menu */}
      <SidebarUserProfile isCollapsed={isCollapsed} />
    </aside>
  );
};
