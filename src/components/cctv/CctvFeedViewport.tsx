import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Maximize2, Radio, RefreshCw } from 'lucide-react';
import type { CameraFeed } from '../../types';
import type { LiveDetectionEntity, CctvLayoutMode } from './types';
import { API_BASE_URL, WS_BASE_URL } from '../../config/env';
import { WebRtcVideoPlayer } from '../WebRtcVideoPlayer';

interface CctvFeedViewportProps {
  feed: CameraFeed;
  isStreaming: boolean;
  isSelected: boolean;
  streamError: boolean;
  currentTime: string;
  layoutMode?: CctvLayoutMode;
  liveDetections?: LiveDetectionEntity[];
  onToggleStream: () => void;
  onInspect: () => void;
  onTriggerAlert: () => void;
  onSelectCamera: () => void;
  onRetryStream: () => void;
  onTelemetryUpdate?: (camId: string, telemetry: any[]) => void;
  getSnapshotUrl: (id: string, tick?: number) => string;
}

export const CctvFeedViewport: React.FC<CctvFeedViewportProps> = ({
  feed,
  isStreaming,
  isSelected,
  streamError,
  currentTime,
  layoutMode = 'all',
  liveDetections,
  onToggleStream,
  onInspect,
  onTriggerAlert,
  onSelectCamera,
  onRetryStream,
  onTelemetryUpdate,
  getSnapshotUrl,
}) => {
  const chNum = parseInt(feed.id.replace(/\D/g, ''), 10) || 1;
  const refreshDelay =
    layoutMode === 'all'
      ? 500
      : layoutMode === '16'
      ? 400
      : layoutMode === '8'
      ? 300
      : 200;

  const buildSnapshotUrl = (id: string) => {
    const raw = getSnapshotUrl(id);
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}t=${Date.now()}`;
  };

  const liveStreamUrl = `${API_BASE_URL}/api/cameras/${feed.id.toUpperCase()}/stream`;
  const useLiveStream = isStreaming;
  const [snapshotSrc, setSnapshotSrc] = useState<string>(() => buildSnapshotUrl(feed.id));
  const [wsFrameSrc, setWsFrameSrc] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const prevBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
      setWsFrameSrc(null);
      return;
    }

    let ws: WebSocket | null = null;
    let cancelled = false;

    try {
      ws = new WebSocket(`${WS_BASE_URL}/api/cameras/${feed.id.toUpperCase()}/ws`);
      ws.binaryType = 'blob';

      ws.onmessage = (event) => {
        if (cancelled) return;
        if (typeof event.data === 'string') {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'TELEMETRY' && onTelemetryUpdate && parsed.detections) {
              onTelemetryUpdate(feed.id, parsed.detections);
            }
          } catch {}
        } else if (event.data instanceof Blob) {
          const blobUrl = URL.createObjectURL(event.data);
          if (prevBlobUrlRef.current) {
            URL.revokeObjectURL(prevBlobUrlRef.current);
          }
          prevBlobUrlRef.current = blobUrl;
          setWsFrameSrc(blobUrl);
        }
      };

      ws.onerror = () => {
        setWsFrameSrc(null);
      };
    } catch {
      setWsFrameSrc(null);
    }

    return () => {
      cancelled = true;
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            ws.close();
          };
        }
      }
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
    };
  }, [feed.id, isStreaming, onTelemetryUpdate]);

  useEffect(() => {
    isMountedRef.current = true;
    const initialStagger = (chNum * 25) % 400;
    const initTimer = setTimeout(() => {
      if (isMountedRef.current && !isStreaming) {
        setSnapshotSrc(buildSnapshotUrl(feed.id));
      }
    }, initialStagger);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [feed.id, getSnapshotUrl, chNum, isStreaming]);

  // Active streaming watchdog: ensures the image never gets stuck on a static frame
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      if (isMountedRef.current && !wsFrameSrc) {
        setSnapshotSrc(buildSnapshotUrl(feed.id));
      }
    }, refreshDelay);

    return () => clearInterval(interval);
  }, [isStreaming, wsFrameSrc, feed.id, refreshDelay]);

  const handleLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!wsFrameSrc) {
      timerRef.current = setTimeout(() => {
        if (isMountedRef.current && !wsFrameSrc) {
          setSnapshotSrc(buildSnapshotUrl(feed.id));
        }
      }, refreshDelay);
    }
  };

  const handleError = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current && !wsFrameSrc) {
        setSnapshotSrc(buildSnapshotUrl(feed.id));
      }
    }, 1500);
  };

  const detectionsToRender = liveDetections || feed.detections || [];
  const hasVehicle = detectionsToRender.some((d: any) =>
    (d.label || '').toUpperCase().includes('TRUCK') ||
    (d.label || '').toUpperCase().includes('VEHICLE') ||
    (d.label || '').toUpperCase().includes('CAR')
  );
  const hasPerson = detectionsToRender.some((d: any) =>
    (d.label || '').toUpperCase().includes('PERSON')
  );

  const statusText = hasVehicle
    ? 'GATE INBOUND - VEHICLE DETECTED'
    : hasPerson
    ? 'PERIMETER - PERSON DETECTED'
    : 'FENCE MONITORING - OK';

  const statusColor = (hasVehicle || hasPerson) ? 'text-amber-400' : 'text-emerald-400';
  const barColor = (hasVehicle || hasPerson) ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onSelectCamera();
      }}
      className={`group relative rounded-xl overflow-hidden bg-[#0c1017] border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-cyan-500 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-500'
          : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* 1. Camera Top Header Bar matching reference image */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c1017] border-b border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black tracking-wider text-slate-100 uppercase truncate font-sans">
            {feed.name || `Channel ${String(chNum).padStart(2, '0')}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {feed.status === 'ONLINE' && !streamError ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-bold tracking-widest text-emerald-300 uppercase shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE STREAM
            </span>
          ) : feed.status === 'CONNECTING' ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-[10px] font-bold tracking-widest text-amber-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              CONNECTING
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              NO SIGNAL
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect();
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Channel Options"
          >
            <span className="font-mono text-sm leading-none font-bold">•••</span>
          </button>
        </div>
      </div>

      {/* 2. Video Viewport Aspect Ratio */}
      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
        {streamError ? (
          <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
            <Radio className="w-8 h-8 text-amber-500/60 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">P2P Relay Disconnected</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetryStream();
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Stream</span>
            </button>
          </div>
        ) : (
          <img
            src={wsFrameSrc || snapshotSrc}
            alt={feed.name}
            onLoad={!wsFrameSrc ? handleLoad : undefined}
            onError={!wsFrameSrc ? handleError : undefined}
            className="w-full h-full object-contain bg-black transition duration-150"
          />
        )}

        {/* 4. Tactical HUD Bounding Boxes */}
        {detectionsToRender.map((det: any, dIdx: number) => {
          const isPerson = (det.label || '').toUpperCase().includes('PERSON');
          const isBike = (det.label || '').toUpperCase().includes('CYCLE');
          const colorClass = isPerson
            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
            : isBike
            ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
            : 'border-cyan-400 bg-cyan-400/10 text-cyan-300';

          return (
            <div
              key={det.id || dIdx}
              className={`absolute border-2 rounded pointer-events-none transition-all duration-150 z-15 ${colorClass}`}
              style={{
                left: `${det.bbox.x}%`,
                top: `${det.bbox.y}%`,
                width: `${det.bbox.w}%`,
                height: `${det.bbox.h}%`,
              }}
            >
              <div className="absolute -top-4 left-0 px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-slate-950/90 border border-current whitespace-nowrap">
                {det.label} {det.velocity ? `• ${det.velocity} px/f` : ''}
              </div>
            </div>
          );
        })}

        {/* 5. Sleek Top-Left Status Indicator (Does not obstruct Top-Right Date or Bottom-Left Name) */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-slate-200 pointer-events-none border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{feed.fps || 30} FPS</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 uppercase">{statusText}</span>
        </div>

        {/* 8. Hover Controls Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 pointer-events-none z-30">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInspect();
            }}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 pointer-events-auto transition cursor-pointer shadow-lg"
            title="Inspect Channel Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleStream();
            }}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 pointer-events-auto transition cursor-pointer shadow-lg"
            title={isStreaming ? 'Switch to Snapshot Mode' : 'Switch to Live WebSocket Mode'}
          >
            <Camera className={`w-4 h-4 ${isStreaming ? 'text-emerald-400' : 'text-slate-400'}`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTriggerAlert();
            }}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-rose-950 text-white border border-slate-700 pointer-events-auto transition cursor-pointer shadow-lg"
            title="Trigger Threat Incident Alert"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
