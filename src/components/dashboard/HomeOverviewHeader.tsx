import React from 'react';
import { Plus, Camera, Settings } from 'lucide-react';
import type { TabId } from '../Sidebar';

interface HomeOverviewHeaderProps {
  tenantName: string;
  tenantLocation: string;
  activeDocks: number;
  camerasOnline: number;
  onOpenCheckIn: () => void;
  onNavigateTab: (tab: TabId) => void;
}

export const HomeOverviewHeader: React.FC<HomeOverviewHeaderProps> = ({
  tenantName,
  tenantLocation,
  activeDocks,
  camerasOnline,
  onOpenCheckIn,
  onNavigateTab
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Operational Status: Normal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {activeDocks} Active Bays • {camerasOnline} CCTV Streams Synced
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Logistics Command Center
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {tenantName} • {tenantLocation}
          </p>
        </div>

        {/* Quick Action Commands */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 100%)',
              boxShadow: '0 4px 18px rgba(6,182,212,0.3)'
            }}
            title="Register an arriving freight truck at the gate"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Inbound Check-In</span>
          </button>

          <button
            onClick={() => onNavigateTab('video')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
            title="View live CCTV streams with license homography unwarping"
          >
            <Camera className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Live CCTV Matrix</span>
          </button>

          <button
            onClick={() => onNavigateTab('scale')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 p-2.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Facility SLA & User Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
