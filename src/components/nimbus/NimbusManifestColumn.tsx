import React from 'react';
import { Truck, Clock, Zap } from 'lucide-react';
import type { VehicleRecord } from './NimbusTypes';

interface NimbusManifestColumnProps {
  vehicles: VehicleRecord[];
}

export const NimbusManifestColumn: React.FC<NimbusManifestColumnProps> = ({ vehicles }) => {
  return (
    <div className="lg:col-span-5 space-y-6">
      {/* ANPR Vehicle Manifest Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 font-mono shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>LIVE ANPR VEHICLE MANIFEST</span>
          </h3>
          <span className="text-[11px] text-slate-400">Gate OCR Engine</span>
        </div>

        <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
          {vehicles.map((v, i) => (
            <div
              key={i}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 hover:border-cyan-500/50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-300 font-mono tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {v.plate}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {v.timestamp}
                </span>
              </div>

              <div className="text-xs text-slate-300 font-semibold mt-1.5 flex items-center justify-between">
                <span>{v.carrier}</span>
                {v.vehicle_type && (
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {v.vehicle_type}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{v.gate}</span>
                <span className="text-emerald-400 font-semibold">{v.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Briquette Plant Live Diagnostic */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 font-mono shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>BRIQUETTE COMPACTION LINE 01</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            LINE ACTIVE
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Extruder Motor Power:</span>
            <span className="font-bold text-white">38.4 kW</span>
          </div>
          <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Die Chamber Temp:</span>
            <span className="font-bold text-amber-300">68.2 °C (Optimal)</span>
          </div>
          <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/50">
            <span className="text-slate-400">Optical Debris Filter:</span>
            <span className="font-bold text-emerald-400">Solidity Mask Active</span>
          </div>
          <div className="flex justify-between text-slate-300 py-1">
            <span className="text-slate-400">Conveyor Inspection:</span>
            <span className="font-bold text-cyan-300">Camera CH-02 Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
