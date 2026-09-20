import React, { useState } from 'react';
import { AlertTriangle, Droplets, X, ShieldAlert, Calculator } from 'lucide-react';
import type { SpillIncident } from '../types';
import { analyzeSpecularReflection } from '../engine/spillDetector';

interface SpillAnalysisModalProps {
  isOpen: boolean;
  spill: SpillIncident | null;
  onClose: () => void;
  onDispatchContainment: (spillId: string) => void;
}

export const SpillAnalysisModal: React.FC<SpillAnalysisModalProps> = ({
  isOpen,
  spill,
  onClose,
  onDispatchContainment,
}) => {
  const [testVariance, setTestVariance] = useState(58); // chromatic rainbow sheen %
  const [testLuminance, setTestLuminance] = useState(165);

  if (!isOpen || !spill) return null;

  const analysis = analyzeSpecularReflection(testLuminance, testVariance, spill.surfaceType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white flex items-center space-x-2">
                <span>CONCRETE SPECULAR LEAK TELEMETRY</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {spill.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Thin-Film Interference & Refractive Index Analysis on {spill.surfaceType}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Classified Substance</div>
            <div className={`text-sm font-bold mt-1 ${analysis.isHazardousHydrocarbon ? 'text-red-400' : 'text-emerald-400'}`}>
              {analysis.spillCategory}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Refractive Index (n)</div>
            <div className="text-sm font-bold text-cyan-400 mt-1">
              {analysis.refractiveIndex.toFixed(3)}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Estimated Pool Area</div>
            <div className="text-sm font-bold text-white mt-1">
              {spill.estimatedAreaSqFt} sq ft
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Detection Confidence</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              {(analysis.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Interactive Sliders for CV Threshold Tuning */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Computer Vision Specular Variance Tuner</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Thin-Film Chromatic Dispersion (Rainbow Sheen):</span>
                <span className="text-cyan-400 font-bold">{testVariance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={testVariance}
                onChange={(e) => setTestVariance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Uniform Water Reflection)</span>
                <span>100% (High Viscosity Diesel/Oil)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Luminance Specular Peak:</span>
                <span className="text-cyan-400 font-bold">{testLuminance} / 255</span>
              </div>
              <input
                type="range"
                min="50"
                max="255"
                value={testLuminance}
                onChange={(e) => setTestLuminance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Compliance & Recommended Action Protocol */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>AUTOMATED MITIGATION PROTOCOL</span>
          </div>
          <p className="text-xs text-slate-300">
            {analysis.containmentProtocol}
          </p>
          {analysis.recommendedAbsorbentLbs > 0 && (
            <div className="text-xs font-mono text-cyan-300 font-semibold pt-1">
              Required Absorbent Quantity: ~{analysis.recommendedAbsorbentLbs} lbs granular clay boom
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            DISMISS
          </button>
          <button
            type="button"
            onClick={() => {
              onDispatchContainment(spill.id);
              onClose();
            }}
            className="px-5 py-2 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 transition flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>DISPATCH HAZMAT RESPONSE TEAM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
