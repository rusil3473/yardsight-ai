import React from 'react';
import { Camera, Truck, Activity, CheckCircle2, ChevronRight, Clock, Maximize2 } from 'lucide-react';
import type { TabId } from '../Sidebar';

interface ActivityItem {
  type: 'DETENTION' | 'VISION' | 'LEAK';
  time: string;
  event: string;
  desc: string;
  badge: string;
  badgeColor: string;
}

interface RecentActivityFeedProps {
  truckList: any[];
  tenantName: string;
  activities: ActivityItem[];
  eventFilter: 'ALL' | 'DETENTION' | 'VISION' | 'LEAK';
  onSetEventFilter: (filter: 'ALL' | 'DETENTION' | 'VISION' | 'LEAK') => void;
  onNavigateTab: (tab: TabId) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  truckList,
  tenantName,
  activities,
  eventFilter,
  onSetEventFilter,
  onNavigateTab
}) => {
  const badgeColorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    red: 'bg-red-500/10 text-red-400 border-red-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  const filteredActivities = activities.filter(act => {
    if (eventFilter === 'ALL') return true;
    return act.type === eventFilter;
  });

  return (
    <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
      <div>
        {/* Embedded Live Camera Box */}
        <div className="rounded-xl border border-slate-800 bg-black/80 overflow-hidden relative shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-bold text-white">CAM-01 Gate Entry</span>
              <span className="text-[9px] rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5">ANPR Active</span>
            </div>
            <button
              onClick={() => onNavigateTab('video')}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full Feeds</span>
            </button>
          </div>

          {/* CCTV Camera Feed with ANPR Detection */}
          <div className="relative h-36 bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center p-3">
            {truckList.length === 0 ? (
              <div className="relative w-full max-w-xs h-24 rounded-lg bg-slate-900/60 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center p-2">
                <Camera className="h-6 w-6 text-slate-500 mb-1" />
                <div className="text-[11px] font-bold text-slate-300">Gate 1 Inbound Lane Empty</div>
                <div className="text-[9px] text-slate-500">OpenCV 5 ANPR Sensor Active • Awaiting Vehicle</div>
              </div>
            ) : (
              <>
                <div className="relative w-full max-w-xs h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                  <Truck className="h-8 w-8 text-slate-600 mb-1" />
                  <div className="text-[10px] text-slate-400">{truckList[0].carrier_name} • Inbound Lane 1</div>
                  <div className="absolute bottom-2 px-2.5 py-0.5 rounded bg-slate-950 border-2 border-cyan-400 shadow-md shadow-cyan-500/30 flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-cyan-300 text-xs tracking-wider">{truckList[0].plate_number}</span>
                    <span className="text-[9px] text-emerald-400 font-bold">96.4%</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 rounded-lg bg-black/80 border border-cyan-500/40 p-1.5 backdrop-blur-md text-[9px] font-mono text-cyan-300 space-y-0.5">
                  <div className="text-slate-400">Perspective Unwarp:</div>
                  <div>24.5° corrected</div>
                  <div className="text-emerald-400">Part A/B Valid</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Event Log Filter Tabs */}
        <div className="mt-4 flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Live Event Stream</span>
          </h3>

          <div className="flex items-center gap-1 text-[10px]">
            {(['ALL', 'DETENTION', 'VISION', 'LEAK'] as const).map(f => (
              <button
                key={f}
                onClick={() => onSetEventFilter(f)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  eventFilter === f
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="h-6 w-6 text-emerald-500/60 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-600 dark:text-slate-400">Gate Queue & Activity Stream Idle</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Real-time gate and ANPR events will stream here once trucks arrive.</div>
            </div>
          ) : (
            filteredActivities.map((act, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 p-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{act.event}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {act.time}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{act.desc}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`rounded px-2 py-0.5 text-[9px] font-bold border ${badgeColorMap[act.badgeColor]}`}>
                    {act.badge}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span>Filtered for {tenantName}</span>
        <button
          onClick={() => onNavigateTab('track')}
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
        >
          View Full Fleet Yard →
        </button>
      </div>
    </div>
  );
};
