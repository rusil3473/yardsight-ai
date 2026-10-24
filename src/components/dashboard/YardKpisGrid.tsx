import React from 'react';
import { Truck, Video, Droplets, FileCheck, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import type { TabId } from '../Sidebar';

interface YardKpisGridProps {
  truckList: any[];
  detentionTrucks: any[];
  cameraCount: number;
  isIndia: boolean;
  onNavigateTab: (tab: TabId) => void;
}

export const YardKpisGrid: React.FC<YardKpisGridProps> = ({
  truckList,
  detentionTrucks,
  cameraCount,
  isIndia,
  onNavigateTab
}) => {
  const YARD_KPIS = [
    {
      title: 'Active Freight Dwell',
      value: String(truckList.length),
      unit: 'Semi-Trucks',
      subtitle: detentionTrucks.length > 0 
        ? `${detentionTrucks.length} Incurring Detention` 
        : 'All bays clear & on schedule',
      trend: { value: String(truckList.length), direction: 'up' as const, label: 'Live' },
      color: 'amber',
      icon: Truck,
      tab: 'track' as TabId,
      sparkline: [0, 0, 0, 0, 0, 0, truckList.length]
    },
    {
      title: 'CCTV Feeds Online',
      value: `${cameraCount} / ${cameraCount}`,
      unit: 'Cameras',
      subtitle: cameraCount > 0 ? 'OpenCV 5 ANPR Active' : '0 Cameras Synced • Standby',
      trend: { value: cameraCount > 0 ? '99.9%' : '0%', direction: 'up' as const, label: cameraCount > 0 ? 'Uptime' : 'Standby' },
      color: 'cyan',
      icon: Video,
      tab: 'video' as TabId,
      sparkline: [cameraCount, cameraCount, cameraCount, cameraCount, cameraCount, cameraCount, cameraCount]
    },
    {
      title: 'Roof Flood Hazard',
      value: '0.0',
      unit: 'm² Wet Slab',
      subtitle: 'Slab Dry • Zero Inventory at Risk',
      trend: { value: '0.0 L/hr', direction: 'up' as const, label: 'Normal' },
      color: 'emerald',
      icon: Droplets,
      tab: 'leak' as TabId,
      sparkline: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Transport Compliance',
      value: truckList.length > 0 ? (isIndia ? 'EWB-01' : 'eBOL') : '0',
      unit: isIndia ? 'GST Forms' : 'US eBOLs',
      subtitle: truckList.length > 0 ? 'Digital Verification Ready' : 'Zero Pending Forms',
      trend: { value: '100%', direction: 'up' as const, label: 'Zero Paper' },
      color: 'emerald',
      icon: FileCheck,
      tab: 'eway_bills' as TabId,
      sparkline: [0, 0, 0, 0, 0, 0, truckList.length]
    }
  ];

  const colorMap: Record<string, { text: string; bg: string; border: string; glow: string; stroke: string }> = {
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'from-amber-500/15', stroke: '#f59e0b' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'from-cyan-500/15', stroke: '#06b6d4' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'from-red-500/15', stroke: '#ef4444' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'from-emerald-500/15', stroke: '#10b981' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {YARD_KPIS.map((kpi, idx) => {
        const Icon = kpi.icon;
        const c = colorMap[kpi.color];
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab(kpi.tab)}
            className={`group cursor-pointer rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:${c.border} p-5 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 relative overflow-hidden`}
          >
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} border ${c.border} ${c.text} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl sm:text-3xl font-extrabold ${c.text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {kpi.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{kpi.unit}</span>
                </div>

                <div className="w-16 h-7">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 60 25">
                    <polyline
                      fill="none"
                      stroke={c.stroke}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={kpi.sparkline.map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 60},${25 - ((val - Math.min(...kpi.sparkline)) / (Math.max(...kpi.sparkline) - Math.min(...kpi.sparkline) || 1)) * 20}`).join(' ')}
                    />
                  </svg>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-1 font-medium">{kpi.subtitle}</div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1">
                  {kpi.trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={kpi.trend.direction === 'up' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{kpi.trend.value}</span>
                  <span className="text-slate-500">{kpi.trend.label}</span>
                </span>
                <span className="flex items-center gap-0.5 text-slate-500 font-semibold group-hover:text-cyan-400 transition-colors">
                  Inspect <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
