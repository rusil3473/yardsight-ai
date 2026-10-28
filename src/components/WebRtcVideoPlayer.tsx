import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { API_BASE_URL } from '../config/env';

interface WebRtcVideoPlayerProps {
  cameraId: string;
  fallbackStreamUrl: string;
  onFpsUpdate?: (fps: number) => void;
  className?: string;
  retryKey?: number;
  subtype?: number;
  hideBadge?: boolean;
}

export const WebRtcVideoPlayer: React.FC<WebRtcVideoPlayerProps> = ({
  cameraId,
  fallbackStreamUrl,
  className = "w-full h-full object-cover",
  retryKey = 0,
  subtype = 1,
  hideBadge = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const [latencyMs, setLatencyMs] = useState<number>(45);
  const [reconnectKey, setReconnectKey] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const [snapshotSrc, setSnapshotSrc] = useState<string>(fallbackStreamUrl);
  const snapTimerRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);
  const reconnectTimerRef = useRef<any>(null);

  const isMjpeg = fallbackStreamUrl.includes('/stream');

  useEffect(() => {
    isMountedRef.current = true;
    if (isMjpeg) {
      setSnapshotSrc(fallbackStreamUrl);
    } else {
      const base = fallbackStreamUrl.includes('?') ? fallbackStreamUrl : `${fallbackStreamUrl}?`;
      setSnapshotSrc(`${base}&t=${Date.now()}`);
    }
    return () => {
      isMountedRef.current = false;
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [fallbackStreamUrl, reconnectKey, retryKey, isMjpeg]);

  const handleSnapshotLoad = () => {
    if (isMjpeg) return; // Continuous MJPEG stream renders natively without polling
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const base = fallbackStreamUrl.includes('?') ? fallbackStreamUrl : `${fallbackStreamUrl}?`;
        setSnapshotSrc(`${base}&t=${Date.now()}`);
      }
    }, 300);
  };

  const handleSnapshotError = () => {
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const snap = `${API_BASE_URL}/api/cameras/${cameraId.toUpperCase()}/snapshot?t=${Date.now()}`;
        setSnapshotSrc(snap);
      }
    }, 1000);
  };

  useEffect(() => {
    let isCancelled = false;
    let peerConn: RTCPeerConnection | null = null;
    let fallbackTimer: any = null;
    const tStart = performance.now();

    const scheduleReconnect = () => {
      if (isCancelled || !isMountedRef.current) return;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      // Exponential backoff: 1s, 1.5s, 2.25s, 3.37s... capped at 10s
      const delay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 10000);
      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && !isCancelled) {
          setReconnectKey((prev) => prev + 1);
        }
      }, delay);
    };

    const connectWebRtc = async () => {
      setConnectionState('connecting');

      try {
        peerConn = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pcRef.current = peerConn;

        peerConn.addTransceiver('video', { direction: 'recvonly' });

        peerConn.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setConnectionState('connected');
            setLatencyMs(Math.round(performance.now() - tStart));
            retryCountRef.current = 0; // Reset backoff on successful video playback
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          }
        };

        peerConn.onconnectionstatechange = () => {
          if (!isCancelled && peerConn) {
            const state = peerConn.connectionState;
            if (state === 'connected') {
              setConnectionState('connected');
              retryCountRef.current = 0;
            } else if (['failed', 'disconnected', 'closed'].includes(state)) {
              setConnectionState('fallback');
              scheduleReconnect();
            }
          }
        };

        peerConn.oniceconnectionstatechange = () => {
          if (!isCancelled && peerConn) {
            const iceState = peerConn.iceConnectionState;
            if (iceState === 'connected' || iceState === 'completed') {
              setConnectionState('connected');
              retryCountRef.current = 0;
            } else if (['failed', 'disconnected'].includes(iceState)) {
              setConnectionState('fallback');
              scheduleReconnect();
            }
          }
        };

        const offer = await peerConn.createOffer();
        await peerConn.setLocalDescription(offer);

        const resp = await fetch(`${API_BASE_URL}/api/cameras/${cameraId.toUpperCase()}/webrtc?subtype=${subtype}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: offer.sdp
        });

        if (!resp.ok) {
          setConnectionState('fallback');
          scheduleReconnect();
          return;
        }

        const answerSdp = await resp.text();
        if (!isCancelled && peerConn && answerSdp.includes('v=0')) {
          await peerConn.setRemoteDescription({ type: 'answer', sdp: answerSdp });
        } else {
          setConnectionState('fallback');
          scheduleReconnect();
        }
      } catch {
        if (!isCancelled) {
          setConnectionState('fallback');
          scheduleReconnect();
        }
      }
    };

    fallbackTimer = setTimeout(() => {
      if (!isCancelled && connectionState === 'connecting') {
        setConnectionState('fallback');
      }
    }, 2500);

    connectWebRtc();

    return () => {
      isCancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [cameraId, reconnectKey, retryKey, subtype]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Video Element rendered for WebRTC when connected */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`${className} ${connectionState === 'connected' ? 'block' : 'hidden'}`}
      />

      {/* Live Optical Video Stream rendered immediately (Zero Black Screen) */}
      {connectionState !== 'connected' && (
        <img
          src={snapshotSrc}
          alt={`CCTV ${cameraId}`}
          className={className}
          onLoad={handleSnapshotLoad}
          onError={handleSnapshotError}
        />
      )}

      {/* Protocol Diagnostic Badge */}
      {!hideBadge && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950/80 backdrop-blur border border-slate-800 shadow">
          <Radio className={`w-3 h-3 ${connectionState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className="font-bold text-slate-200">
            {connectionState === 'connected'
              ? 'WebRTC (Low Latency)'
              : connectionState === 'connecting'
              ? 'Optical Live Stream'
              : 'Optical Live Stream (Nominal)'}
          </span>
          {connectionState === 'connected' && (
            <span className="text-emerald-400 font-semibold border-l border-slate-700 pl-1.5">
              {latencyMs}ms
            </span>
          )}
        </div>
      )}

      {!hideBadge && connectionState === 'fallback' && (
        <button
          type="button"
          onClick={() => {
            retryCountRef.current = 0;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            setReconnectKey(prev => prev + 1);
          }}
          className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-600/80 hover:bg-cyan-500 text-white cursor-pointer shadow transition"
          title="Attempt WebRTC reconnection"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>Retry WebRTC</span>
        </button>
      )}
    </div>
  );
};
