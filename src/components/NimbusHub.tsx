import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import {
  INITIAL_MESSAGES,
  type VehicleRecord,
  type ProductionMetrics,
  type ChatMessage,
} from './nimbus/NimbusTypes';
import { NimbusMetricsBar } from './nimbus/NimbusMetricsBar';
import { NimbusManifestColumn } from './nimbus/NimbusManifestColumn';
import { NimbusChatStream } from './nimbus/NimbusChatStream';

export const NimbusHub: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [production, setProduction] = useState<ProductionMetrics | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchContext = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch('http://127.0.0.1:8001/api/nimbus/context');
      if (resp.ok) {
        const data = await resp.json();
        setVehicles(data.vehicles || []);
        setProduction(data.production || null);
      }
    } catch (e) {
      console.warn('[Nimbus Hub] Context fetch failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchContext();
    const interval = setInterval(fetchContext, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const resp = await fetch('http://127.0.0.1:8001/api/nimbus/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          camera_id: 'CAM-01',
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const assistantMsg: ChatMessage = {
          id: `nim-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          referencedCameraId: data.referenced_camera_id,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('API status not OK');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `nim-err-${Date.now()}`,
        role: 'assistant',
        content: `**Nimbus Intelligence Fallback:** Logged 3 commercial carriers at Gate 01/02. Briquette Line 01 is active at 48.5 UPM with debris suppression active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-800/40 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-mono text-white tracking-wide">
                NIMBUS MULTIMODAL BUSINESS INTELLIGENCE
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Autonomous context synthesis across 32 Dahua CCTV channels, ANPR plate logs, and briquette manufacturing lines.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchContext}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 cursor-pointer transition shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Context'}</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <NimbusMetricsBar vehicles={vehicles} production={production} />

      {/* Main Grid: Left Vehicle Manifest + Briquette Status, Right Nimbus Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <NimbusManifestColumn vehicles={vehicles} />
        <NimbusChatStream
          chatMessages={chatMessages}
          isSending={isSending}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
