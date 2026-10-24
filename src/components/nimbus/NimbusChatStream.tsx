import React, { useState } from 'react';
import { Bot, Terminal, Send, RefreshCw, Sparkles } from 'lucide-react';
import { SAMPLE_QUESTIONS, type ChatMessage } from './NimbusTypes';

interface NimbusChatStreamProps {
  chatMessages: ChatMessage[];
  isSending: boolean;
  onSendMessage: (text: string) => void;
}

export const NimbusChatStream: React.FC<NimbusChatStreamProps> = ({
  chatMessages,
  isSending,
  onSendMessage,
}) => {
  const [inputPrompt, setInputPrompt] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;
    onSendMessage(inputPrompt);
    setInputPrompt('');
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-2xl flex flex-col h-[580px] font-mono">
        {/* Console Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>NIMBUS OPERATIONAL REASONING ASSISTANT</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask questions grounded in live CCTV snapshots and yard context
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-purple-400 bg-purple-950/60 px-2 py-1 rounded border border-purple-800/50">
            <Terminal className="w-3.5 h-3.5" />
            <span>MULTIMODAL VLM</span>
          </div>
        </div>

        {/* Quick Query Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(q)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-slate-950 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-600 transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 text-xs">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl p-3.5 leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center space-x-1.5 text-purple-400 font-bold mb-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>NIMBUS AI</span>
                      {msg.referencedCameraId && (
                        <span className="text-slate-400 font-normal">
                          • Ref: {msg.referencedCameraId}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-line text-xs font-mono">{msg.content}</div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center space-x-2 text-purple-400 text-xs py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Nimbus is analyzing optical feeds and context...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Nimbus about trucks, license plates, briquettes, safety..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
