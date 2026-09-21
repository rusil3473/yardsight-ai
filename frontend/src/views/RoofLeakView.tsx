import React from 'react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
              Physical AI Asset Protection
            </span>
            <span className="text-xs text-slate-400">Bay C-4 Indoor CCTV Monitored</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-white tracking-tight">
            Warehouse Concrete Roof Leak & Specular Puddle Detector
          </h2>
          <p className="text-xs text-slate-400">
            {tenant.name} • Detects unannounced monsoon micro-leaks by isolating specular reflection peaks and 20%-40% diffuse albedo drops.
          </p>
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
