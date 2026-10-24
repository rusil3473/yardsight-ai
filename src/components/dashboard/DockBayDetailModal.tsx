import React from 'react';
import { Truck, X, AlertTriangle, Send } from 'lucide-react';
import type { DockBay } from './DockBaysGrid';

interface DockBayDetailModalProps {
  dock: DockBay | null;
  tenantName: string;
  isIndia: boolean;
  onClose: () => void;
  onSendDispatch: (dock: DockBay) => void;
  onOpenCheckIn: () => void;
}

export const DockBayDetailModal: React.FC<DockBayDetailModalProps> = ({
  dock,
  tenantName,
  isIndia,
  onClose,
  onSendDispatch,
  onOpenCheckIn
}) => {
  if (!dock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">{dock.name} - Bay Telemetry</h3>
              <span className="text-xs text-slate-400">{tenantName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {dock.status === 'HAZARD' ? (
            <div className="rounded-xl bg-amber-950/30 border border-amber-500/40 p-4 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Physical AI Specular Water Leak Warning</span>
              </div>
              <p>{dock.hazard_detail}</p>
              <div className="pt-2 border-t border-amber-500/20 text-[11px] flex justify-between">
                <span>Wet Slab Area: 14.8 m²</span>
                <span>Risk: {isIndia ? '₹18.4 Lakhs' : '$22,500'}</span>
              </div>
            </div>
          ) : dock.status === 'AVAILABLE' ? (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 text-center space-y-3">
              <p className="text-slate-300">This dock bay is clean, inspected, and ready for assignment.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckIn();
                }}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 font-bold transition-colors cursor-pointer"
              >
                + Check In Inbound Truck to This Bay
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">License Plate</span>
                  <span className="font-mono font-bold text-white text-sm">{dock.plate_number}</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                  <span className={`font-bold text-sm ${dock.status === 'DETENTION' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {dock.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier:</span>
                  <span className="font-semibold text-white">{dock.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver:</span>
                  <span className="text-white">{dock.driver_name} ({dock.driver_phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cargo:</span>
                  <span className="text-white">{dock.cargo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dwell Time:</span>
                  <span className="font-mono font-bold text-cyan-400">{dock.dwell_minutes} minutes</span>
                </div>
                {dock.detention_fee && dock.detention_fee > 0 && (
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-red-400 font-bold">
                    <span>Detention Fee Accrued:</span>
                    <span>{isIndia ? `₹${dock.detention_fee}` : `$${dock.detention_fee}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          {dock.status === 'DETENTION' && (
            <button
              onClick={() => {
                onSendDispatch(dock);
                onClose();
              }}
              className="rounded-xl bg-red-500 hover:bg-red-400 text-white px-4 py-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send WhatsApp Dispatch</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
