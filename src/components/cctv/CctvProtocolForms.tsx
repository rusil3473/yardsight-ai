import React from 'react';
import { Radio, Wifi, Video, Hash, User, Key } from 'lucide-react';

interface DmssFormProps {
  serial: string;
  channel: number;
  username: string;
  password: string;
  onSerialChange: (val: string) => void;
  onChannelChange: (val: number) => void;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
}

export const DmssProtocolForm: React.FC<DmssFormProps> = ({
  serial,
  channel,
  username,
  password,
  onSerialChange,
  onChannelChange,
  onUsernameChange,
  onPasswordChange
}) => {
  return (
    <div className="p-3 bg-slate-950/70 border border-emerald-900/40 rounded-xl space-y-3">
      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
        <Radio className="w-3.5 h-3.5" />
        <span>Dahua DMSS P2P Credentials</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-emerald-400" />
            <span>Camera / NVR Serial No. *</span>
          </label>
          <input
            type="text"
            required
            value={serial}
            onChange={(e) => onSerialChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500 uppercase"
            placeholder="e.g. BE124E0PCA95532"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 flex items-center gap-1">
            <Video className="w-3 h-3 text-emerald-400" />
            <span>Channel Number (1–32) *</span>
          </label>
          <input
            type="number"
            min={0}
            max={128}
            required
            value={channel}
            onChange={(e) => onChannelChange(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-emerald-400" />
            <span>Device Username *</span>
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1 flex items-center gap-1">
            <Key className="w-3 h-3 text-emerald-400" />
            <span>Device Password *</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
            placeholder="••••••••"
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-400 leading-tight">
        Channel 0 is used for standalone IPC cameras. Channels 1–32 map to Dahua NVR channels via local P2P relay tunnel.
      </p>
    </div>
  );
};

interface WebrtcFormProps {
  stream: string;
  subtype: number;
  signaling: string;
  onStreamChange: (val: string) => void;
  onSubtypeChange: (val: number) => void;
  onSignalingChange: (val: string) => void;
}

export const WebrtcProtocolForm: React.FC<WebrtcFormProps> = ({
  stream,
  subtype,
  signaling,
  onStreamChange,
  onSubtypeChange,
  onSignalingChange
}) => {
  return (
    <div className="p-3 bg-slate-950/70 border border-cyan-900/40 rounded-xl space-y-3">
      <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
        <Wifi className="w-3.5 h-3.5" />
        <span>WebRTC Low-Latency Configuration</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">Stream Source Name *</label>
          <input
            type="text"
            required
            value={stream}
            onChange={(e) => onStreamChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            placeholder="e.g. ipc_live or ipc_live_main"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Resolution Subtype</label>
          <select
            value={subtype}
            onChange={(e) => onSubtypeChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value={1}>Substream (640x360 @ 30fps - Low Bandwidth)</option>
            <option value={0}>Mainstream (1080p @ 30fps - High Detail)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-slate-400 mb-1">WebRTC Gateway Signaling URL</label>
        <input
          type="text"
          value={signaling}
          onChange={(e) => onSignalingChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
          placeholder="http://127.0.0.1:1984"
        />
      </div>
    </div>
  );
};

interface RtspFormProps {
  streamUrl: string;
  transport: string;
  onStreamUrlChange: (val: string) => void;
  onTransportChange: (val: string) => void;
}

export const RtspProtocolForm: React.FC<RtspFormProps> = ({
  streamUrl,
  transport,
  onStreamUrlChange,
  onTransportChange
}) => {
  return (
    <div className="p-3 bg-slate-950/70 border border-amber-900/40 rounded-xl space-y-3">
      <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
        <Video className="w-3.5 h-3.5" />
        <span>RTSP Network Stream Parameters</span>
      </div>
      <div>
        <label className="block text-slate-400 mb-1">RTSP Stream URL *</label>
        <input
          type="text"
          required
          value={streamUrl}
          onChange={(e) => onStreamUrlChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
          placeholder="rtsp://admin:pass@192.168.1.108:554/cam/realmonitor?channel=1&subtype=1"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">Transport Layer</label>
          <select
            value={transport}
            onChange={(e) => onTransportChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="TCP">TCP Interleaved (Zero Packet Loss)</option>
            <option value="UDP">UDP Direct (Low Overhead)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Stream Profile</label>
          <input
            type="text"
            disabled
            value="Subtype 1 (H.264 Low Latency)"
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-slate-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
