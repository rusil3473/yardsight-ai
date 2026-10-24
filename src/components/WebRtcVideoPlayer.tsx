import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Radio } from 'lucide-react';

interface WebRtcVideoPlayerProps {
  cameraId: string;
  fallbackStreamUrl: string;
  onFpsUpdate?: (fps: number) => void;
  className?: string;
  retryKey?: number;
  subtype?: number;
}

export const WebRtcVideoPlayer: React.FC<WebRtcVideoPlayerProps> = ({
  cameraId,
  fallbackStreamUrl,
  className = "w-full h-full object-cover",
  retryKey = 0,
  subtype = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const [latencyMs, setLatencyMs] = useState<number>(85);
  const [reconnectKey, setReconnectKey] = useState<number>(0);
  const [snapshotSrc, setSnapshotSrc] = useState<string>(fallbackStreamUrl);
  const isMountedRef = useRef<boolean>(true);
  const snapTimerRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;
    const base = fallbackStreamUrl.includes('?') ? fallbackStreamUrl : `${fallbackStreamUrl}?`;
    setSnapshotSrc(`${base}&t=${Date.now()}`);
    return () => {
      isMountedRef.current = false;
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [fallbackStreamUrl, reconnectKey, retryKey]);

  const handleSnapshotLoad = () => {
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const base = fallbackStreamUrl.includes('?') ? fallbackStreamUrl : `${fallbackStreamUrl}?`;
        setSnapshotSrc(`${base}&t=${Date.now()}`);
      }
    }, 280);
  };

  const handleSnapshotError = () => {
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const base = fallbackStreamUrl.includes('?') ? fallbackStreamUrl : `${fallbackStreamUrl}?`;
        setSnapshotSrc(`${base}&t=${Date.now()}`);
      }
    }, 1500);
  };

  useEffect(() => {

    let isCancelled = false;
    let peerConn: RTCPeerConnection | null = null;
    const tStart = performance.now();

    const connectWebRtc = async () => {
      setConnectionState('connecting');

      try {
        peerConn = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        pcRef.current = peerConn;

        // Set up transceiver to receive video only
        peerConn.addTransceiver('video', { direction: 'recvonly' });

        peerConn.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setConnectionState('connected');
            setLatencyMs(Math.round(performance.now() - tStart));
          }
        };

        peerConn.onconnectionstatechange = () => {
          if (!isCancelled && peerConn) {
            if (peerConn.connectionState === 'connected') {
              setConnectionState('connected');
            } else if (['failed', 'disconnected', 'closed'].includes(peerConn.connectionState)) {
              setConnectionState('fallback');
            }
          }
        };

        const offer = await peerConn.createOffer();
        await peerConn.setLocalDescription(offer);

        // Send SDP offer to backend WebRTC bridge or go2rtc directly
        const resp = await fetch(`http://127.0.0.1:8001/api/cameras/${cameraId.toUpperCase()}/webrtc?subtype=${subtype}`, {
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
      } catch (err) {
        if (!isCancelled) {
          setConnectionState('fallback');
        }
      }
    };

    // Timeout fallback after 3 seconds if WebRTC does not establish
    const fallbackTimer = setTimeout(() => {
      if (!isCancelled && connectionState === 'connecting') {
        setConnectionState('fallback');
      }
    }, 3200);

    connectWebRtc();

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [cameraId, reconnectKey, retryKey, subtype]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
      {connectionState !== 'fallback' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={className}
        />
      ) : (
        <img
          src={snapshotSrc}
          alt={`CCTV ${cameraId}`}
          className={className}
          onLoad={handleSnapshotLoad}
          onError={handleSnapshotError}
        />
      )}

      {/* Protocol Diagnostic Badge */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950/80 backdrop-blur border border-slate-800 shadow">
        <Radio className={`w-3 h-3 ${connectionState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
        <span className="font-bold text-slate-200">
          {connectionState === 'connected' ? 'WebRTC (UDP P2P)' : connectionState === 'connecting' ? 'WebRTC Connecting...' : 'Optical Live Feed (P2P Standby)'}
        </span>
        {connectionState === 'connected' && (
          <span className="text-emerald-400 font-semibold border-l border-slate-700 pl-1.5">
            {latencyMs}ms
          </span>
        )}
      </div>

      {connectionState === 'fallback' && (
        <button
          type="button"
          onClick={() => setReconnectKey(prev => prev + 1)}
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
