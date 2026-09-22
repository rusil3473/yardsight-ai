import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Smartphone,
  Wifi,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export interface CCTVCamera {
  id: string;
  camera_id?: string;
  tenant_id: string;
  name: string;
  stream_type: 'DMSS' | 'RTSP' | 'HLS' | 'WEBRTC' | 'SIMULATED' | string;
  brand?: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'HAZARD' | string;
  fps: number;
  resolution: string;
  stream_url?: string;
  dmss_serial?: string;
  dmss_channel?: number;
  dmss_username?: string;
  dmss_password?: string;
  ai_pipeline?: 'ANPR_OCR' | 'DOCK_CYCLE' | 'ROOF_LEAK' | 'SECURITY_INTRUSION' | 'PPE_SAFETY' | string;
}

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cameraData: Partial<CCTVCamera>) => Promise<void>;
  initialCamera?: CCTVCamera | null;
  tenantId: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCamera,
  tenantId
}) => {
  const [streamType, setStreamType] = useState<'DMSS' | 'RTSP' | 'HLS' | 'SIMULATED'>('DMSS');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('Dahua');
  const [aiPipeline, setAiPipeline] = useState('ANPR_OCR');
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [status, setStatus] = useState('ONLINE');

  // DMSS specific fields
  const [dmssSerial, setDmssSerial] = useState('');
  const [dmssChannel, setDmssChannel] = useState(1);
  const [dmssUsername, setDmssUsername] = useState('admin');
  const [dmssPassword, setDmssPassword] = useState('');

  // RTSP / HLS specific fields
  const [streamUrl, setStreamUrl] = useState('');

  // Testing stream state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    latency_ms?: number;
    message?: string;
    error?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialCamera) {
      setName(initialCamera.name || '');
      setLocation(initialCamera.location || '');
      setStreamType((initialCamera.stream_type as any) || 'DMSS');
      setBrand(initialCamera.brand || 'Dahua');
      setAiPipeline(initialCamera.ai_pipeline || 'ANPR_OCR');
      setResolution(initialCamera.resolution || '1080p');
      setFps(initialCamera.fps || 30);
      setStatus(initialCamera.status || 'ONLINE');
      setDmssSerial(initialCamera.dmss_serial || '');
      setDmssChannel(initialCamera.dmss_channel || 1);
      setDmssUsername(initialCamera.dmss_username || 'admin');
      setDmssPassword(initialCamera.dmss_password || '');
      setStreamUrl(initialCamera.stream_url || '');
    } else {
      setName('');
      setLocation('Main Inbound Gate');
      setStreamType('DMSS');
      setBrand('Dahua');
      setAiPipeline('ANPR_OCR');
      setResolution('1080p');
      setFps(30);
      setStatus('ONLINE');
      setDmssSerial('DH-' + Math.floor(10000000 + Math.random() * 90000000) + '-BLR');
      setDmssChannel(1);
      setDmssUsername('admin');
      setDmssPassword('');
      setStreamUrl('');
    }
    setTestResult(null);
  }, [initialCamera, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const payload: any = {
        stream_type: streamType,
        brand: brand
      };
      if (streamType === 'DMSS') {
        payload.dmss_serial = dmssSerial;
        payload.dmss_channel = dmssChannel;
        payload.dmss_username = dmssUsername;
        payload.dmss_password = dmssPassword;
      } else {
        payload.stream_url = streamUrl || (streamType === 'SIMULATED' ? 'sim://virtual' : 'rtsp://10.0.4.1:554/ch0');
      }

      const res = await fetch('http://127.0.0.1:8001/api/cameras/test-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        connected: false,
        error: 'Unable to reach backend stream verification service.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Camera name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name,
        location,
        stream_type: streamType,
        brand,
        ai_pipeline: aiPipeline,
        resolution,
        fps: Number(fps),
        status,
        tenant_id: tenantId,
        dmss_serial: streamType === 'DMSS' ? dmssSerial : undefined,
        dmss_channel: streamType === 'DMSS' ? Number(dmssChannel) : undefined,
        dmss_username: streamType === 'DMSS' ? dmssUsername : undefined,
        dmss_password: streamType === 'DMSS' ? dmssPassword : undefined,
        stream_url: streamUrl || (streamType === 'DMSS' ? `rtsp://${dmssUsername}:${dmssPassword || '******'}@p2p.dmss.dahuasecurity.com:554/cam/realmonitor?channel=${dmssChannel}&subtype=0` : undefined)
      });
      onClose();
    } catch (err: any) {
      alert(`Error saving camera: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyRTSPPreset = (presetBrand: string) => {
    setBrand(presetBrand);
    if (presetBrand === 'Dahua') {
      setStreamUrl('rtsp://admin:password@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0');
    } else if (presetBrand === 'Hikvision') {
      setStreamUrl('rtsp://admin:password@192.168.1.64:554/Streaming/Channels/101');
    } else if (presetBrand === 'Axis') {
      setStreamUrl('rtsp://root:pass@192.168.0.90:554/axis-media/media.amp');
    } else if (presetBrand === 'Hanwha') {
      setStreamUrl('rtsp://admin:pass@192.168.1.100:554/profile2/media.smp');
    } else if (presetBrand === 'Uniview') {
      setStreamUrl('rtsp://admin:123456@192.168.1.13:554/unicast/c1/s0/live');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {initialCamera ? 'Edit CCTV Camera & Vision Stream' : 'Connect New CCTV Camera'}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                  {tenantId}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Support for Dahua DMSS App, RTSP, HLS, WebRTC and simulated edge AI feeds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Protocol Switcher Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Connection Protocol / Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStreamType('DMSS')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  streamType === 'DMSS'
                    ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="h-4 w-4 text-cyan-500" />
                <span>Dahua DMSS App</span>
              </button>

              <button
                type="button"
                onClick={() => setStreamType('RTSP')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  streamType === 'RTSP'
                    ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span>Industrial RTSP</span>
              </button>

              <button
                type="button"
                onClick={() => setStreamType('HLS')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  streamType === 'HLS'
                    ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Radio className="h-4 w-4 text-purple-500" />
                <span>HLS / WebRTC</span>
              </button>

              <button
                type="button"
                onClick={() => setStreamType('SIMULATED')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  streamType === 'SIMULATED'
                    ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Simulated Feed</span>
              </button>
            </div>
          </div>

          {/* Dahua DMSS Configuration Box */}
          {streamType === 'DMSS' && (
            <div className="rounded-xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20 p-4 space-y-4">
              <div className="flex items-start gap-2.5">
                <Smartphone className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                    Dahua DMSS Cloud P2P Direct Connection
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Enter the Device Serial Number (SN) from your Dahua DMSS mobile app. Found in <strong>DMSS App &gt; Device Details &gt; Device SN</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    DMSS Device Serial Number (SN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={dmssSerial}
                    onChange={(e) => setDmssSerial(e.target.value)}
                    placeholder="e.g. DH-98410291-BLR"
                    className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Channel Number (1 - 16)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={dmssChannel}
                    onChange={(e) => setDmssChannel(Number(e.target.value))}
                    className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Device Username
                  </label>
                  <input
                    type="text"
                    value={dmssUsername}
                    onChange={(e) => setDmssUsername(e.target.value)}
                    className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Device Password / Safety Code
                  </label>
                  <input
                    type="password"
                    value={dmssPassword}
                    onChange={(e) => setDmssPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Standard RTSP Configuration Box */}
          {streamType === 'RTSP' && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  RTSP Stream URL *
                </label>
                {/* Brand Preset Quick Helpers */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Presets:</span>
                  {['Dahua', 'Hikvision', 'Axis', 'Hanwha', 'Uniview'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleApplyRTSPPreset(p)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="rtsp://username:password@ip_address:554/cam/realmonitor?channel=1&subtype=0"
                className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-400">
                Format: <code className="font-mono text-cyan-600 dark:text-cyan-400">rtsp://user:pass@host:554/path</code>
              </p>
            </div>
          )}

          {/* HLS / WebRTC Configuration */}
          {streamType === 'HLS' && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                HLS (.m3u8) or WebRTC Gateway URL *
              </label>
              <input
                type="url"
                required
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://streams.yardsight.corp/live/cam01.m3u8"
                className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Common Camera Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Camera Name / Identifier *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CAM 05 - North Gate PTZ"
                className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Location / Godown Sector *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gate 1 North Entry, Bay 04 Dock"
                className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                AI Computer Vision Pipeline
              </label>
              <select
                value={aiPipeline}
                onChange={(e) => setAiPipeline(e.target.value)}
                className="w-full rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              >
                <option value="ANPR_OCR">ANPR OCR - Vehicle Homography & Plates</option>
                <option value="DOCK_CYCLE">DOCK CYCLE - Dwell & Turnaround Tracking</option>
                <option value="ROOF_LEAK">ROOF LEAK - Specular Concrete Leak Detection</option>
                <option value="SECURITY_INTRUSION">SECURITY - Perimeter & Intrusion Guard</option>
                <option value="PPE_SAFETY">PPE SAFETY - Hardhat & Forklift Proximity</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stream Resolution & Framerate
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  <option value="1080p">1080p FHD</option>
                  <option value="4K UHD">4K UHD</option>
                  <option value="720p">720p HD</option>
                </select>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  <option value={15}>15 FPS</option>
                  <option value={25}>25 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Connection Section */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-cyan-500" />
                Connection Verification
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ping the Dahua DMSS or RTSP stream to measure latency and test handshake.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging Stream...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Test Connection Result Alert */}
          {testResult && (
            <div
              className={`rounded-xl p-3.5 text-xs flex items-start gap-2.5 ${
                testResult.connected
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {testResult.connected ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span>{testResult.connected ? 'Stream Connection Successful!' : 'Connection Failed'}</span>
                  {testResult.latency_ms && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                      {testResult.latency_ms}ms latency
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 opacity-90">
                  {testResult.message || testResult.error}
                </p>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{initialCamera ? 'Update Camera' : 'Save & Connect Camera'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
