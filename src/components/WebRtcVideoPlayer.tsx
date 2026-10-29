import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Radio, Volume2, VolumeX } from 'lucide-react';
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
  className = "w-full h-full object-contain bg-black",
  retryKey = 0,
  subtype = 1,
  hideBadge = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const [latencyMs, setLatencyMs] = useState<number>(45);
  const [reconnectKey, setReconnectKey] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
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
            retryCountRef.current = 0;
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
          return;
        }

        const answerSdp = await resp.text();
        if (!isCancelled && peerConn && answerSdp.includes('v=0')) {
          await peerConn.setRemoteDescription({ type: 'answer', sdp: answerSdp });
        } else {
          setConnectionState('fallback');
        }
      } catch {
        if (!isCancelled) {
          setConnectionState('fallback');
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

  // WebRTC Inbound getStats() decoded frames watchdog (auto-recovery on >3s freeze)
  useEffect(() => {
    if (connectionState !== 'connected') return;

    let lastFrames = 0;
    let stallSeconds = 0;

    const statsInterval = setInterval(async () => {
      if (!pcRef.current || pcRef.current.connectionState !== 'connected') return;

      try {
        const stats = await pcRef.current.getStats();
        let currentFrames = 0;
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            currentFrames = report.framesDecoded || 0;
          }
        });

        if (currentFrames > 0 && currentFrames === lastFrames) {
          stallSeconds += 1;
          if (stallSeconds >= 3) {
            setConnectionState('fallback');
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setReconnectKey((prev) => prev + 1);
              }
            }, 3000);
          }
        } else {
          lastFrames = currentFrames;
          stallSeconds = 0;
        }
      } catch {
        // Ignore stats probe errors
      }
    }, 1000);

    return () => clearInterval(statsInterval);
  }, [connectionState, cameraId]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Video Element rendered for WebRTC when connected (Zero Cropping) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`${className} ${connectionState === 'connected' ? 'block' : 'hidden'} object-contain`}
      />

      {/* Live Optical Video Stream rendered immediately (Zero Black Screen, Zero Cropping) */}
      {connectionState !== 'connected' && (
        <img
          src={snapshotSrc}
          alt={`CCTV ${cameraId}`}
          className={`${className} object-contain`}
          onLoad={handleSnapshotLoad}
          onError={handleSnapshotError}
        />
      )}

      {/* Protocol Diagnostic Badge placed in Top-Center to NEVER cover Top-Right Date or Bottom-Left Name */}
      {!hideBadge && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] bg-slate-950/80 backdrop-blur border border-slate-800 shadow pointer-events-none">
          <Radio className={`w-3 h-3 ${connectionState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className="font-bold text-slate-200">
            {connectionState === 'connected'
              ? 'WebRTC (Ultra Low Latency)'
              : connectionState === 'connecting'
              ? 'Optical Stream Connecting...'
              : 'Continuous Optical Stream'}
          </span>
          {connectionState === 'connected' ? (
            <span className="text-emerald-400 font-semibold border-l border-slate-700 pl-1.5">
              {latencyMs}ms
            </span>
          ) : (
            <span className="text-cyan-400 font-semibold border-l border-slate-700 pl-1.5">
              Live ~25 FPS
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
          className="absolute bottom-2.5 right-12 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 cursor-pointer shadow-md transition"
          title="Attempt hardware WebRTC P2P tunnel"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Switch WebRTC</span>
        </button>
      )}

      {/* Live Audio Control (when WebRTC audio track is active) */}
      {connectionState === 'connected' && (
        <button
          type="button"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="absolute bottom-2.5 right-2.5 z-20 p-1.5 rounded-md bg-black/75 hover:bg-black/90 text-slate-200 hover:text-white border border-white/10 shadow transition cursor-pointer"
          title={isMuted ? "Unmute Camera Audio" : "Mute Camera Audio"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
        </button>
      )}
    </div>
  );
};
