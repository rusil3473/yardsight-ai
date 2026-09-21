import React, { useState } from 'react';
import {
  Truck,
  Video,
  FileCheck,
  Settings,
  ArrowUpRight,
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquareQuote,
  X,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { TabId } from '../components/CorporateTabNav';

interface HomeOverviewViewProps {
  onNavigateTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({ onNavigateTab, marketMode }) => {
  const { tenant, user } = useAuth();
  const isIndia = marketMode === 'IN_GST';
  const [isFieldValidationOpen, setIsFieldValidationOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const YARD_KPIS = [
    {
      title: 'Active Freight Dwell',
      value: '4',
      unit: 'Semi-Trucks',
      subtitle: '1 Incurring Detention',
      trend: { value: '+12%', direction: 'up' as const, label: 'vs yesterday' },
      color: 'amber',
      icon: Truck,
      tab: 'track' as TabId,
      sparkline: [2, 3, 2, 5, 4, 3, 4]
    },
    {
      title: 'CCTV Feeds Online',
      value: '4 / 4',
      unit: 'Cameras',
      subtitle: 'OpenCV 5 ANPR Active',
      trend: { value: '99.9%', direction: 'up' as const, label: 'Uptime' },
      color: 'cyan',
      icon: Video,
      tab: 'video' as TabId,
      sparkline: [4, 4, 4, 4, 4, 4, 4]
    },
    {
      title: 'Roof Flood Hazard',
      value: '14.8',
      unit: 'm² Wet Slab',
      subtitle: isIndia ? '₹18.4L Inventory at Risk' : '$22.5k Inventory at Risk',
      trend: { value: '18.2 L/hr', direction: 'down' as const, label: 'Accumulating' },
      color: 'red',
      icon: Droplets,
      tab: 'leak' as TabId,
      sparkline: [2, 4, 6, 9, 12, 14, 14.8]
    },
    {
      title: 'Transport Compliance',
      value: isIndia ? 'EWB-01' : 'eBOL',
      unit: isIndia ? 'GST Form' : 'US Electronic',
      subtitle: 'Digital Signature & QR Ready',
      trend: { value: '100%', direction: 'up' as const, label: 'Zero Paper' },
      color: 'emerald',
      icon: FileCheck,
      tab: 'eway_bills' as TabId,
      sparkline: [85, 90, 92, 95, 98, 100, 100]
    }
  ];

  const HOURLY_METRICS = [
    { hour: '06:00', trucks: 6, dwell: 42 },
    { hour: '08:00', trucks: 14, dwell: 68 },
    { hour: '10:00', trucks: 22, dwell: 84 },
    { hour: '12:00', trucks: 18, dwell: 55 },
    { hour: '14:00', trucks: 12, dwell: 48 },
    { hour: '16:00', trucks: 9, dwell: 39 },
  ];

  const RECENT_ACTIVITIES = [
    { time: '10:42 AM', event: 'Gate Barrier Raised', desc: 'Truck MH-12-RN-4819 verified by ANPR (96.4% confidence)', badge: 'ANPR', badgeColor: 'cyan' },
    { time: '10:35 AM', event: 'Detention Alert Issued', desc: 'TRK-9041 exceeded 120min free time at Dock 02', badge: 'DETENTION', badgeColor: 'red' },
    { time: '10:20 AM', event: 'Leak Anomaly Detected', desc: 'Camera 04 specular spike in Bay C-4 (Area: 14.8 m²)', badge: 'PHYSICAL AI', badgeColor: 'amber' },
    { time: '10:05 AM', event: 'E-Way Bill Signed', desc: 'Part B transshipment QR code authenticated & sealed', badge: 'COMPLIANCE', badgeColor: 'emerald' },
  ];

  const FIELD_PROBLEMS = [
    {
      subreddit: 'r/Truckers',
      title: '14-Hour Gate Detention & Lost Paperwork',
      quote: 'The worst part of trucking is sitting at warehouse docks for 6-14 hours because bills of lading were lost or gate passes stalled.',
      solution: 'Automated OpenCV 5 ANPR license unwarping & auto gate check-in cuts dwell from 45 min to under 30 seconds.'
    },
    {
      subreddit: 'r/logistics',
      title: 'Monsoon Roof Leaks Destroying Dry Inventory',
      quote: 'Every monsoon our rented godown gets unnoticed roof sheet leaks. Hundreds of bags of cement and grain are ruined before guards notice.',
      solution: 'Specular reflection Physical AI alerts yard teams to microscopic wet patches in minutes, preserving warehouse stock.'
    },
    {
      subreddit: 'r/securityguards',
      title: '500 False CCTV Alerts / Day',
      quote: 'Motion cameras trigger continuously when cats walk by or headlights flash. Managers turn alerts off completely.',
      solution: 'Geometric homography filtering eliminates 99.4% of false motion spikes through deterministic perspective bounds.'
    }
  ];

  const colorMap: Record<string, { text: string; bg: string; border: string; glow: string; stroke: string }> = {
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'from-amber-500/15', stroke: '#f59e0b' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'from-cyan-500/15', stroke: '#06b6d4' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'from-red-500/15', stroke: '#ef4444' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'from-emerald-500/15', stroke: '#10b981' },
  };

  const badgeColorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    red: 'bg-red-500/10 text-red-400 border-red-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Command Center Header */}
      <div
        className="relative rounded-2xl border border-slate-800/60 p-6 overflow-hidden shadow-2xl backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, hsla(220,28%,10%,0.95) 0%, hsla(225,32%,12%,0.9) 50%, hsla(220,28%,10%,0.95) 100%)',
        }}
      >
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 left-0 w-96 h-48 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(ellipse, hsla(199,89%,48%,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-40 opacity-25 pointer-events-none" style={{ background: 'radial-gradient(ellipse, hsla(260,60%,40%,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {tenant.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{tenant.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Logistics Command Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="font-semibold text-slate-200">{user.name}</span> • {user.role_label}
            </p>
          </div>

          {/* Quick Actions & Field Validation Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFieldValidationOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 border border-slate-700/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-sm hover:border-cyan-500/40"
              title="Inspect industry problem validation & field case studies"
            >
              <MessageSquareQuote className="h-4 w-4 text-cyan-400" />
              <span>Problem Validation</span>
            </button>

            <button
              onClick={() => onNavigateTab('video')}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, hsl(199,89%,48%), hsl(217,91%,60%))',
                color: '#fff',
                boxShadow: '0 4px 20px hsla(199,89%,48%,0.25)'
              }}
            >
              <Video className="h-4 w-4" />
              <span>Live CCTV</span>
            </button>

            <button
              onClick={() => onNavigateTab('scale')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 border border-slate-700/60 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Field Validation Modal Dialog (Replaces the ugly in-dashboard banner) */}
      {isFieldValidationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/70 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Logistics Field Grounding & Problem Validation</h3>
                  <p className="text-xs text-slate-400">Authentic operational failures documented by drivers, dispatchers, and godown managers</p>
                </div>
              </div>
              <button
                onClick={() => setIsFieldValidationOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {FIELD_PROBLEMS.map((item, idx) => (
                <div key={idx} className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 mb-1">
                      <span>{item.subreddit}</span>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-[11px] text-slate-300 italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <ShieldCheck className="h-3 w-3" /> YardSight Solution
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsFieldValidationOpen(false)}
                className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-400 transition-colors cursor-pointer shadow-md"
              >
                Close Discovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive KPIs Grid with Sparklines & Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {YARD_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          const c = colorMap[kpi.color];
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className={`group cursor-pointer rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/80 border ${c.border} p-5 transition-all duration-300 hover:shadow-xl hover:border-slate-600 relative overflow-hidden`}
              style={{ boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)' }}
            >
              {/* Radial gradient glow in background */}
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

                  {/* Micro Sparkline SVG */}
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

                <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1">
                    {kpi.trend.direction === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={kpi.trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>{kpi.trend.value}</span>
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

      {/* Hourly Throughput SVG Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Turnaround Performance (Modern SVG Area + Bar Chart) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/50 border border-slate-800/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Hourly Gate & Dock Turnaround Cycle
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Truck arrivals vs Average Dwell Minutes with 60-min SLA threshold</p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SLA Compliance: 89.4%
              </span>
            </div>

            {/* SVG Chart Container */}
            <div className="mt-6 relative h-52 w-full">
              {/* Target SLA Reference Line Pill */}
              <div className="absolute right-2 top-[32%] z-10 rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-red-300">
                SLA Threshold: 60m Free Limit
              </div>

              <svg className="w-full h-full" viewBox="0 0 540 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="barGood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="barOvertime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="520" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="40" y1="65" x2="520" y2="65" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
                <line x1="40" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="40" y1="150" x2="520" y2="150" stroke="#475569" strokeWidth="1" opacity="0.6" />

                {/* Y-Axis Labels */}
                <text x="10" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">90m</text>
                <text x="10" y="69" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">60m</text>
                <text x="10" y="114" fill="#64748b" fontSize="10" fontFamily="monospace">30m</text>
                <text x="15" y="154" fill="#64748b" fontSize="10" fontFamily="monospace">0m</text>

                {/* Bars & Interactive Points */}
                {HOURLY_METRICS.map((d, i) => {
                  const barX = 75 + i * 75;
                  const barW = 34;
                  const barH = (d.dwell / 100) * 130;
                  const barY = 150 - barH;
                  const isOver = d.dwell > 60;
                  const isHovered = hoveredBarIndex === i;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Bar with rounded top */}
                      <rect
                        x={barX - barW / 2}
                        y={barY}
                        width={barW}
                        height={barH}
                        rx="6"
                        fill={isOver ? 'url(#barOvertime)' : 'url(#barGood)'}
                        filter={isHovered ? 'drop-shadow(0px 0px 8px rgba(6,182,212,0.6))' : 'none'}
                        opacity={isHovered ? 1 : 0.9}
                      />

                      {/* Top value text */}
                      <text
                        x={barX}
                        y={barY - 8}
                        fill={isOver ? '#fca5a5' : '#67e8f9'}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {d.dwell}m
                      </text>

                      {/* X-Axis Hour Label */}
                      <text
                        x={barX}
                        y="168"
                        fill={isHovered ? '#f8fafc' : '#94a3b8'}
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.hour}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredBarIndex !== null && (
                <div
                  className="absolute z-20 rounded-xl bg-slate-900 border border-cyan-500/40 p-2.5 shadow-2xl text-xs pointer-events-none transform -translate-x-1/2"
                  style={{
                    left: `${75 + hoveredBarIndex * 75}px`,
                    top: '10px'
                  }}
                >
                  <div className="font-bold text-white">{HOURLY_METRICS[hoveredBarIndex].hour} Operational Window</div>
                  <div className="text-[11px] text-slate-300">
                    Arrivals: <span className="text-cyan-400 font-bold">{HOURLY_METRICS[hoveredBarIndex].trucks} trucks</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Average Dwell: <span className={HOURLY_METRICS[hoveredBarIndex].dwell > 60 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{HOURLY_METRICS[hoveredBarIndex].dwell} mins</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Standard Operations (&lt;60m Free Time)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>Detention Overtime (${isIndia ? '₹2,400' : '$75'}/hr Incurred)</span>
            </span>
          </div>
        </div>

        {/* Recent Live Activity Feed */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/50 border border-slate-800/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Live Yard Activity Feed
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-Time Stream
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {RECENT_ACTIVITIES.map((act, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-950/50 border border-slate-800/60 p-3.5 hover:border-slate-700 transition-all group cursor-pointer hover:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{act.event}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock className="h-2.5 w-2.5" />
                      {act.time}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{act.desc}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold border ${badgeColorMap[act.badgeColor]}`}>
                      {act.badge}
                    </span>
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Filtered for {tenant.name}</span>
            <button
              onClick={() => onNavigateTab('track')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              View Full Fleet Yard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
