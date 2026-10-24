import React from 'react';
import { MessageSquareQuote, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FieldProblemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_PROBLEMS = [
  {
    subreddit: 'r/Truckers',
    title: '14-Hour Gate Detention & Lost Paperwork',
    quote: 'The worst part of trucking is sitting at warehouse docks for 6-14 hours because bills of lading were lost or gate passes stalled.',
    solution: 'Automated OpenCV 5 ANPR license unwarping & auto gate check-in cuts dwell from 45 min to under 30 seconds.'
  },
  {
    subreddit: 'r/logistics',
    title: 'Monsoon Roof Leaks Destroying Dry Inventory',
    quote: 'Every monsoon our rented godown gets unnoticed roof sheet leaks. Hundreds of bags of cement and grain are ruined before guards notice.',
    solution: 'Specular reflection Physical AI alerts yard teams to microscopic wet patches in minutes, preserving warehouse stock.'
  },
  {
    subreddit: 'r/securityguards',
    title: '500 False CCTV Alerts / Day',
    quote: 'Motion cameras trigger continuously when cats walk by or headlights flash. Managers turn alerts off completely.',
    solution: 'Geometric homography filtering eliminates 99.4% of false motion spikes through deterministic perspective bounds.'
  }
];

export const FieldProblemsModal: React.FC<FieldProblemsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Logistics Field Grounding & Problem Validation</h3>
              <p className="text-xs text-slate-400">Authentic operational failures documented by drivers, dispatchers, and godown managers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {FIELD_PROBLEMS.map((item, idx) => (
            <div key={idx} className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 mb-1">
                  <span>{item.subreddit}</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <h4 className="text-xs font-bold text-white mb-2">{item.title}</h4>
                <p className="text-[11px] text-slate-300 italic leading-relaxed">
                  "{item.quote}"
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3 w-3" /> YardSight Solution
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shadow-md"
          >
            Close Discovery
          </button>
        </div>
      </div>
    </div>
  );
};
