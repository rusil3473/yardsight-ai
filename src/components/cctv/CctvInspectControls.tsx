import React from 'react';
import {
  CheckCircle,
  Maximize2,
  Play,
  Activity,
  Cpu,
  Edit3,
  Sparkles,
} from 'lucide-react';
import type { CameraFeed } from '../../types';
import type { MatrixStatus } from './types';


interface CctvInspectControlsProps {
  feed: CameraFeed;
  matrixStatus: MatrixStatus;
  connectionStatusMsg: string | null;
  testingConnection: boolean;
  isFlushingBuffer: boolean;
  onToggleFullscreen: () => void;
  onRetryWebRtc: () => void;
  onTestConnection: () => void;
  onFlushBuffer: () => void;
  onStartRename: () => void;
  onOpenNimbus?: (cameraId: string) => void;
}

export const CctvInspectControls: React.FC<CctvInspectControlsProps> = ({
  feed,
  matrixStatus,
  connectionStatusMsg,
  testingConnection,
  isFlushingBuffer,
  onToggleFullscreen,
  onRetryWebRtc,
  onTestConnection,
  onFlushBuffer,
  onStartRename,
  onOpenNimbus,
}) => {
  return (
    <>
      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-slate-500 font-semibold uppercase">Hardware Ingestion Gateway</div>
          <div className="text-white font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>go2rtc WebRTC (UDP P2P)</span>
          </div>
          <div className="text-slate-400 text-[10px]">Sub-150ms Low-Latency Video</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-slate-500 font-semibold uppercase">Channel Ingestion</div>
          <div className="text-white font-bold">
            {feed.id}: IP-CH{String(parseInt(feed.id.replace(/\D/g, ''), 10) || 1).padStart(2, '0')}
          </div>
          <div className="text-slate-400 text-[10px]">Native Dahua H.264 Passthrough</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-slate-500 font-semibold uppercase">NVR Master Unit</div>
          <div className="text-emerald-400 font-bold">{matrixStatus?.nvr_serial || 'BE124E0PCA95532'}</div>
          <div className="text-slate-400 text-[10px]">P2P Relay Active • DMSS Uncut</div>
        </div>
      </div>

      {/* Diagnostic Status Message */}
      {connectionStatusMsg && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{connectionStatusMsg}</span>
        </div>
      )}

      {/* Modal Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
            title="Expand to 100% monitor viewport"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full Screen Mode</span>
          </button>
          <button
            type="button"
            onClick={onRetryWebRtc}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
            title="Retry WebRTC connection through go2rtc"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Retry WebRTC</span>
          </button>
          <button
            type="button"
            onClick={onTestConnection}
            disabled={testingConnection}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Activity
              className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`}
            />
            <span>{testingConnection ? 'Testing...' : 'Verify Socket'}</span>
          </button>
          <button
            type="button"
            onClick={onFlushBuffer}
            disabled={isFlushingBuffer}
            className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
            title="Flush stalled OpenCV queue and catch up to real-time live edge"
          >
            <Cpu className={`w-3.5 h-3.5 text-amber-400 ${isFlushingBuffer ? 'animate-spin' : ''}`} />
            <span>{isFlushingBuffer ? 'Flushing Buffer...' : 'Refresh Buffer'}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStartRename}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Rename channel name"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rename Channel</span>
          </button>
          {onOpenNimbus && (
            <button
              type="button"
              onClick={() => onOpenNimbus(feed.id)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Ask Nimbus AI</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
