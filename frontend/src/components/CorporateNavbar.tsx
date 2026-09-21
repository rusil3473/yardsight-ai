import React, { useState } from 'react';
import {
  Building2,
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

interface CorporateNavbarProps {
  marketMode: 'IN_GST' | 'US_FREIGHT';
  setMarketMode: (mode: 'IN_GST' | 'US_FREIGHT') => void;
  onOpenMCP: () => void;
}

export const CorporateNavbar: React.FC<CorporateNavbarProps> = ({
  marketMode,
  setMarketMode,
  onOpenMCP,
}) => {
  const { user, tenant, availableTenants, switchRole, switchTenant, setIsAuthModalOpen, logout } = useAuth();
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const roleColors: Record<UserRole, { badge: string; text: string; bg: string }> = {
    corporate_admin: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300', text: 'Corporate VP / Admin', bg: 'bg-amber-500' },
    yard_master: { badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', text: 'Hub Yard Master', bg: 'bg-cyan-500' },
    security_guard: { badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', text: 'Gate Security Guard', bg: 'bg-emerald-500' },
    guest: { badge: 'border-slate-700 bg-slate-800 text-slate-400', text: 'Guest Evaluator', bg: 'bg-slate-600' }
  };

  const NOTIFICATIONS = [
    { id: 1, title: 'Detention Alert Triggered', text: 'Truck TRK-9041 exceeded 2.0hr free time at Dock 02 (Fee: $125)', time: '2m ago', type: 'urgent' },
    { id: 2, title: 'Roof Specular Anomaly Detected', text: 'Bay C-4 slab diffuse reflectance dropped 34% (Wet: 4.8 m²)', time: '7m ago', type: 'warning' },
    { id: 3, title: 'Gate ANPR Cleared', text: 'Truck MH-12-RN-4819 verified with Part A/B GST E-Way Bill', time: '12m ago', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand Identity & Tenant Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <Building2 className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">YardSight AI</span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  GodownOS Enterprise
                </span>
                <span className="hidden lg:inline rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous CCTV ANPR, Specular Roof Leak & Dock Detention Co-Pilot
              </p>
            </div>
          </div>

          {/* Multi-Tenant Facility Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Facility Hub</div>
                <div className="font-bold text-white truncate max-w-[150px]">{tenant.name.split(' ')[0]}...</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {isTenantMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Logistics Hub Tenant:
                </div>
                <div className="mt-1 space-y-1">
                  {availableTenants.map((t) => (
                    <button
                      key={t.tenant_id}
                      onClick={() => {
                        switchTenant(t.tenant_id);
                        setIsTenantMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors ${
                        tenant.tenant_id === t.tenant_id
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <Building2 className={`h-4 w-4 ${tenant.tenant_id === t.tenant_id ? 'text-cyan-400' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{t.name}</div>
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

        {/* Right: Actions, Notifications, Market Toggle, User Role Pill */}
        <div className="flex items-center gap-2.5">
          {/* Amazon Alexa+ MCP Button */}
          <button
            onClick={onOpenMCP}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors shadow-sm"
            title="Open Alexa+ Model Context Protocol Console"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Alexa+ MCP</span>
          </button>

          {/* Market Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setMarketMode('IN_GST')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                marketMode === 'IN_GST'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇮🇳 GST EWB
            </button>
            <button
              onClick={() => setMarketMode('US_FREIGHT')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                marketMode === 'US_FREIGHT'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇺🇸 US eBOL
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Real-Time Yard Alerts"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Yard Telemetry Alerts</span>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-slate-300">
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
              className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1.5 pr-2.5 hover:border-slate-700 transition-colors"
            >
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-lg object-cover" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{user.name.split(' ')[0]}</div>
                <div className="text-[10px] font-semibold text-cyan-400 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150 text-xs">
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
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
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
                    className="text-cyan-400 hover:underline text-[11px] font-semibold"
                  >
                    Custom Login / OTP
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-[11px]"
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
