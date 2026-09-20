import React, { useState } from 'react';
import { Bot, Send, Sparkles, Terminal, Camera } from 'lucide-react';
import type { VlmChatMessage } from '../types';
import { processVlmQuery } from '../engine/vlmAgent';

interface VlmChatAssistantProps {
  messages: VlmChatMessage[];
  onSendMessage: (msg: VlmChatMessage) => void;
  activePlatesCount: number;
  unresolvedSpillsCount: number;
}

export const VlmChatAssistant: React.FC<VlmChatAssistantProps> = ({
  messages,
  onSendMessage,
  activePlatesCount,
  unresolvedSpillsCount,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    const userMsg: VlmChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    onSendMessage(userMsg);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const vlmResponse = await processVlmQuery(queryText, {
        activePlates: activePlatesCount,
        unresolvedSpills: unresolvedSpillsCount,
        activeHazards: 2,
        onlineCameras: 4,
      });

      onSendMessage(vlmResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleQueries = [
    'Summarize all inbound trucks & plate status',
    'Check Loading Bay 3 PPE safety violations',
    'Evaluate active diesel leaks and absorbent needs',
    'Generate daily facility security index',
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl flex flex-col h-[520px]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-white flex items-center space-x-2">
              <span>YARDSIGHT VLM REASONING ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                NEBIUS NVIDIA COSMOS / AWS BEDROCK
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Natural Language Spatial-Temporal CCTV Query Agent
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>INFERENCE: ACTIVE</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center space-x-2 mb-1 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>YardSight Spatial Agent</span>
                    {msg.referencedCameraId && (
                      <span className="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60 flex items-center space-x-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Source: {msg.referencedCameraId}</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[9px] text-slate-400/80 mt-1.5 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono py-2 animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Analyzing spatial-temporal video frames across 4 RTSP buffers...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-800/80 mt-2">
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="flex items-center space-x-2 pt-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about trucks, leaks, or safety hazards..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded-lg transition shadow-lg shadow-purple-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
