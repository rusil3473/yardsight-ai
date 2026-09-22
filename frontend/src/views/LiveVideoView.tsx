import React from 'react';
import { Camera, RefreshCw, Radio, Maximize2 } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/50">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Stream Active
            </span>
            <span className="rounded-lg bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-400 font-mono border border-slate-700/40">
              OpenCV 5.0
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Video Surveillance Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tenant.name} • {tenant.cameras_online} cameras with real-time homography & thermal analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Full Screen</span>
          </button>
          <button
            onClick={() => onRefreshPlate('MH-12-RN-4819', 'IN')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingANPR ? 'animate-spin' : ''}`} />
            <span>Resync RTSP</span>
          </button>
        </div>
      </div>

      {/* CCTV 4-Camera Grid */}
      <div
        className="rounded-2xl bg-slate-900/30 border border-slate-800/50 p-5 backdrop-blur-sm"
        style={{ boxShadow: '0 8px 30px -10px rgba(0,0,0,0.4)' }}
      >
        <CCTVStreamGrid
          anprData={anprData}
          leakData={leakData}
          onSelectFeed={onSelectFeed}
          activeFeed={activeFeed}
        />
      </div>

      {/* OpenCV 5 Homography ANPR Inspector */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Camera className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              Gate ANPR & Plate Recognition
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 ml-9">
              Perspective homography unwarps oblique camera angles for high-accuracy OCR scanning.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-semibold">
            <Radio className="h-3 w-3" />
            Processing
          </span>
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
