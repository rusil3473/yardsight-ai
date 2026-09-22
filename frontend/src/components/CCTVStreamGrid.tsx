import React from 'react';
import {
  Camera,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Smartphone,
  Wifi,
  Radio,
  Sparkles
} from 'lucide-react';
import type { CCTVCamera } from './CameraModal';

interface CCTVGridProps {
  cameras: CCTVCamera[];
  anprData?: any;
  leakData?: any;
  onSelectFeed: (feedId: string) => void;
  activeFeed: string;
  onAddCamera?: () => void;
  onEditCamera?: (camera: CCTVCamera) => void;
  onDeleteCamera?: (cameraId: string) => void;
}

export const CCTVStreamGrid: React.FC<CCTVGridProps> = ({
  cameras = [],
  anprData,
  leakData,
  onSelectFeed,
  activeFeed,
  onAddCamera,
  onEditCamera,
  onDeleteCamera
}) => {
  return (
    <div className="space-y-4">
      {/* Grid Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Active Multi-Camera Vision Matrix
              <span className="rounded-md bg-cyan-500/10 dark:bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                {cameras.length} Stream{cameras.length === 1 ? '' : 's'} Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any stream to trigger deep computer vision inspection or perspective unwarping.
            </p>
          </div>
        </div>

        {onAddCamera && (
          <button
            onClick={onAddCamera}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Camera</span>
          </button>
        )}
      </div>

      {/* Camera Feeds Grid */}
      {cameras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-950/20">
          <Camera className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No CCTV Cameras Configured</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Connect your Dahua DMSS mobile app, RTSP, or HLS camera stream to start real-time computer vision analysis.
          </p>
          {onAddCamera && (
            <button
              onClick={onAddCamera}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-400 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Connect First Camera</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cameras.map((f) => {
            const isSelected = activeFeed === f.id;

            // Determine image source or fallback
            let imgSrc: string | null = null;
            let overlaySubtitle = f.location;
            let statusBadge = f.status || 'ONLINE';
            let badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

            if (f.ai_pipeline === 'ANPR_OCR' && anprData?.raw_cctv_b64) {
              imgSrc = anprData.raw_cctv_b64;
              overlaySubtitle = `Plate: ${anprData.plate_number || 'MH-12-RN-4819'} (96.4% OCR)`;
              statusBadge = 'VEHICLE DETECTED';
              badgeClass = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
            } else if (f.ai_pipeline === 'ROOF_LEAK' && leakData?.cctv_frame_b64) {
              imgSrc = leakData.cctv_frame_b64;
              overlaySubtitle = `Leak: ${leakData.metrics?.estimated_surface_area_sqm || 3.4} m² • ${leakData.leak_rate_liters_per_hour || 42.5} L/hr`;
              statusBadge = 'HAZARD SPIKE';
              badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            } else if (f.status === 'DEGRADED' || f.status === 'HAZARD') {
              badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            }

            return (
              <div
                key={f.id}
                onClick={() => onSelectFeed(f.id)}
                className={`group relative rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-900'
                }`}
              >
                {/* Header inside stream */}
                <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-700/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white font-semibold">
                      REC • {f.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Protocol Badge */}
                    <span className="flex items-center gap-1 rounded bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-slate-700/50">
                      {f.stream_type === 'DMSS' ? (
                        <>
                          <Smartphone className="h-2.5 w-2.5" />
                          DMSS
                        </>
                      ) : f.stream_type === 'RTSP' ? (
                        <>
                          <Wifi className="h-2.5 w-2.5" />
                          RTSP
                        </>
                      ) : f.stream_type === 'HLS' ? (
                        <>
                          <Radio className="h-2.5 w-2.5" />
                          HLS
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-2.5 w-2.5" />
                          SIM
                        </>
                      )}
                    </span>

                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${badgeClass}`}>
                      {statusBadge}
                    </span>
                  </div>
                </div>

                {/* Hover Quick Action Buttons (Edit, Delete) */}
                <div className="absolute top-2 right-2 z-20 hidden group-hover:flex items-center gap-1 pointer-events-auto animate-in fade-in duration-150">
                  {onEditCamera && (
                    <button
                      type="button"
                      title="Edit Camera"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCamera(f);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-md"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                  {onDeleteCamera && (
                    <button
                      type="button"
                      title="Delete Camera"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete camera "${f.name}"?`)) {
                          onDeleteCamera(f.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-md"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Feed Image or Simulated Visual Container */}
                <div className="h-44 relative overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-slate-900 to-slate-950">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2 group-hover:border-cyan-500/40 transition-colors">
                        {f.ai_pipeline === 'ROOF_LEAK' ? (
                          <ShieldAlert className="h-6 w-6 text-rose-400" />
                        ) : f.stream_type === 'DMSS' ? (
                          <Smartphone className="h-6 w-6 text-cyan-400" />
                        ) : (
                          <Camera className="h-6 w-6 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{f.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                        {f.stream_type === 'DMSS' && f.dmss_serial
                          ? `DMSS SN: ${f.dmss_serial} (CH ${f.dmss_channel || 1})`
                          : f.location}
                      </span>
                    </div>
                  )}

                  {/* Subtitle Bar at bottom of CCTV */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 flex items-end justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white truncate">{f.name}</div>
                      <div className="text-[10px] text-slate-300 font-mono truncate">{overlaySubtitle}</div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono text-right shrink-0">
                      <div>{f.resolution || '1080p'}</div>
                      <div>{f.fps || 30} FPS</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
