import React from 'react';
import {
  Truck,
  Video,
  FileCheck,
  ShieldCheck,
  ArrowUpRight,
  Droplets
} from 'lucide-react';
import { RedditLogisticsBanner } from '../components/RedditLogisticsBanner';
import { useAuth } from '../context/AuthContext';
import type { TabId } from '../components/CorporateTabNav';

interface HomeOverviewViewProps {
  onNavigateTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({ onNavigateTab, marketMode }) => {
  const { tenant, user } = useAuth();
  const isIndia = marketMode === 'IN_GST';

  const YARD_KPIS = [
    {
      title: 'Active Freight Dwell',
      value: '4 Semi-Trucks',
      subtitle: '1 Incurring Detention ($75/hr)',
      trend: '+12% vs yesterday',
      color: 'text-amber-400',
      icon: Truck,
      tab: 'track' as TabId
    },
    {
      title: 'CCTV Feeds Online',
      value: '4 / 4 Cameras',
      subtitle: 'OpenCV 5 ANPR + Specular AI',
      trend: '99.9% Uptime',
      color: 'text-cyan-400',
      icon: Video,
      tab: 'video' as TabId
    },
    {
      title: 'Roof Flood Hazard',
      value: '14.8 m² Wet Slab',
      subtitle: isIndia ? '₹18.4L Inventory at Risk' : '$22,500 Inventory at Risk',
      trend: 'Accumulating 18.2 L/hr',
      color: 'text-red-400',
      icon: Droplets,
      tab: 'leak' as TabId
    },
    {
      title: 'Transport Compliance',
      value: isIndia ? 'GST Form EWB-01' : 'US Electronic BOL',
      subtitle: 'Digital Signature & QR Ready',
      trend: 'Zero Paper Bottlenecks',
      color: 'text-emerald-400',
      icon: FileCheck,
      tab: 'eway_bills' as TabId
    }
  ];

  const RECENT_ACTIVITIES = [
    { time: '10:42 AM', event: 'Gate Barrier Raised', desc: 'Truck MH-12-RN-4819 verified by ANPR Homography (96.4% confidence)', badge: 'ANPR CLEARED' },
    { time: '10:35 AM', event: 'Detention Penalty Clock Started', desc: 'Truck TRK-9041 exceeded 120min free time at Dock 02 (Fee: $125.00)', badge: 'DETENTION' },
    { time: '10:20 AM', event: 'Monsoon Micro-Leak Alert', desc: 'Camera 04 detected specular reflection spike in Bay C-4 (Area: 4.8 m²)', badge: 'PHYSICAL AI' },
    { time: '10:05 AM', event: 'E-Way Bill Authenticated', desc: 'Part B transshipment QR code signed with GSTIN27AAACG0192Q1Z8', badge: 'COMPLIANCE' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/30">
              {tenant.name}
            </span>
            <span className="text-xs text-slate-400">{tenant.location}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Logistics Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Welcome back, <span className="font-bold text-white">{user.name}</span> ({user.role_label}). Real-time yard telemetry is synchronized.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('video')}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Video className="h-4 w-4" />
            <span>Open Live CCTV Matrix</span>
          </button>
          <button
            onClick={() => onNavigateTab('scale')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Scale Telemetry</span>
          </button>
        </div>
      </div>

      {/* Reddit Field Grounding Banner */}
      <RedditLogisticsBanner />

      {/* Executive KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {YARD_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 transition-all hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 group-hover:text-cyan-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className={`mt-3 text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">{kpi.subtitle}</div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{kpi.trend}</span>
                <span className="flex items-center gap-0.5 text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Inspect <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Throughput Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Turnaround Performance */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Hourly Gate & Dock Turnaround</h3>
              <p className="text-xs text-slate-400">Truck arrivals vs Average Dwell Minutes (Target: &lt;60m)</p>
            </div>
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              SLA Met: 89.4%
            </span>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-2 h-44 items-end pb-2">
            {[
              { hour: '06:00', trucks: 6, dwell: 42 },
              { hour: '08:00', trucks: 14, dwell: 68 },
              { hour: '10:00', trucks: 22, dwell: 84 },
              { hour: '12:00', trucks: 18, dwell: 55 },
              { hour: '14:00', trucks: 12, dwell: 48 },
              { hour: '16:00', trucks: 9, dwell: 39 },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="text-[10px] font-mono text-cyan-400">{col.dwell}m</div>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    col.dwell > 60
                      ? 'bg-gradient-to-t from-red-600 to-amber-500'
                      : 'bg-gradient-to-t from-cyan-600 to-emerald-400'
                  }`}
                  style={{ height: `${(col.dwell / 90) * 100}%` }}
                />
                <div className="text-[10px] text-slate-400 font-semibold">{col.hour}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> &lt;60m Free Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" /> &gt;60m Detention Incurred ($75/hr)
            </span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Facility Activity Feed</h3>
            <span className="text-xs text-cyan-400 font-mono">Real-Time</span>
          </div>

          <div className="mt-4 space-y-3">
            {RECENT_ACTIVITIES.map((act, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{act.event}</span>
                  <span className="font-mono text-[10px] text-slate-400">{act.time}</span>
                </div>
                <p className="mt-1 text-slate-300 text-[11px]">{act.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                    {act.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
