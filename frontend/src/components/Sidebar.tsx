import React, { useState } from 'react';
import {
  LayoutDashboard,
  Video,
  Truck,
  FileText,
  Droplets,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Check,
  ChevronDown,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { TabId } from './CorporateNavbar';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
  onSelectMarketMode: (mode: 'IN_GST' | 'US_FREIGHT') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMCP: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  marketMode,
  onSelectMarketMode,
  isCollapsed,
  onToggleCollapse,
  onOpenMCP
}) => {
  const { tenant, availableTenants, switchTenant } = useAuth();
  const [isFacilityMenuOpen, setIsFacilityMenuOpen] = useState(false);

  const NAV_ITEMS = [
    {
      id: 'home' as TabId,
      label: 'Logistics Command',
      icon: LayoutDashboard,
      badge: null,
      description: 'KPIs, real-time yard digital twin'
    },
    {
      id: 'video' as TabId,
      label: 'Live CCTV Matrix',
      icon: Video,
      badge: `${tenant.cameras_online} LIVE`,
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      description: 'Perspective homography & ANPR'
    },
    {
      id: 'track' as TabId,
      label: 'Fleet & Dock Dwell',
      icon: Truck,
      badge: '1 ALERT',
      badgeColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
      description: 'Detention tracking & SLAs'
    },
    {
      id: 'eway_bills' as TabId,
      label: 'E-Way Bills & eBOL',
      icon: FileText,
      badge: null,
      description: 'Statutory transit certificates'
    },
    {
      id: 'leak' as TabId,
      label: 'Roof Leak Moisture AI',
      icon: Droplets,
      badge: 'HAZARD',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
      description: 'Albedo drop & flood prevention'
    },
    {
      id: 'scale' as TabId,
      label: 'Facility & Compliance',
      icon: Settings,
      badge: null,
      description: 'SLA parameters & audit trail'
    }
  ];

  return (
    <aside
      className={`relative flex flex-col shrink-0 border-r transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-slate-900 border-slate-800 text-slate-200`}
      style={{
        boxShadow: '4px 0 24px -4px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-sky-500/25">
            <Layers className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                  YardSight<span className="text-cyan-400">.AI</span>
                </span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  GodownOS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                Industrial Vision & Physical AI
              </span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Facility Hub Switcher (Amazon / AWS Style) */}
      <div className="px-3 py-3 border-b border-slate-800/70 relative">
        <button
          onClick={() => setIsFacilityMenuOpen(!isFacilityMenuOpen)}
          className={`w-full flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800 p-2.5 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}
          title={tenant?.name || 'Active Logistics Hub'}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            {!isCollapsed && (
              <div className="text-left min-w-0">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Facility Hub
                </div>
                <div className="font-bold text-white text-xs truncate mt-0.5">
                  {tenant?.name?.split(' ')[0] || 'Amazon'} BLR1
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />}
        </button>

        {/* Facility Dropdown Popover */}
        {isFacilityMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
              <span>Switch Active Godown Hub:</span>
              <span className="text-emerald-400">● 3 Online</span>
            </div>
            <div className="mt-1 space-y-1">
              {availableTenants.map((t) => (
                <button
                  key={t.tenant_id}
                  onClick={() => {
                    switchTenant(t.tenant_id);
                    setIsFacilityMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                    tenant?.tenant_id === t.tenant_id
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Building2 className={`h-4 w-4 mt-0.5 shrink-0 ${tenant?.tenant_id === t.tenant_id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span className="truncate">{t.name}</span>
                      {tenant?.tenant_id === t.tenant_id && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{t.location}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Items (Vertical, No Horizontal Scrolling) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Operations Modules'}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer group relative ${
                isCollapsed ? 'justify-center p-3' : 'px-3.5 py-3 gap-3'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/10 border border-cyan-500/40 text-white font-bold shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
              title={isCollapsed ? `${item.label}: ${item.description}` : undefined}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}

              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Market Jurisdiction Selector (IN GST vs US eBOL) */}
      <div className="p-3 border-t border-slate-800/70">
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Statutory Jurisdiction
          </div>
        )}
        <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-1.5'} rounded-xl bg-slate-950/80 p-1 border border-slate-800`}>
          <button
            onClick={() => onSelectMarketMode('IN_GST')}
            className={`rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              marketMode === 'IN_GST'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Indian GST E-Way Bill (CBIC Rule 138)"
          >
            🇮🇳 {isCollapsed ? '' : 'GST'}
          </button>
          <button
            onClick={() => onSelectMarketMode('US_FREIGHT')}
            className={`rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              marketMode === 'US_FREIGHT'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="US Electronic BOL (DOT 49 CFR §373)"
          >
            🇺🇸 {isCollapsed ? '' : 'eBOL'}
          </button>
        </div>
      </div>

      {/* Persistent Telemetry Health Badge */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-950/60">
        <button
          onClick={onOpenMCP}
          className="w-full mb-2 flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
          title="Open Amazon Alexa+ Agent Context Protocol Console"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          {!isCollapsed && <span>Alexa+ MCP Console</span>}
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Database className="h-3 w-3 text-emerald-400" />
              SQLite 3 WAL Mode
            </span>
            <span className="text-emerald-400 font-bold">ACID 0.2ms</span>
          </div>
        )}
      </div>
    </aside>
  );
};
