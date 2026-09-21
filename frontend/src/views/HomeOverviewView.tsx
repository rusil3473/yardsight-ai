import React from 'react';
import {
  Truck,
  Video,
  FileCheck,
  Settings,
  ArrowUpRight,
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock
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
      value: '4',
      unit: 'Semi-Trucks',
      subtitle: '1 Incurring Detention',
      trend: { value: '+12%', direction: 'up' as const, label: 'vs yesterday' },
      color: 'amber',
      icon: Truck,
      tab: 'track' as TabId
    },
    {
      title: 'CCTV Feeds Online',
      value: '4 / 4',
      unit: 'Cameras',
      subtitle: 'OpenCV 5 ANPR Active',
      trend: { value: '99.9%', direction: 'up' as const, label: 'Uptime' },
      color: 'cyan',
      icon: Video,
      tab: 'video' as TabId
    },
    {
      title: 'Roof Flood Hazard',
      value: '14.8',
      unit: 'm² Wet Slab',
      subtitle: isIndia ? '₹18.4L Inventory at Risk' : '$22.5k Inventory at Risk',
      trend: { value: '18.2 L/hr', direction: 'down' as const, label: 'Accumulating' },
      color: 'red',
      icon: Droplets,
      tab: 'leak' as TabId
    },
    {
      title: 'Transport Compliance',
      value: isIndia ? 'EWB-01' : 'eBOL',
      unit: isIndia ? 'GST Form' : 'US Electronic',
      subtitle: 'Digital Signature & QR Ready',
      trend: { value: '100%', direction: 'up' as const, label: 'Zero Paper' },
      color: 'emerald',
      icon: FileCheck,
      tab: 'eway_bills' as TabId
    }
  ];

  const RECENT_ACTIVITIES = [
    { time: '10:42 AM', event: 'Gate Barrier Raised', desc: 'Truck MH-12-RN-4819 verified by ANPR (96.4% confidence)', badge: 'ANPR', badgeColor: 'cyan' },
    { time: '10:35 AM', event: 'Detention Alert', desc: 'TRK-9041 exceeded 120min free time at Dock 02', badge: 'DETENTION', badgeColor: 'red' },
    { time: '10:20 AM', event: 'Leak Anomaly Detected', desc: 'Camera 04 specular spike in Bay C-4 (Area: 4.8 m²)', badge: 'PHYSICAL AI', badgeColor: 'amber' },
    { time: '10:05 AM', event: 'E-Way Bill Signed', desc: 'Part B transshipment QR code authenticated', badge: 'COMPLIANCE', badgeColor: 'emerald' },
  ];

  const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/15', glow: 'shadow-amber-500/5' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/15', glow: 'shadow-cyan-500/5' },
    red: { text: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', glow: 'shadow-red-500/5' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', glow: 'shadow-emerald-500/5' },
  };

  const badgeColorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    red: 'bg-red-500/10 text-red-400 border-red-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="relative rounded-2xl border border-slate-800/50 p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsla(220,25%,11%,0.95) 0%, hsla(230,30%,13%,0.9) 50%, hsla(220,25%,11%,0.95) 100%)',
          boxShadow: '0 8px 30px -10px rgba(0,0,0,0.4), inset 0 1px 0 hsla(0,0%,100%,0.03)'
        }}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-96 h-48 opacity-40" style={{ background: 'radial-gradient(ellipse, hsla(199,89%,48%,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-36 opacity-30" style={{ background: 'radial-gradient(ellipse, hsla(260,60%,40%,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {tenant.name}
              </span>
              <span className="text-[11px] text-slate-500">{tenant.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Logistics Command Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="font-semibold text-slate-200">{user.name}</span> • {user.role_label}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('video')}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(199,89%,44%), hsl(217,91%,55%))',
                boxShadow: '0 4px 15px hsla(199,89%,48%,0.25)'
              }}
            >
              <Video className="h-4 w-4" />
              <span>Open Live CCTV</span>
            </button>
            <button
              onClick={() => onNavigateTab('scale')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reddit Field Grounding Banner */}
      <RedditLogisticsBanner />

      {/* Executive KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {YARD_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          const c = colorMap[kpi.color];
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className={`group cursor-pointer rounded-2xl ${c.bg} border ${c.border} p-5 transition-all duration-300 hover:shadow-xl ${c.glow} relative overflow-hidden`}
              style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)' }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.title}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} border ${c.border} ${c.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-extrabold ${c.text}`} style={{ fontFamily: 'var(--font-heading)' }}>{kpi.value}</span>
                  <span className="text-xs font-medium text-slate-400">{kpi.unit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{kpi.subtitle}</div>

                <div className="mt-4 pt-3 border-t border-slate-800/30 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1">
                    {kpi.trend.direction === 'up'
                      ? <TrendingUp className="h-3 w-3 text-emerald-400" />
                      : <TrendingDown className="h-3 w-3 text-red-400" />
                    }
                    <span className={kpi.trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>{kpi.trend.value}</span>
                    <span className="text-slate-500">{kpi.trend.label}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-500 font-semibold group-hover:text-cyan-400 transition-colors">
                    View <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Throughput Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Turnaround Performance */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/40 border border-slate-800/50 p-5 backdrop-blur-sm" style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/40">
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Hourly Gate & Dock Turnaround</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Truck arrivals vs Average Dwell (Target: &lt;60 min)</p>
            </div>
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              SLA Met: 89.4%
            </span>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-3 h-44 items-end pb-2">
            {[
              { hour: '06:00', trucks: 6, dwell: 42 },
              { hour: '08:00', trucks: 14, dwell: 68 },
              { hour: '10:00', trucks: 22, dwell: 84 },
              { hour: '12:00', trucks: 18, dwell: 55 },
              { hour: '14:00', trucks: 12, dwell: 48 },
              { hour: '16:00', trucks: 9, dwell: 39 },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {col.trucks} trucks
                </div>
                <div className={`text-[10px] font-mono font-bold ${col.dwell > 60 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {col.dwell}m
                </div>
                <div
                  className={`w-full rounded-lg transition-all duration-500 group-hover:brightness-125 ${
                    col.dwell > 60
                      ? 'bg-gradient-to-t from-red-600/80 to-amber-500/70'
                      : 'bg-gradient-to-t from-cyan-600/60 to-emerald-400/50'
                  }`}
                  style={{
                    height: `${(col.dwell / 90) * 100}%`,
                    boxShadow: col.dwell > 60
                      ? '0 0 12px hsla(0,84%,60%,0.15)'
                      : '0 0 12px hsla(187,85%,53%,0.1)'
                  }}
                />
                <div className="text-[10px] text-slate-500 font-semibold">{col.hour}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" /> &lt;60m Free Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500/70" /> &gt;60m Detention (${isIndia ? '₹2,400' : '$75'}/hr)
            </span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/40 border border-slate-800/50 p-5 backdrop-blur-sm" style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/40">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Live Activity Feed</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {RECENT_ACTIVITIES.map((act, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-950/30 border border-slate-800/40 p-3.5 hover:border-slate-700/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{act.event}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {act.time}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{act.desc}</p>
                <div className="mt-2">
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold border ${badgeColorMap[act.badgeColor]}`}>
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
