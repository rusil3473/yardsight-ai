import React, { useState } from 'react';
import {
  Building2,
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
  X,
  LayoutDashboard,
  Video,
  Truck,
  FileText,
  CloudRain,
  Settings,
  Lock,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

export type TabId = 'home' | 'video' | 'track' | 'eway_bills' | 'leak' | 'scale';

interface CorporateNavbarProps {
  marketMode: 'IN_GST' | 'US_FREIGHT';
  setMarketMode: (mode: 'IN_GST' | 'US_FREIGHT') => void;
  onOpenMCP: () => void;
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

export const CorporateNavbar: React.FC<CorporateNavbarProps> = ({
  marketMode,
  setMarketMode,
  onOpenMCP,
  activeTab,
  setActiveTab,
}) => {
  const { user, tenant, availableTenants, switchRole, switchTenant, setIsAuthModalOpen, logout } = useAuth();
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

  const roleColors: Record<UserRole, { badge: string; text: string; bg: string }> = {
    corporate_admin: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', text: 'Corporate VP / Admin', bg: 'bg-amber-500' },
    yard_master: { badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', text: 'Hub Yard Master', bg: 'bg-cyan-500' },
    security_guard: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', text: 'Gate Security Guard', bg: 'bg-emerald-500' },
    guest: { badge: 'border-slate-700 bg-slate-800 text-slate-400', text: 'Guest Evaluator', bg: 'bg-slate-600' }
  };

  const NOTIFICATIONS = [
    { id: 1, title: 'Detention Alert Triggered', text: 'Truck TRK-9041 exceeded 2.0hr free time at Dock 02 (Fee: ₹1,000 / $31.25)', time: '2m ago', type: 'urgent' },
    { id: 2, title: 'Roof Specular Anomaly Detected', text: 'Bay C-4 slab diffuse reflectance dropped 34% (Wet area: 14.8 m²)', time: '7m ago', type: 'warning' },
    { id: 3, title: 'Gate ANPR Verified & Cleared', text: 'Truck MH-12-RN-4819 verified with Part A/B GST E-Way Bill', time: '12m ago', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-black/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 gap-2">
        {/* Left: Brand Identity & Tenant Hub */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="h-4.5 w-4.5" />
              <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  YardSight<span className="text-cyan-400 font-bold">.AI</span>
                </span>
                <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                  GodownOS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden xl:block leading-none mt-0.5">
                Physical AI & Industrial Vision
              </p>
            </div>
          </div>

          {/* Multi-Tenant Facility Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Facility Hub</div>
                <div className="font-bold text-white text-[11px] truncate max-w-[130px]">{tenant.name.split(' ')[0]}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
            </button>

            {isTenantMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Logistics Hub Location:</span>
                  <span className="text-emerald-400">● 3 Online</span>
                </div>
                <div className="mt-1 space-y-1">
                  {availableTenants.map((t) => (
                    <button
                      key={t.tenant_id}
                      onClick={() => {
                        switchTenant(t.tenant_id);
                        setIsTenantMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                        tenant.tenant_id === t.tenant_id
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <Building2 className={`h-4 w-4 mt-0.5 ${tenant.tenant_id === t.tenant_id ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div className="flex-1">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{t.name}</span>
                          {tenant.tenant_id === t.tenant_id && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400">{t.location}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
                          <span>{t.active_docks} Docks</span>
                          <span>•</span>
                          <span>{t.cameras_online} Cameras</span>
                          <span>•</span>
                          <span>{t.currency} ({t.currency_symbol})</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Integrated Navigation Tabs (Unified Header Experience) */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl bg-slate-900/70 border border-slate-800/80 p-1 backdrop-blur-md">
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
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : isAccessible
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={!isAccessible ? `Restricted to ${tab.requiredRole?.join(', ')}` : undefined}
              >
                <Icon className={`h-3.5 w-3.5 ${
                  isActive ? 'text-cyan-400' : isAccessible ? 'text-slate-400' : 'text-slate-600'
                }`} />
                <span className="hidden sm:inline">{tab.label}</span>

                {!isAccessible && (
                  <Lock className="h-2.5 w-2.5 text-amber-500/60" />
                )}

                {tab.badge && isAccessible && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold border leading-tight ${
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
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(199,89%,48%), transparent)',
                      boxShadow: '0 0 6px hsla(199,89%,48%,0.7)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Market Switcher, Notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Amazon Alexa+ MCP Button */}
          <button
            onClick={onOpenMCP}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm cursor-pointer"
            title="Open Alexa+ Model Context Protocol Console"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Alexa+</span> MCP
          </button>

          {/* Market Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setMarketMode('IN_GST')}
              className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                marketMode === 'IN_GST'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Indian GST E-Way Bill Mode"
            >
              🇮🇳 GST
            </button>
            <button
              onClick={() => setMarketMode('US_FREIGHT')}
              className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                marketMode === 'US_FREIGHT'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="US Electronic Bill of Lading (eBOL) Mode"
            >
              🇺🇸 eBOL
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Real-Time Yard Alerts"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                3
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Live Yard Telemetry Alerts</span>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-2.5 border text-xs ${
                        n.type === 'urgent'
                          ? 'bg-red-950/30 border-red-500/40 text-red-200'
                          : n.type === 'warning'
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 p-1.5 pr-2 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <img src={user.avatar} alt={user.name} className="h-6.5 w-6.5 rounded-lg object-cover" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{user.name.split(' ')[0]}</div>
                <div className="text-[9px] font-semibold text-cyan-400 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in duration-150 text-xs">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                  <div className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${roleColors[user.role].badge}`}>
                    {roleColors[user.role].text}
                  </div>
                </div>

                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  1-Click Role Switcher (Judge Eval):
                </div>

                <div className="space-y-1">
                  {(['corporate_admin', 'yard_master', 'security_guard'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                        user.role === r
                          ? 'bg-slate-800 text-cyan-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="capitalize">{r.replace('_', ' ')}</span>
                      {user.role === r && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Custom Login / OTP
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
