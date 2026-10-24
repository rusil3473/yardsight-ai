import React from 'react';
import { Cpu, Eye, CheckCircle2 } from 'lucide-react';
import type { HomographyResult } from './AnprTypes';

interface AnprHomographyTelemetryProps {
  lastHomography: HomographyResult;
}

export const AnprHomographyTelemetry: React.FC<AnprHomographyTelemetryProps> = ({ lastHomography }) => {
  return (
    <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
          <Cpu className="w-4 h-4" />
          <span>OPENCV 4.10 HOMOGRAPHY PERSPECTIVE TRANSFORMATION TELEMETRY</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          M = cv2.getPerspectiveTransform(src_pts, dst_pts)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* 1. Angled CCTV Capture */}
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Angled Camera Feed</span>
            </span>
            <span className="text-[10px] text-amber-400">Tilt: 35° Oblique</span>
          </div>
          <img
            src={lastHomography.rawCctvB64}
            alt="Angled Camera Feed"
            className="w-full rounded border border-slate-700 object-cover"
          />
        </div>

        {/* 2. Unwarped Flat 400x120 Strip */}
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Orthogonal Character Strip</span>
            <span className="text-[10px] text-emerald-400">400x120 Planar</span>
          </div>
          <img
            src={lastHomography.unwarpedPlateB64}
            alt="Unwarped Strip"
            className="w-full rounded border border-emerald-500/50 object-cover shadow-lg shadow-emerald-500/10"
          />
          {lastHomography.claheEnhancedB64 && (
            <div>
              <div className="text-[10px] text-slate-500 mb-1">CLAHE Enhanced Binary Filter:</div>
              <img
                src={lastHomography.claheEnhancedB64}
                alt="CLAHE Filter"
                className="w-full rounded border border-slate-800 object-cover opacity-90"
              />
            </div>
          )}
        </div>

        {/* 3. Mathematical 3x3 Matrix & Validation */}
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Projective Matrix H</span>
            <span className="text-[10px] text-cyan-400">cv2.warpPerspective</span>
          </div>
          {lastHomography.matrix && (
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 space-y-1">
              {lastHomography.matrix.map((row, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>[{row[0].toFixed(4)},</span>
                  <span>{row[1].toFixed(4)},</span>
                  <span>{row[2].toFixed(4)}]</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] text-slate-400">Validation Status:</div>
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lastHomography.formatDetails || 'Standard Verified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
