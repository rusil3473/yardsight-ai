import React, { useState } from 'react';
import { Camera, Plus, RefreshCw, X, Shield } from 'lucide-react';
import {
  DmssProtocolForm,
  WebrtcProtocolForm,
  RtspProtocolForm
} from './CctvProtocolForms';
import { API_BASE_URL, GO2RTC_URL, RTSP_TUNNEL_PORT } from '../../config/env';


interface CctvAddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CctvAddCameraModal: React.FC<CctvAddCameraModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [streamType, setStreamType] = useState<string>('DMSS');
  const [pipeline, setPipeline] = useState<string>('ANPR_OCR');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // DMSS P2P specific inputs
  const [dmssSerial, setDmssSerial] = useState<string>('BE124E0PCA95532');
  const [dmssChannel, setDmssChannel] = useState<number>(1);
  const [dmssUsername, setDmssUsername] = useState<string>('admin');
  const [dmssPassword, setDmssPassword] = useState<string>('Shri@21*');

  // WebRTC specific inputs
  const [webrtcStream, setWebrtcStream] = useState<string>('ipc_live');
  const [webrtcSignaling, setWebrtcSignaling] = useState<string>(GO2RTC_URL);
  const [webrtcSubtype, setWebrtcSubtype] = useState<number>(1);

  // RTSP specific inputs
  const [streamUrl, setStreamUrl] = useState<string>('rtsp://admin:Shri@21*@192.168.1.108:554/cam/realmonitor?channel=1&subtype=1');
  const [rtspTransport, setRtspTransport] = useState<string>('TCP');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);

    let bodyPayload: Record<string, unknown> = {
      name: name.trim(),
      location: location.trim() || 'Facility Zone GENERAL',
      stream_type: streamType,
      ai_pipeline: pipeline,
      resolution: streamType === 'WEBRTC' && webrtcSubtype === 0 ? '1080p (1920x1080)' : '720p / Substream',
      fps: 30,
      tenant_id: 'TENANT-MY-HUB',
    };

    if (streamType === 'DMSS') {
      const snClean = dmssSerial.trim() || 'BE124E0PCA95532';
      bodyPayload = {
        ...bodyPayload,
        dmss_serial: snClean,
        dmss_channel: Number(dmssChannel),
        dmss_username: dmssUsername.trim() || 'admin',
        dmss_password: dmssPassword.trim() || 'Shri@21*',
        brand: `Dahua P2P (${snClean})`,
        stream_url: `rtsp://127.0.0.1:${RTSP_TUNNEL_PORT}/cam/realmonitor?channel=${dmssChannel}&subtype=1`,
      };
    } else if (streamType === 'WEBRTC') {
      bodyPayload = {
        ...bodyPayload,
        stream_url: `${webrtcSignaling.trim() || GO2RTC_URL}/api/webrtc?src=${webrtcStream.trim() || 'ipc_live'}`,
        brand: 'WebRTC go2rtc Gateway',
      };
    } else {
      bodyPayload = {
        ...bodyPayload,
        stream_url: streamUrl.trim(),
        brand: `Generic RTSP (${rtspTransport})`,
      };
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/api/cameras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      if (resp.ok) {
        onClose();
        setName('');
        setLocation('');
        if (onSuccess) onSuccess();
      } else {
        alert('Failed registering camera. Check inputs.');
      }
    } catch {
      alert('Error communicating with camera service.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-mono">Register New Camera Channel</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Camera Channel Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Inbound Gate Weighbridge North"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Location / Yard Zone</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Weighbridge North Zone"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Stream Protocol</label>
              <select
                value={streamType}
                onChange={(e) => setStreamType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="DMSS">DMSS P2P Serial Stream (Dahua / DoLynk)</option>
                <option value="WEBRTC">WebRTC Direct UDP (Sub-150ms)</option>
                <option value="RTSP">RTSP (Low Latency H.264)</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC PROTOCOL SPECIFIC FIELDS */}
          {streamType === 'DMSS' && (
            <DmssProtocolForm
              serial={dmssSerial}
              channel={dmssChannel}
              username={dmssUsername}
              password={dmssPassword}
              onSerialChange={setDmssSerial}
              onChannelChange={setDmssChannel}
              onUsernameChange={setDmssUsername}
              onPasswordChange={setDmssPassword}
            />
          )}

          {streamType === 'WEBRTC' && (
            <WebrtcProtocolForm
              stream={webrtcStream}
              subtype={webrtcSubtype}
              signaling={webrtcSignaling}
              onStreamChange={setWebrtcStream}
              onSubtypeChange={setWebrtcSubtype}
              onSignalingChange={setWebrtcSignaling}
            />
          )}

          {streamType === 'RTSP' && (
            <RtspProtocolForm
              streamUrl={streamUrl}
              transport={rtspTransport}
              onStreamUrlChange={setStreamUrl}
              onTransportChange={setRtspTransport}
            />
          )}


          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Assigned AI Vision Pipeline</span>
            </label>
            <select
              value={pipeline}
              onChange={(e) => setPipeline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="ANPR_OCR">ANPR & OCR (Vehicles, Trucks & Two-Wheelers)</option>
              <option value="PPE_SAFETY">PPE Compliance & Hazard Perimeter</option>
              <option value="PERIMETER_BREACH">Perimeter Intrusion & Security</option>
              <option value="MOTION_TRACKING">High-Precision Centroid Motion Tracking</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/25"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Channel...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Camera</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
