import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Shield,
  LogOut,
  X,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { TabId } from './CorporateNavbar';
import type { UserRole } from '../context/AuthContext';

interface TopHeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const TAB_TITLES: Record<TabId, string> = {
  home: 'Logistics Command Center',
  video: 'Video Surveillance Matrix (OpenCV 5.0)',
  track: 'Fleet Dwell & Turnaround Operations',
  eway_bills: 'Electronic Way Bills & eBOL Hub',
  leak: 'Roof Leak Albedo AI',
  scale: 'Facility & Enterprise Settings'
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, switchRole, logout } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const NOTIFICATIONS = [
    {
      id: '1',
      title: 'Moisture Threshold Exceeded in Bay C-4',
      time: '2m ago',
      type: 'hazard',
      desc: 'Albedo drop detected 14.8 m² wet floor area near cement stacks.'
    },
    {
      id: '2',
      title: 'Carrier Detention Penalty Incurred',
      time: '14m ago',
      type: 'alert',
      desc: 'MH-12-RN-4819 exceeded 2hr free time window at Dock 02.'
    },
    {
      id: '3',
      title: 'E-Way Bill 191290034262 Signed',
      time: '38m ago',
      type: 'success',
      desc: 'Official GST Form EWB-01 generated and signed via OpenCV ANPR unwarp.'
    }
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      {/* Left: Amazon / AWS Style Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="font-semibold">{tenant?.organization || 'Amazon ATS Supply Chain'}</span>
        </div>
        <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {tenant?.name?.split(' ')[0] || 'Amazon'} BLR1 Hub
        </span>
        <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
        <span className="font-bold text-slate-900 dark:text-white">
          {TAB_TITLES[activeTab]}
        </span>
      </nav>

      {/* Right: Theme Toggle, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Operational Alerts"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              3
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Operational Alerts
                  </span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {n.type === 'hazard' && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
                        {n.type === 'alert' && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />}
                        {n.type === 'success' && <FileCheck2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                        <span className="truncate">{n.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 p-1.5 pr-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
            title="User Profile & Role Context"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="h-7 w-7 rounded-lg object-cover ring-2 ring-cyan-500/30"
            />
            <div className="text-left hidden md:block">
              <div className="font-bold text-slate-900 dark:text-white text-xs leading-none">
                {user.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                {user.role === 'corporate_admin' ? 'Corp Admin' : user.role}
              </div>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-cyan-500/40"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                  <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    {user.role_label}
                  </span>
                </div>
              </div>

              {/* Role Context Switcher */}
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Switch Role Context</span>
                </div>
                <div className="space-y-1">
                  {[
                    { role: 'corporate_admin' as UserRole, label: 'Corporate Operations VP' },
                    { role: 'yard_master' as UserRole, label: 'Yard Dispatch Master' },
                    { role: 'security_guard' as UserRole, label: 'Security Gate Specialist' }
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                        user.role === r.role
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r.label}</span>
                      {user.role === r.role && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <button
                  onClick={() => {
                    onSelectTab('scale');
                    setIsProfileMenuOpen(false);
                  }}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Edit Profile →
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
