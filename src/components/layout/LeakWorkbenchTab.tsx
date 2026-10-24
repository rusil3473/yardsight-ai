import React from 'react';
import { Droplets, Activity, Sliders, CheckCircle2, Zap } from 'lucide-react';
import type { SpillIncident } from '../../types';

interface LeakWorkbenchTabProps {
  spills: SpillIncident[];
  leakRainIntensity: number;
  leakMetrics: any;
  onRainIntensityChange: (val: number) => void;
  onOpenSpillModal: (spill: SpillIncident) => void;
}

export const LeakWorkbenchTab: React.FC<LeakWorkbenchTabProps> = ({
  spills,
  leakRainIntensity,
  leakMetrics,
  onRainIntensityChange,
  onOpenSpillModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-red-400" />
            <span>SPECULAR CONCRETE LEAK & HAZMAT ACTUATORS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Thin-film refractive index estimation, albedo drop tracking, and physical drainage pumps
          </p>
        </div>
        {spills.length > 0 && (
          <button
            type="button"
            onClick={() => onOpenSpillModal(spills[0])}
            className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/25"
          >
            <Activity className="w-4 h-4" />
            <span>Open Actuator Interlock Modal</span>
          </button>
        )}
      </div>

      {/* Live Fluid Mechanics Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>RAIN / WASHDOWN SIMULATOR</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {(leakRainIntensity * 100).toFixed(0)}% Intensity
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={leakRainIntensity}
            onChange={(e) => onRainIntensityChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Dynamically modulates roof puddle expansion and specular reflection thresholding.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs font-mono text-slate-400">ESTIMATED WET SURFACE</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {leakMetrics?.wet_area_sqm || '14.2'} m²
          </div>
          <div className="text-xs font-mono text-slate-400">
            Expansion Velocity:{' '}
            <span className="text-white font-bold">
              {leakMetrics?.metrics?.expansion_velocity_cm_per_min || '3.8'} cm/min
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs font-mono text-slate-400">CONTAINMENT PUMP STATUS</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>SYSTEM ARMED</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Interlock Protocol: <span className="text-cyan-400 font-bold">Automatic Barrier Seal</span>
          </div>
        </div>
      </div>

      {/* Fluid Events Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>ACTIVE ENVIRONMENTAL ANOMALIES</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">INCIDENT</th>
                <th className="pb-3">ZONE</th>
                <th className="pb-3">CLASSIFICATION</th>
                <th className="pb-3">SURFACE</th>
                <th className="pb-3">REFRACTIVE INDEX</th>
                <th className="pb-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {spills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="py-3 font-bold text-white">{s.id}</td>
                  <td className="py-3 text-slate-300">Bay 3 Maintenance Pad</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      {s.spillType}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{s.surfaceType}</td>
                  <td className="py-3 text-cyan-400 font-bold">{s.refractiveIndex}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onOpenSpillModal(s)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition text-[11px] font-bold cursor-pointer"
                    >
                      Dispatch Pump
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
