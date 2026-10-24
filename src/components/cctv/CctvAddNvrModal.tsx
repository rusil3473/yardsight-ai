import React, { useState } from 'react';
import { Server, RefreshCw, X } from 'lucide-react';

interface CctvAddNvrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CctvAddNvrModal: React.FC<CctvAddNvrModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [serial, setSerial] = useState<string>('BE124E0PCA95532');
  const [host, setHost] = useState<string>('192.168.1.108');
  const [port, setPort] = useState<number>(554);
  const [user, setUser] = useState<string>('admin');
  const [pass, setPass] = useState<string>('Shri@21*');
  const [channels, setChannels] = useState<number>(32);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    setIsSaving(true);
    try {
      const queryParams = new URLSearchParams({
        serial_number: serial.trim(),
        total_channels: String(channels),
        host: host.trim(),
        port: String(port),
        username: user.trim(),
        password: pass.trim(),
        transport: host.trim() ? 'LAN_RTSP' : 'P2P',
      });
      const resp = await fetch(
        `http://127.0.0.1:8001/api/cameras/nvr/sync-channels?${queryParams.toString()}`,
        { method: 'POST' }
      );
      if (resp.ok) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert('Failed connecting NVR.');
      }
    } catch {
      alert('Error connecting to NVR gateway.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">Connect NVR Master Gateway</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">NVR Hardware Serial Number *</label>
            <input
              type="text"
              required
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              placeholder="e.g. BE124E0PCA95532"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Host IP Address</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="192.168.1.108"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">RTSP / Control Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10) || 554)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="554"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">NVR Username</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">NVR Password</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Total Multiplexed Channels:</label>
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 32, 48].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setChannels(count)}
                  className={`py-2 rounded-lg border font-bold transition ${
                    channels === count
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {count} CH
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold">Automatic Multi-Channel Provisioning:</div>
            <div>• Auto-provisions {channels} IP channels into database with DMSS relay parameters.</div>
            <div>• Synchronizes go2rtc WebRTC paths for sub-second live streaming.</div>
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
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/25"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting NVR...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  <span>Connect & Auto-Provision</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
