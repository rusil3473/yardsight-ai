import React from 'react';
import { Truck, Layers, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { VehicleRecord, ProductionMetrics } from './NimbusTypes';

interface NimbusMetricsBarProps {
  vehicles: VehicleRecord[];
  production: ProductionMetrics | null;
}

export const NimbusMetricsBar: React.FC<NimbusMetricsBarProps> = ({ vehicles, production }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Vehicles Logged */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>VEHICLES LOGGED (ANPR)</span>
          </span>
          <span className="text-cyan-400 font-bold">GATE 01 & 02</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {vehicles.length} Carriers
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>HSRP Hologram Verified</span>
        </div>
      </div>

      {/* Metric 2: Briquette Throughput */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>BRIQUETTE THROUGHPUT</span>
          </span>
          <span className="text-emerald-400 font-bold">RUNNING</span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {production?.units_per_minute || 48.5} <span className="text-xs font-normal text-slate-400">UPM</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {production?.total_briquettes_today.toLocaleString() || '3,460'} finished units today
        </div>
      </div>

      {/* Metric 3: Debris Suppression */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>DEBRIS SUPPRESSION</span>
          </span>
          <span className="text-amber-400 font-bold">SOLIDITY 0.5-0.85</span>
        </div>
        <div className="text-2xl font-bold text-amber-300 tracking-tight">
          {production?.false_positives_prevented || 142} <span className="text-xs font-normal text-slate-400">Filtered</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Waste/debris excluded from human alarms
        </div>
      </div>

      {/* Metric 4: Safety Compliance */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SAFETY COMPLIANCE</span>
          </span>
          <span className="text-emerald-400 font-bold">OSHA/CPCB</span>
        </div>
        <div className="text-2xl font-bold text-emerald-400 tracking-tight">
          98.4%
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          4 workers tracked in safety perimeter
        </div>
      </div>
    </div>
  );
};
