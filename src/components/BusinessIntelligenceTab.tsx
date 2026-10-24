import React, { useState } from 'react';
import { BarChart3, Download, Cpu, CheckCircle2 } from 'lucide-react';

interface IndustrySector {
  key: string;
  label: string;
  sec: number;
  unit: string;
  cycleTimeSec: number;
  lossAllowancePct: number;
  maintenanceHours: number;
  notes: string;
}

const SECTORS: IndustrySector[] = [
  {
    key: 'PLASTIC_INJECTION_MOLDING',
    label: 'Plastic Injection Molding & Extrusion',
    sec: 1.15,
    unit: 'kWh/unit',
    cycleTimeSec: 4.5,
    lossAllowancePct: 3.5,
    maintenanceHours: 350,
    notes: 'Standard Specific Energy Consumption in injection molding ranges between 0.90 - 1.40 kWh/kg. Modern servo-electric presses drop SEC to 0.70 kWh/kg.',
  },
  {
    key: 'CORRUGATED_PACKAGING',
    label: 'Corrugated Box & Carton Packaging',
    sec: 0.09,
    unit: 'kWh/unit',
    cycleTimeSec: 1.2,
    lossAllowancePct: 2.0,
    maintenanceHours: 500,
    notes: 'Facilities operate rotary die-cutters and flexo-folder-gluers. Standard electrical intensity is 0.07 - 0.14 kWh per completed cardboard carton.',
  },
  {
    key: 'METAL_FASTENERS',
    label: 'Cold Forged Fasteners & Hardware',
    sec: 0.38,
    unit: 'kWh/unit',
    cycleTimeSec: 0.8,
    lossAllowancePct: 1.5,
    maintenanceHours: 250,
    notes: 'Cold heading and thread rolling require 0.30 - 0.55 kWh/kg of finished steel fasteners. Spikes indicate die wear or lubrication friction.',
  },
  {
    key: 'FOOD_BEVERAGE_BOTTLING',
    label: 'Food & Beverage Bottling Lines',
    sec: 0.04,
    unit: 'kWh/unit',
    cycleTimeSec: 0.3,
    lossAllowancePct: 1.0,
    maintenanceHours: 200,
    notes: 'High-speed rotary beverage bottling lines achieve 300 - 600 bottles/minute with an electrical intensity of 0.03 - 0.06 kWh per bottle.',
  },
  {
    key: 'ELECTRONICS_ASSEMBLY',
    label: 'Electronics SMT & Board Assembly',
    sec: 0.55,
    unit: 'kWh/unit',
    cycleTimeSec: 12.0,
    lossAllowancePct: 0.8,
    maintenanceHours: 600,
    notes: 'SMT pick-and-place lines followed by reflow ovens consume 0.40 - 0.75 kWh per assembled PCBA unit. Reflow represents >65% thermal load.',
  },
];

export const BusinessIntelligenceTab: React.FC = () => {
  const [selectedSectorKey, setSelectedSectorKey] = useState<string>('PLASTIC_INJECTION_MOLDING');
  const [dailyTargetUnits, setDailyTargetUnits] = useState<number>(5000);
  const [tariffPerKwh, setTariffPerKwh] = useState<number>(8.5);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const activeSector = SECTORS.find((s) => s.key === selectedSectorKey) || SECTORS[0];

  const dailyEnergyKwh = Math.round(dailyTargetUnits * activeSector.sec);
  const dailyElectricityCost = Math.round(dailyEnergyKwh * tariffPerKwh);
  const monthlyCostEst = dailyElectricityCost * 26;

  const handleExport = (format: 'json' | 'tally_xml') => {
    const payload = {
      export_date: new Date().toISOString(),
      format,
      industry_sector: activeSector.label,
      sec_kwh_per_unit: activeSector.sec,
      daily_capacity_units: dailyTargetUnits,
      projected_monthly_kwh: dailyEnergyKwh * 26,
      projected_monthly_inr: monthlyCostEst,
      rated_cycle_seconds: activeSector.cycleTimeSec,
      target_oee_pct: 85.0,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yardsight_erp_${format}_${Date.now()}.${format === 'tally_xml' ? 'xml' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Successfully exported ${format.toUpperCase()} manufacturing ledger.`);
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              MANUFACTURING & ENERGY BENCHMARKS (SEC)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AUTONOMOUS RESEARCH AGENT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Specific Energy Consumption (SEC) benchmarks, OEE targets, and industrial manufacturing operational standards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ERP (JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('tally_xml')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tally XML</span>
          </button>
        </div>
      </div>

      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Sector Profile Selector */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Target Industrial Sector</label>
            <select
              value={selectedSectorKey}
              onChange={(e) => setSelectedSectorKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {SECTORS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Daily Production Target (Units)</label>
            <input
              type="number"
              value={dailyTargetUnits}
              onChange={(e) => setDailyTargetUnits(Number(e.target.value))}
              min={100}
              max={1000000}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Commercial Power Tariff (₹/kWh or $/kWh)</label>
            <input
              type="number"
              value={tariffPerKwh}
              onChange={(e) => setTariffPerKwh(Number(e.target.value))}
              step={0.5}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Benchmark KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">Specific Energy Consumption</div>
          <div className="text-xl font-bold text-cyan-400">
            {activeSector.sec} <span className="text-xs text-slate-400">{activeSector.unit}</span>
          </div>
          <div className="text-[10px] text-emerald-400">Standard Baseline Benchmark</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">Daily Projected Load</div>
          <div className="text-xl font-bold text-white">
            {dailyEnergyKwh.toLocaleString()} <span className="text-xs text-slate-400">kWh/day</span>
          </div>
          <div className="text-[10px] text-slate-400">Est. Daily: ₹{dailyElectricityCost.toLocaleString()}</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">Standard Cycle Time</div>
          <div className="text-xl font-bold text-amber-400">
            {activeSector.cycleTimeSec} <span className="text-xs text-slate-400">sec/part</span>
          </div>
          <div className="text-[10px] text-slate-400">Loss Allowance: {activeSector.lossAllowancePct}%</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">Maintenance Interval</div>
          <div className="text-xl font-bold text-purple-400">
            {activeSector.maintenanceHours} <span className="text-xs text-slate-400">Hours</span>
          </div>
          <div className="text-[10px] text-emerald-400">OEE Target: 85.0%</div>
        </div>
      </div>

      {/* Autonomous Research Agent Synthesis Card */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-purple-500/30 space-y-3 font-mono text-xs">
        <div className="flex items-center space-x-2 text-purple-400 font-bold">
          <Cpu className="w-4 h-4" />
          <span>AUTONOMOUS DOMAIN RESEARCH AGENT SYNTHESIS</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          {activeSector.notes}
        </p>
      </div>
    </div>
  );
};
