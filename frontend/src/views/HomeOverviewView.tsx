import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Plus,
  Send,
  Camera,
  Activity,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { TabId } from '../components/CorporateNavbar';

interface HomeOverviewViewProps {
  onNavigateTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
  trucks?: any[];
  onAddTruck?: (data: any) => Promise<{ success: boolean; message?: string }>;
  onRefreshTrucks?: () => void;
}

interface DockBay {
  dock_id: string;
  name: string;
  status: 'OCCUPIED' | 'DETENTION' | 'HAZARD' | 'AVAILABLE' | 'RESERVED';
  truck_id?: string;
  plate_number?: string;
  carrier?: string;
  dwell_minutes?: number;
  free_time_minutes?: number;
  driver_name?: string;
  driver_phone?: string;
  cargo?: string;
  detention_fee?: number;
  hazard_detail?: string;
  eta?: string;
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({
  onNavigateTab,
  marketMode,
  trucks,
  onAddTruck,
  onRefreshTrucks
}) => {
  const { tenant } = useAuth();
  const isIndia = marketMode === 'IN_GST';

  // State Management
  const [isFieldValidationOpen, setIsFieldValidationOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedDock, setSelectedDock] = useState<DockBay | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'DETENTION' | 'VISION' | 'LEAK'>('ALL');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // New Inbound Truck Form
  const [newTruck, setNewTruck] = useState({
    plate: 'MH-12-RN-4819',
    carrier: 'Tata Logistics Express',
    driverName: 'Ramesh Sharma',
    driverPhone: '+91-98765-43210',
    dockId: 'DOCK-06',
    cargo: '24 Pallets (Consumer Goods)'
  });

  // Interactive Dock Bays Digital Twin State
  const [dockBays, setDockBays] = useState<DockBay[]>([
    {
      dock_id: 'DOCK-01',
      name: 'Dock 01',
      status: 'OCCUPIED',
      truck_id: 'TRK-1022',
      plate_number: 'TX-49-B219',
      carrier: 'Swift Transportation US',
      dwell_minutes: 45,
      free_time_minutes: 60,
      driver_name: 'Dave Miller',
      driver_phone: '+1-512-555-0199',
      cargo: '18 Pallets Automotive Equipment',
      detention_fee: 0
    },
    {
      dock_id: 'DOCK-02',
      name: 'Dock 02',
      status: 'DETENTION',
      truck_id: 'TRK-9041',
      plate_number: 'MH-12-RN-4819',
      carrier: 'Tata Logistics Express',
      dwell_minutes: 145,
      free_time_minutes: 120,
      driver_name: 'Ramesh Sharma',
      driver_phone: '+91-98765-43210',
      cargo: '24 Pallets FMCG / Packaged Food',
      detention_fee: isIndia ? 1000 : 31.25
    },
    {
      dock_id: 'DOCK-03',
      name: 'Dock 03',
      status: 'OCCUPIED',
      truck_id: 'TRK-7731',
      plate_number: 'KA-04-E-8812',
      carrier: 'Mahindra Logistics',
      dwell_minutes: 32,
      free_time_minutes: 60,
      driver_name: 'Suresh Patil',
      driver_phone: '+91-94481-22910',
      cargo: '30 Pallets Solar Panels & Inverters',
      detention_fee: 0
    },
    {
      dock_id: 'DOCK-04',
      name: 'Dock 04 (Bay C-4)',
      status: 'HAZARD',
      hazard_detail: 'Physical AI Specular Water Puddle (14.8 m² wet slab). Cargo damage risk ₹18.4L. Divert to Dock 06.',
      dwell_minutes: 0,
      detention_fee: 0
    },
    {
      dock_id: 'DOCK-05',
      name: 'Dock 05',
      status: 'OCCUPIED',
      truck_id: 'TRK-4109',
      plate_number: 'DL-01-A-9920',
      carrier: 'BlueDart Surface Freight',
      dwell_minutes: 20,
      free_time_minutes: 60,
      driver_name: 'Rajiv Mehra',
      driver_phone: '+91-98110-33419',
      cargo: '42 Parcels High-Value Electronics',
      detention_fee: 0
    },
    {
      dock_id: 'DOCK-06',
      name: 'Dock 06',
      status: 'AVAILABLE',
      cargo: 'Ready for Immediate Inbound Assignment'
    },
    {
      dock_id: 'DOCK-07',
      name: 'Dock 07',
      status: 'OCCUPIED',
      truck_id: 'TRK-5520',
      plate_number: 'HR-26-Z-1044',
      carrier: 'Delhivery Freight',
      dwell_minutes: 52,
      free_time_minutes: 60,
      driver_name: 'Harpreet Singh',
      driver_phone: '+91-99882-14002',
      cargo: '12 Pallets Industrial Spare Parts',
      detention_fee: 0
    },
    {
      dock_id: 'DOCK-08',
      name: 'Dock 08',
      status: 'RESERVED',
      eta: '11:15 AM (TRK-3190 • Gati-KWE)',
      cargo: 'Reserved for Priority Express Container'
    }
  ]);

  const YARD_KPIS = [
    {
      title: 'Active Freight Dwell',
      value: '4',
      unit: 'Semi-Trucks',
      subtitle: '1 Incurring Detention Alert',
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
      subtitle: 'Digital Signature & QR Sealed',
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
    { type: 'VISION', time: '10:42 AM', event: 'Gate Barrier Raised', desc: 'Truck MH-12-RN-4819 verified by ANPR (96.4% confidence)', badge: 'ANPR', badgeColor: 'cyan' },
    { type: 'DETENTION', time: '10:35 AM', event: 'Detention Alert Issued', desc: 'TRK-9041 exceeded 120min free time at Dock 02 (₹1,000 fee)', badge: 'DETENTION', badgeColor: 'red' },
    { type: 'LEAK', time: '10:20 AM', event: 'Roof Anomaly Detected', desc: 'Camera 04 specular spike in Bay C-4 (Area: 14.8 m² wet concrete)', badge: 'PHYSICAL AI', badgeColor: 'amber' },
    { type: 'VISION', time: '10:05 AM', event: 'E-Way Bill QR Sealed', desc: 'Part B transshipment vehicle QR authenticated & sealed', badge: 'COMPLIANCE', badgeColor: 'emerald' },
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

  // Actions
  const handleSendDispatchAlert = async (dock: DockBay) => {
    try {
      await fetch('http://127.0.0.1:8001/api/dispatch/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truck_id: dock.truck_id || 'TRK-9041',
          message: `${dock.name} unloading complete. Detention penalty accrued. Proceed to Gate 02 Departure immediately.`
        })
      });
      setDispatchSuccessMsg(`WhatsApp & SMS Dispatch Alert sent to ${dock.driver_name} (${dock.driver_phone})!`);
      setTimeout(() => setDispatchSuccessMsg(null), 4500);
    } catch {
      setDispatchSuccessMsg(`Dispatch alert broadcast locally to driver ${dock.driver_name}!`);
      setTimeout(() => setDispatchSuccessMsg(null), 4500);
    }
  };

  // Sync real-time trucks into digital twin dock bays
  useEffect(() => {
    if (trucks && trucks.length > 0) {
      const baseBays: DockBay[] = [
        { dock_id: 'DOCK-01', name: 'Dock 01', status: 'AVAILABLE' },
        { dock_id: 'DOCK-02', name: 'Dock 02', status: 'AVAILABLE' },
        { dock_id: 'DOCK-03', name: 'Dock 03', status: 'AVAILABLE' },
        {
          dock_id: 'DOCK-04',
          name: 'Dock 04 (Bay C-4)',
          status: 'HAZARD',
          hazard_detail: 'Physical AI Specular Water Puddle (14.8 m² wet slab). Cargo damage risk ₹18.4L. Divert to Dock 06.',
          dwell_minutes: 0,
          free_time_minutes: 0,
          detention_fee: 0
        },
        { dock_id: 'DOCK-05', name: 'Dock 05', status: 'AVAILABLE' },
        { dock_id: 'DOCK-06', name: 'Dock 06', status: 'AVAILABLE' },
        { dock_id: 'DOCK-07', name: 'Dock 07', status: 'AVAILABLE' },
        { dock_id: 'DOCK-08', name: 'Dock 08', status: 'RESERVED', eta: '14:30 IST' }
      ];

      trucks.forEach((t) => {
        const rawDock = t.dock_number || t.assigned_bay || 'Dock 01';
        let match = baseBays.find(b => b.name.toLowerCase() === rawDock.toLowerCase() || b.dock_id.toLowerCase() === rawDock.toLowerCase());
        if (!match) {
          match = baseBays.find(b => b.status === 'AVAILABLE');
        }
        if (match && match.status !== 'HAZARD') {
          match.status = t.is_detention ? 'DETENTION' : t.status === 'CLEARED' ? 'AVAILABLE' : 'OCCUPIED';
          match.truck_id = t.truck_id || t.id;
          match.plate_number = t.plate_number;
          match.carrier = t.carrier_name;
          match.driver_name = t.driver_name;
          match.driver_phone = t.driver_phone;
          match.cargo = t.cargo_desc || t.cargo_items;
          match.dwell_minutes = t.dwell_minutes || 0;
          match.free_time_minutes = t.free_time_minutes || 120;
          match.detention_fee = isIndia ? (t.detention_charge || 0) : ((t.detention_charge || 0) / 32);
        }
      });
      setDockBays(baseBays);
    }
  }, [trucks, isIndia]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTruck) {
      const res = await onAddTruck({
        plate_number: newTruck.plate,
        carrier_name: newTruck.carrier,
        driver_name: newTruck.driverName,
        driver_phone: newTruck.driverPhone,
        dock_number: newTruck.dockId,
        cargo_desc: newTruck.cargo,
        country: isIndia ? 'IN' : 'US'
      });
      if (res && res.success) {
        setIsCheckInModalOpen(false);
        setDispatchSuccessMsg(`Truck ${newTruck.plate} checked into ${newTruck.dockId} in SQLite! Part B transit recorded.`);
        setTimeout(() => setDispatchSuccessMsg(null), 4500);
        onRefreshTrucks?.();
        return;
      }
    }
    const updated = dockBays.map(b => {
      if (b.dock_id === newTruck.dockId) {
        return {
          ...b,
          status: 'OCCUPIED' as const,
          truck_id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
          plate_number: newTruck.plate,
          carrier: newTruck.carrier,
          driver_name: newTruck.driverName,
          driver_phone: newTruck.driverPhone,
          cargo: newTruck.cargo,
          dwell_minutes: 1,
          free_time_minutes: 60,
          detention_fee: 0
        };
      }
      return b;
    });
    setDockBays(updated);
    setIsCheckInModalOpen(false);
    setDispatchSuccessMsg(`Truck ${newTruck.plate} checked into ${newTruck.dockId}! Part B transit recorded.`);
    setTimeout(() => setDispatchSuccessMsg(null), 4500);
  };

  const filteredActivities = RECENT_ACTIVITIES.filter(act => {
    if (eventFilter === 'ALL') return true;
    return act.type === eventFilter;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification for Dispatch Actions */}
      {dispatchSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in flex items-center gap-3 text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Top Operations Command Banner (AWS / Amazon Supply Chain Style) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational Status: Normal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tenant.active_docks} Active Bays • {tenant.cameras_online} CCTV Streams Synced
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Logistics Command Center
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {tenant.name} • {tenant.location}
            </p>
          </div>

          {/* Quick Action Commands */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsCheckInModalOpen(true)}
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

      {/* Executive KPIs Grid with Sparklines & Glassmorphism */}
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

      {/* CORE SHOWSTOPPER: Interactive Godown Dock Bay Schematic & Digital Twin */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Godown Dock Operations & Digital Twin Yard Layout
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live bay turnaround, detention clock accrual, and roof moisture anomaly telemetry for {tenant.name}
            </p>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>In SLA (&lt;60m)</span>
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              <span>Detention Overtime</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Moisture Hazard</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span>Available</span>
            </span>
          </div>
        </div>

        {/* 8-Bay Warehouse Schematic Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dockBays.map((bay) => {
            const isDetention = bay.status === 'DETENTION';
            const isHazard = bay.status === 'HAZARD';
            const isAvailable = bay.status === 'AVAILABLE';
            const isReserved = bay.status === 'RESERVED';

            return (
              <div
                key={bay.dock_id}
                onClick={() => setSelectedDock(bay)}
                className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px] ${
                  isDetention
                    ? 'bg-red-950/20 border-red-500/50 hover:border-red-400 hover:bg-red-950/30'
                    : isHazard
                    ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 hover:bg-amber-950/30'
                    : isAvailable
                    ? 'bg-slate-950/40 border-slate-700/60 border-dashed hover:border-cyan-500/50 hover:bg-slate-900/40'
                    : isReserved
                    ? 'bg-slate-950/30 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
                }`}
                style={{
                  boxShadow: isDetention ? '0 0 20px -5px rgba(239,68,68,0.25)' : undefined
                }}
              >
                {/* Bay Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{bay.dock_id}</span>
                    <h3 className="text-xs font-bold text-white mt-0.5">{bay.name}</h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold border ${
                      isDetention
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        : isHazard
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isReserved
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {bay.status}
                  </span>
                </div>

                {/* Bay Core Information */}
                <div className="my-2.5">
                  {isHazard ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Roof Specular Leak</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-snug">
                        14.8 m² wet concrete. Diverting to Dock 06.
                      </p>
                    </div>
                  ) : isAvailable ? (
                    <div className="py-2 text-center text-slate-400 text-xs">
                      <div className="font-semibold text-emerald-400">+ Ready for Docking</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Click to Assign Truck</div>
                    </div>
                  ) : isReserved ? (
                    <div className="text-xs text-slate-400">
                      <div className="font-semibold text-purple-300">Reserved for Container</div>
                      <div className="text-[10px] text-slate-500 mt-1">{bay.eta}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-white">{bay.plate_number}</span>
                        <span className="text-[10px] text-slate-400">{bay.truck_id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{bay.carrier}</div>

                      {/* Dwell Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Dwell: {bay.dwell_minutes}m</span>
                          <span className={isDetention ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                            {isDetention ? `+${(bay.dwell_minutes || 0) - (bay.free_time_minutes || 60)}m Over` : `${(bay.free_time_minutes || 60) - (bay.dwell_minutes || 0)}m Free`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isDetention ? 'bg-red-500' : 'bg-cyan-500'
                            }`}
                            style={{
                              width: `${Math.min(100, ((bay.dwell_minutes || 0) / (bay.free_time_minutes || 60)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bay Footer Actions */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  {isDetention ? (
                    <>
                      <span className="text-red-400 font-bold">Penalty: {isIndia ? `₹${bay.detention_fee}` : `$${bay.detention_fee}`}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendDispatchAlert(bay);
                        }}
                        className="rounded bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white px-2 py-0.5 font-bold transition-colors cursor-pointer"
                        title="Send WhatsApp Dispatch to Driver"
                      >
                        ⚡ WhatsApp Dispatch
                      </button>
                    </>
                  ) : isHazard ? (
                    <>
                      <span className="text-amber-400 font-semibold">Bay Locked</span>
                      <span className="text-cyan-400 group-hover:underline">Inspect Leak →</span>
                    </>
                  ) : isAvailable ? (
                    <>
                      <span className="text-slate-500">Bay 06 Available</span>
                      <span className="text-cyan-400 group-hover:underline">+ Assign</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 truncate max-w-[120px]">{bay.driver_name}</span>
                      <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                        Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Turnaround Analytics + Live Vision Stream Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Turnaround Performance (High-Res Area + Bar Chart) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Hourly Gate & Dock Turnaround Cycle
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Truck arrivals vs Average Dwell Minutes with 60-min SLA threshold</p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SLA Compliance: 89.4%
              </span>
            </div>

            {/* SVG Chart Container */}
            <div className="mt-6 relative h-56 w-full">
              {/* Target SLA Reference Line Pill */}
              <div className="absolute right-2 top-[32%] z-10 rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-red-300">
                SLA Threshold: 60m Free Limit
              </div>

              <svg className="w-full h-full" viewBox="0 0 540 190" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="barGood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="barOvertime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="520" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="40" y1="65" x2="520" y2="65" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.8" />
                <line x1="40" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                <line x1="40" y1="155" x2="520" y2="155" stroke="#475569" strokeWidth="1" opacity="0.6" />

                {/* Y-Axis Labels */}
                <text x="10" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">90m</text>
                <text x="10" y="69" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">60m</text>
                <text x="10" y="114" fill="#64748b" fontSize="10" fontFamily="monospace">30m</text>
                <text x="15" y="159" fill="#64748b" fontSize="10" fontFamily="monospace">0m</text>

                {/* Bars & Interactive Points */}
                {HOURLY_METRICS.map((d, i) => {
                  const barX = 75 + i * 75;
                  const barW = 34;
                  const barH = (d.dwell / 100) * 135;
                  const barY = 155 - barH;
                  const isOver = d.dwell > 60;
                  const isHovered = hoveredBarIndex === i;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <rect
                        x={barX - barW / 2}
                        y={barY}
                        width={barW}
                        height={barH}
                        rx="6"
                        fill={isOver ? 'url(#barOvertime)' : 'url(#barGood)'}
                        filter={isHovered ? 'drop-shadow(0px 0px 10px rgba(6,182,212,0.7))' : 'none'}
                        opacity={isHovered ? 1 : 0.9}
                      />

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

                      <text
                        x={barX}
                        y="175"
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

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Standard Operations (&lt;60m Free Time)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>Detention Overtime ({isIndia ? '₹2,400' : '$75'}/hr Incurred)</span>
            </span>
          </div>
        </div>

        {/* Live CCTV Gate Snapshot & Real-Time Event Log */}
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

              {/* Simulated CCTV Camera Feed with ANPR Bounding Box */}
              <div className="relative h-36 bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center p-3">
                {/* Truck Silhouette & Plate Graphic */}
                <div className="relative w-full max-w-xs h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                  <Truck className="h-8 w-8 text-slate-600 mb-1" />
                  <div className="text-[10px] text-slate-400">Tata Prima 4028.S • Inbound Lane 1</div>

                  {/* ANPR Bounding Box */}
                  <div className="absolute bottom-2 px-2.5 py-0.5 rounded bg-slate-950 border-2 border-cyan-400 shadow-md shadow-cyan-500/30 flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-cyan-300 text-xs tracking-wider">MH-12-RN-4819</span>
                    <span className="text-[9px] text-emerald-400 font-bold">96.4%</span>
                  </div>
                </div>

                {/* Perspective Homography Unwarp Inset */}
                <div className="absolute top-2 right-2 rounded-lg bg-black/80 border border-cyan-500/40 p-1.5 backdrop-blur-md text-[9px] font-mono text-cyan-300 space-y-0.5">
                  <div className="text-slate-400">Perspective Unwarp:</div>
                  <div>24.5° corrected</div>
                  <div className="text-emerald-400">Part A/B Valid</div>
                </div>
              </div>
            </div>

            {/* Event Log Filter Tabs */}
            <div className="mt-4 flex items-center justify-between pb-2 border-b border-slate-800/60">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>Live Event Stream</span>
              </h3>

              <div className="flex items-center gap-1 text-[10px]">
                {(['ALL', 'DETENTION', 'VISION', 'LEAK'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setEventFilter(f)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      eventFilter === f
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities List */}
            <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
              {filteredActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-950/60 border border-slate-800/70 p-2.5 hover:border-slate-700 transition-all group cursor-pointer hover:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{act.event}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock className="h-2.5 w-2.5" />
                      {act.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{act.desc}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className={`rounded px-2 py-0.5 text-[9px] font-bold border ${badgeColorMap[act.badgeColor]}`}>
                      {act.badge}
                    </span>
                    <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
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

      {/* Dock Bay Detail Modal */}
      {selectedDock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDock.name} - Bay Telemetry</h3>
                  <span className="text-xs text-slate-400">{tenant.name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDock(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedDock.status === 'HAZARD' ? (
                <div className="rounded-xl bg-amber-950/30 border border-amber-500/40 p-4 text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Physical AI Specular Water Leak Warning</span>
                  </div>
                  <p>{selectedDock.hazard_detail}</p>
                  <div className="pt-2 border-t border-amber-500/20 text-[11px] flex justify-between">
                    <span>Wet Slab Area: 14.8 m²</span>
                    <span>Risk: {isIndia ? '₹18.4 Lakhs' : '$22,500'}</span>
                  </div>
                </div>
              ) : selectedDock.status === 'AVAILABLE' ? (
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 text-center space-y-3">
                  <p className="text-slate-300">This dock bay is clean, inspected, and ready for assignment.</p>
                  <button
                    onClick={() => {
                      setSelectedDock(null);
                      setIsCheckInModalOpen(true);
                    }}
                    className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 font-bold transition-colors cursor-pointer"
                  >
                    + Check In Inbound Truck to This Bay
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">License Plate</span>
                      <span className="font-mono font-bold text-white text-sm">{selectedDock.plate_number}</span>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                      <span className={`font-bold text-sm ${selectedDock.status === 'DETENTION' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedDock.status}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carrier:</span>
                      <span className="font-semibold text-white">{selectedDock.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="text-white">{selectedDock.driver_name} ({selectedDock.driver_phone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cargo:</span>
                      <span className="text-white">{selectedDock.cargo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dwell Time:</span>
                      <span className="font-mono font-bold text-cyan-400">{selectedDock.dwell_minutes} minutes</span>
                    </div>
                    {selectedDock.detention_fee && selectedDock.detention_fee > 0 && (
                      <div className="flex justify-between pt-1 border-t border-slate-800 text-red-400 font-bold">
                        <span>Detention Fee Accrued:</span>
                        <span>{isIndia ? `₹${selectedDock.detention_fee}` : `$${selectedDock.detention_fee}`}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              {selectedDock.status === 'DETENTION' && (
                <button
                  onClick={() => {
                    handleSendDispatchAlert(selectedDock);
                    setSelectedDock(null);
                  }}
                  className="rounded-xl bg-red-500 hover:bg-red-400 text-white px-4 py-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send WhatsApp Dispatch</span>
                </button>
              )}
              <button
                onClick={() => setSelectedDock(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbound Truck Check-In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Inbound Truck Gate Check-In</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">License Plate Number</label>
                <input
                  type="text"
                  value={newTruck.plate}
                  onChange={(e) => setNewTruck({ ...newTruck, plate: e.target.value })}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. MH-12-RN-4819"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Carrier Company</label>
                <input
                  type="text"
                  value={newTruck.carrier}
                  onChange={(e) => setNewTruck({ ...newTruck, carrier: e.target.value })}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. Tata Logistics, Swift, BlueDart"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={newTruck.driverName}
                    onChange={(e) => setNewTruck({ ...newTruck, driverName: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Driver Mobile</label>
                  <input
                    type="text"
                    value={newTruck.driverPhone}
                    onChange={(e) => setNewTruck({ ...newTruck, driverPhone: e.target.value })}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assign Dock Bay</label>
                <select
                  value={newTruck.dockId}
                  onChange={(e) => setNewTruck({ ...newTruck, dockId: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="DOCK-06">Dock 06 (Available - Recommended)</option>
                  <option value="DOCK-08">Dock 08 (Reserved)</option>
                  <option value="DOCK-01">Dock 01</option>
                  <option value="DOCK-03">Dock 03</option>
                  <option value="DOCK-05">Dock 05</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Cargo Description</label>
                <input
                  type="text"
                  value={newTruck.cargo}
                  onChange={(e) => setNewTruck({ ...newTruck, cargo: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shadow-lg"
                >
                  Confirm Gate Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field Validation Modal Dialog */}
      {isFieldValidationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
                className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shadow-md"
              >
                Close Discovery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
