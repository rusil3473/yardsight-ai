import React from 'react';
import { CheckCircle2, Plus, Camera } from 'lucide-react';
import type { TabId } from '../Sidebar';

interface HomeGettingStartedGuideProps {
  activeDocks: number;
  onOpenCheckIn: () => void;
  onNavigateTab: (tab: TabId) => void;
}

export const HomeGettingStartedGuide: React.FC<HomeGettingStartedGuideProps> = ({
  activeDocks,
  onOpenCheckIn,
  onNavigateTab
}) => {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-slate-900/40 p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              Facility Live • Zero Dwell Infractions
            </span>
          </div>
          <h2
            className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome to your Logistics Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            All bays are nominal and ready. Start live physical AI tracking by registering your first arriving freight truck or linking your gate camera stream.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCheckIn}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Check-In First Truck</span>
          </button>
          <button
            onClick={() => onNavigateTab('video')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <Camera className="h-3.5 w-3.5 text-cyan-500" />
            <span>Connect CCTV Stream</span>
          </button>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>1. {activeDocks} Loading Bays Initialized & Clear</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <div className="h-4 w-4 rounded-full border border-cyan-500/60 bg-cyan-500/10 flex items-center justify-center text-[10px] text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
            2
          </div>
          <span>2. Gate Check-In Starts Turnaround SLA Clock</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <div className="h-4 w-4 rounded-full border border-cyan-500/60 bg-cyan-500/10 flex items-center justify-center text-[10px] text-cyan-600 dark:text-cyan-400 font-bold shrink-0">
            3
          </div>
          <span>3. Auto-Generate GST E-Way Bills & eBOL</span>
        </div>
      </div>
    </div>
  );
};
