import React, { useState } from 'react';
import { Server, RefreshCw, CheckCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

interface CctvSyncChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CctvSyncChannelsModal: React.FC<CctvSyncChannelsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [syncSerial, setSyncSerial] = useState<string>('BE124E0PCA95532');
  const [syncTotalChannels, setSyncTotalChannels] = useState<number>(32);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncChannels = async () => {
    setIsSyncing(true);
    setSyncResultMsg(null);
    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/cameras/nvr/sync-channels?serial_number=${encodeURIComponent(
          syncSerial
        )}&total_channels=${syncTotalChannels}`,
        { method: 'POST' }
      );
      const data = await resp.json();
      if (data.status === 'SUCCESS') {
        setSyncResultMsg(`Synchronized ${data.total_channels} channels for NVR ${data.nvr_serial}!`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSyncResultMsg(null);
        }, 1800);
      } else {
        setSyncResultMsg(data.message || 'Synchronization completed.');
      }
    } catch {
      setSyncResultMsg('Failed communicating with camera router service.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">Auto-Sync NVR Channels</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">NVR Hardware Serial Number:</label>
            <input
              type="text"
              value={syncSerial}
              onChange={(e) => setSyncSerial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              placeholder="e.g. BE124E0PCA95532"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Total NVR Channels to Import:</label>
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 32, 48].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSyncTotalChannels(count)}
                  className={`py-2 rounded-lg border font-bold transition ${
                    syncTotalChannels === count
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
            <div className="text-slate-300 font-bold">Auto-Discovery Feature:</div>
            <div>• Maps all {syncTotalChannels} multiplexed video channels from Dahua NVR.</div>
            <div>• Retains DMSS account binding without unbinding or QR scans.</div>
            <div>• Dynamically generates zone configurations and AI pipelines.</div>
          </div>

          {syncResultMsg && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 text-cyan-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{syncResultMsg}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSyncChannels}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/25"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing {syncTotalChannels} Channels...</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5" />
                <span>Sync {syncTotalChannels} Channels Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
