import React, { useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  ThermometerSun,
  ShieldAlert,
  CheckCircle2,
  Layers,
  ArrowRight,
  Zap,
  PackageCheck
} from 'lucide-react';
import { PuddleLeakInspector } from '../components/PuddleLeakInspector';
import { useAuth } from '../context/AuthContext';

interface RoofLeakViewProps {
  leakData: any;
  rainIntensity: number;
  onIntensityChange: (val: number) => void;
}

export const RoofLeakView: React.FC<RoofLeakViewProps> = ({
  leakData,
  rainIntensity,
  onIntensityChange
}) => {
  const { tenant } = useAuth();
  const isHighRisk = rainIntensity > 0.5;

  const [pumpActive, setPumpActive] = useState(false);
  const [relocationActive, setRelocationActive] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const WAREHOUSE_BAYS = [
    { id: 'BAY-C1', name: 'Bay C-1', albedo: '84%', status: 'DRY', inventory: 'Dry Paper Cartons', risk: 'LOW' },
    { id: 'BAY-C2', name: 'Bay C-2', albedo: '82%', status: 'DRY', inventory: 'Consumer Electronics', risk: 'LOW' },
    { id: 'BAY-C3', name: 'Bay C-3', albedo: '78%', status: 'DRY', inventory: 'Apparel Pallets', risk: 'LOW' },
    { id: 'BAY-C4', name: 'Bay C-4', albedo: '38%', status: 'CRITICAL_LEAK', inventory: '350 Bags UltraTech Cement', risk: 'HIGH_RISK' },
    { id: 'BAY-C5', name: 'Bay C-5', albedo: '83%', status: 'DRY', inventory: 'Industrial Fasteners', risk: 'LOW' },
    { id: 'BAY-C6', name: 'Bay C-6', albedo: '85%', status: 'DRY', inventory: 'Empty Wood Pallets', risk: 'LOW' },
  ];

  const handleTriggerPump = () => {
    setPumpActive(true);
    setActionNotice('Sump Pump 02 activated! Pumping rate: 45.0 L/min to storm drainage.');
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleForkliftRelocation = () => {
    setRelocationActive(true);
    setActionNotice('Forklift Crew #3 dispatched to Bay C-4. Diverting 350 bags to Bay C-1 dry rack.');
    setTimeout(() => setActionNotice(null), 4500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in flex items-center gap-3 text-cyan-200 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            {isHighRisk ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 border border-red-500/20 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                Specular Water Anomaly Detected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Physical AI Monitoring Active
              </span>
            )}
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3 text-cyan-400" />
              Bay C-4 Indoor CCTV CAM-04
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Physical AI Roof Leak & Specular Moisture Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time concrete floor albedo drop detection and tube light specular glare analysis to preserve warehouse inventory at {tenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {Math.round(rainIntensity * 100)}%
              </span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rain Inflow</div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5">
              <ThermometerSun className="h-4 w-4 text-amber-400" />
              <span className="text-lg font-extrabold text-amber-400" style={{ fontFamily: 'var(--font-heading)' }}>26°C</span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Godown Temp</div>
          </div>
        </div>
      </div>

      {/* Puddle Leak Inspector Component */}
      <PuddleLeakInspector
        leakData={leakData}
        rainIntensity={rainIntensity}
        onIntensityChange={onIntensityChange}
      />

      {/* Warehouse Godown Floor Grid & Moisture Mitigation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Heatmap Grid (8 of 12 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Interior Godown Bay Albedo & Moisture Heatmap
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Sensors: 6 Bays Active
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WAREHOUSE_BAYS.map((bay) => {
              const isCrit = bay.status === 'CRITICAL_LEAK';
              return (
                <div
                  key={bay.id}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isCrit
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-500/15 animate-pulse'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">{bay.name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                      isCrit
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {bay.status === 'CRITICAL_LEAK' ? 'WATER SLAB' : 'DRY'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs">
                    <span className="text-slate-400 block text-[10px]">Stored Cargo:</span>
                    <span className="font-semibold text-slate-200 line-clamp-1">{bay.inventory}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Diffuse Albedo:</span>
                    <span className={`font-mono font-bold ${isCrit ? 'text-red-400' : 'text-cyan-400'}`}>
                      {bay.albedo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rapid Moisture Defense Actions (4 of 12 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Moisture Mitigation Controls
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">BAY C-4 ALERT</span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Inventory Preservation Value</span>
                <div className="text-lg font-extrabold text-emerald-400 font-mono">₹18,40,000 INR</div>
                <p className="text-[10px] text-slate-400">
                  350 bags of cement in Bay C-4 splash radius protected from hardening damage.
                </p>
              </div>

              <button
                onClick={handleTriggerPump}
                className={`w-full rounded-xl p-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  pumpActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>{pumpActive ? 'Sump Pump 02 Pumping (Active)' : 'Start Sump Pump 02'}</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleForkliftRelocation}
                className={`w-full rounded-xl p-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  relocationActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-cyan-400" />
                  <span>{relocationActive ? 'Forklifts Relocating Cargo' : 'Dispatch Forklifts to C-4'}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Automated Weather API: Connected</span>
            <span className="text-cyan-400 font-mono">Monsoon Radar Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
