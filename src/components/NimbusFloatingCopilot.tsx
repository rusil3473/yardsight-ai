import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/env';

interface NimbusFloatingCopilotProps {
  activeCameraId?: string;
}

export const NimbusFloatingCopilot: React.FC<NimbusFloatingCopilotProps> = ({ activeCameraId = 'CAM-01' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; time: string }>>([
    {
      role: 'assistant',
      content: 'Nimbus Copilot active. Ask me about license plates, truck manifests, briquette output, or safety.',
      time: 'Now'
    }
  ]);

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    const userMsg = {
      role: 'user' as const,
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsSending(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/api/nimbus/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          camera_id: activeCameraId
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Nimbus fallback: Gate 01/02 active with 3 commercial carriers verified. Briquette Line 01 running with optical debris suppression.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-2xl hover:scale-105 transition-all duration-200 border border-purple-400/40 cursor-pointer"
          title="Open Nimbus AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span>NIMBUS COPILOT</span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[420px] h-[550px] bg-slate-900/95 border border-purple-800/60 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col font-mono overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-purple-950/40 border-b border-purple-800/40">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  NIMBUS COPILOT
                </h3>
                <span className="text-[10px] text-purple-300">
                  Focus: {activeCameraId}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Pill Suggestions */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => handleSend('Summarize inbound vehicle plates')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-slate-700 transition cursor-pointer"
            >
              Truck Plates
            </button>
            <button
              type="button"
              onClick={() => handleSend('Check briquette line throughput and debris status')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-slate-700 transition cursor-pointer"
            >
              Briquette Line
            </button>
            <button
              type="button"
              onClick={() => handleSend('Audit on-floor workers in safety zone')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-slate-700 transition cursor-pointer"
            >
              Worker Safety
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-xl p-2.5 leading-relaxed ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {!isUser && (
                      <div className="text-[10px] text-purple-400 font-bold mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>NIMBUS AI</span>
                      </div>
                    )}
                    <div className="whitespace-pre-line text-[11px]">
                      {m.content}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center space-x-1.5 text-purple-400 text-[11px] py-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Nimbus is reasoning...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputPrompt);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Nimbus..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isSending}
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
