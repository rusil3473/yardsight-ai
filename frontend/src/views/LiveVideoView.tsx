import React from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { CCTVStreamGrid } from '../components/CCTVStreamGrid';
import { ANPRInspector } from '../components/ANPRInspector';
import { useAuth } from '../context/AuthContext';

interface LiveVideoViewProps {
  anprData: any;
  leakData: any;
  onRefreshPlate: (plate: string, country: string) => void;
  onSelectFeed: (feedId: string) => void;
  activeFeed: string;
  isLoadingANPR?: boolean;
}

export const LiveVideoView: React.FC<LiveVideoViewProps> = ({
  anprData,
  leakData,
  onRefreshPlate,
  onSelectFeed,
  activeFeed,
  isLoadingANPR = false
}) => {
  const { tenant } = useAuth();

  return (
    <div className="space-y-6">
      {/* Video Hub Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live RTSP Video Surveillance Grid
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              OpenCV 5.0 Vision Core
            </span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-white tracking-tight">
            Multi-Camera Industrial Video Feeds
          </h2>
          <p className="text-xs text-slate-400">
            {tenant.name} • 4 High-Resolution Streams with Real-Time Perspective Homography & Thermal Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefreshPlate('MH-12-RN-4819', 'IN')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingANPR ? 'animate-spin' : ''}`} />
            <span>Resync RTSP</span>
          </button>
        </div>
      </div>

      {/* CCTV 4-Camera Grid */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
        <CCTVStreamGrid
          anprData={anprData}
          leakData={leakData}
          onSelectFeed={onSelectFeed}
          activeFeed={activeFeed}
        />
      </div>

      {/* OpenCV 5 Homography ANPR Inspector */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-cyan-400" />
              OpenCV 5 Perspective Homography & Gate ANPR Unwarper
            </h3>
            <p className="text-xs text-slate-400">
              Four-point homography unwarps 25° oblique gate camera angles into planar 400x120 OCR rectangles.
            </p>
          </div>
        </div>

        <ANPRInspector
          anprData={anprData}
          onRefreshPlate={onRefreshPlate}
          isLoading={isLoadingANPR}
        />
      </div>
    </div>
  );
};
