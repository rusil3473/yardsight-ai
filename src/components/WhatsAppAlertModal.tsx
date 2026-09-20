import React, { useState } from 'react';
import { MessageSquare, Send, X, CheckCircle2, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultMessage?: string;
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = 'URGENT: Hazardous Fluid Leak Alert',
  defaultMessage = '[YardSight Incident Alert]\nCamera: Cam-03 (Fuel Bay South)\nClassification: Diesel Fuel (18.5 sq ft)\nRefractive Index: 1.462 (Chromatic Rainbow Sheen Verified)\nAction: Hazmat containment boom dispatched to drainage zone.',
}) => {
  const [recipient, setRecipient] = useState('+91 98765 43210');
  const [marketPrefix, setMarketPrefix] = useState<'IN' | 'US'>('IN');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [title, setTitle] = useState(defaultTitle);
  const [message, setMessage] = useState(defaultMessage);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                EMERGENCY INCIDENT ESCALATION
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Automated WhatsApp Business & Twilio SMS Dispatch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold font-mono text-white">DISPATCH TRANSMITTED</h4>
            <p className="text-xs text-slate-300 font-mono max-w-sm">
              Payload successfully routed via WhatsApp Cloud API webhook to {recipient}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendDispatch} className="space-y-4">
            {/* Channel and Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Channel</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-0.5">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                      channel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                      channel === 'sms' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    SMS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Region Preset</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMarketPrefix('IN');
                      setRecipient('+91 98765 43210');
                    }}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                      marketPrefix === 'IN' ? 'bg-orange-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    🇮🇳 India (+91)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketPrefix('US');
                      setRecipient('+1 (512) 555-0199');
                    }}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                      marketPrefix === 'US' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    🇺🇸 US (+1)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Supervisor Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Incident Headline</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Automated Message Body</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>SEND EMERGENCY NOTIFICATION</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
