import React from 'react';
import { Camera, AlertTriangle, ShieldCheck, Activity, Eye } from 'lucide-react';
import type { CameraFeed } from '../types';

interface CctvMatrixProps {
  feeds: CameraFeed[];
  selectedCamera: CameraFeed | null;
  onSelectCamera: (feed: CameraFeed) => void;
  onTriggerAlert: (feed: CameraFeed) => void;
}

export const CctvMatrix: React.FC<CctvMatrixProps> = ({
  feeds,
  selectedCamera,
  onSelectCamera,
  onTriggerAlert,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {feeds.map(feed => {
        const isSelected = selectedCamera?.id === feed.id;
        const hasCritical = feed.detections.some(d => d.severity === 'critical');

        return (
          <div
            key={feed.id}
            onClick={() => onSelectCamera(feed)}
            className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer bg-slate-900/80 backdrop-blur-md shadow-xl ${
              isSelected
                ? 'border-cyan-400 ring-2 ring-cyan-500/40'
                : hasCritical
                ? 'border-red-500/80 shadow-red-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Top Camera Status Bar */}
            <div className="bg-slate-950/90 px-4 py-2 flex items-center justify-between border-b border-slate-800/80 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    hasCritical ? 'bg-red-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    hasCritical ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <span className="font-bold text-slate-200 uppercase tracking-wider">{feed.id}: {feed.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <span>{feed.resolution}</span>
                <span className="text-cyan-400 font-bold">{feed.fps} FPS</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">RTSP H.265</span>
              </div>
            </div>

            {/* Video Canvas / Viewport Simulation */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* Dynamic Industrial Backdrop Canvas Graphic */}
              <div
                className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: feed.id === 'cam-01'
                    ? 'radial-gradient(ellipse at center, #1e293b 0%, #090d16 100%)'
                    : feed.id === 'cam-02'
                    ? 'radial-gradient(ellipse at center, #1f2937 0%, #030712 100%)'
                    : feed.id === 'cam-03'
                    ? 'radial-gradient(ellipse at center, #27272a 0%, #09090b 100%)'
                    : 'radial-gradient(ellipse at center, #18181b 0%, #020617 100%)',
                }}
              />

              {/* Grid / Perspective Lines HUD */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Live Overlay Reticle & Scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-16 animate-pulse" />

              {/* Simulated Camera Scene Representation */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="p-3 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 shadow-inner">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-slate-200">{feed.location}</div>
                <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{feed.cameraAngle}</span>
                </div>
              </div>

              {/* Real-Time Neural Bounding Boxes */}
              {feed.detections.map(det => {
                const isCrit = det.severity === 'critical';
                const isWarn = det.severity === 'warning';
                const colorClass = isCrit
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : isWarn
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-cyan-400 bg-cyan-400/10 text-cyan-300';

                return (
                  <div
                    key={det.id}
                    className={`absolute border-2 rounded transition-all animate-pulse pointer-events-none ${colorClass}`}
                    style={{
                      left: `${det.bbox.x}%`,
                      top: `${det.bbox.y}%`,
                      width: `${det.bbox.w}%`,
                      height: `${det.bbox.h}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/90 border border-current whitespace-nowrap shadow">
                      {det.label} ({(det.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              })}

              {/* Live Timestamp Watermark */}
              <div className="absolute bottom-2 left-2 z-10 font-mono text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                {new Date().toISOString()} • ENCODER H.265-NVENC
              </div>

              {/* Quick Action Button */}
              <div className="absolute bottom-2 right-2 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerAlert(feed);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-cyan-600 hover:text-white text-slate-300 border border-slate-700 transition flex items-center space-x-1 backdrop-blur"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Inspect Feed</span>
                </button>
              </div>
            </div>

            {/* Bottom Feed Summary */}
            <div className="p-3 bg-slate-950/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Detections:</span>
                {feed.detections.length === 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zone Secure</span>
                  </span>
                ) : (
                  <span className={`font-semibold flex items-center space-x-1 ${
                    hasCritical ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{feed.detections.length} Target(s)</span>
                  </span>
                )}
              </div>
              <span className="text-slate-500 font-mono text-[11px]">RTSP://10.240.1.{feed.id.slice(-2)}:554/live</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
