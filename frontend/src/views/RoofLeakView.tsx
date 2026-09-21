import React from 'react';
import { Droplets, AlertTriangle, ThermometerSun } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/50">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            {isHighRisk ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 border border-red-500/20">
                <AlertTriangle className="h-3 w-3" />
                High Risk Detected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Monitoring Active
              </span>
            )}
            <span className="text-[11px] text-slate-500">Bay C-4 Indoor CCTV</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Roof Leak & Puddle Detection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tenant.name} • AI-powered specular reflection analysis for early leak detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5 text-center">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {Math.round(rainIntensity * 100)}%
              </span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rain Intensity</div>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5 text-center">
            <div className="flex items-center gap-1.5">
              <ThermometerSun className="h-4 w-4 text-amber-400" />
              <span className="text-lg font-extrabold text-amber-400" style={{ fontFamily: 'var(--font-heading)' }}>32°C</span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Ambient Temp</div>
          </div>
        </div>
      </div>

      {/* Puddle Leak Inspector Component */}
      <PuddleLeakInspector
        leakData={leakData}
        rainIntensity={rainIntensity}
        onIntensityChange={onIntensityChange}
      />
    </div>
  );
};
