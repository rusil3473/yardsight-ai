import React from 'react';
import { Plus, X } from 'lucide-react';

interface TruckCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTruck: {
    plate: string;
    carrier: string;
    driverName: string;
    driverPhone: string;
    dockId: string;
    cargo: string;
  };
  onChangeNewTruck: (updated: any) => void;
}

export const TruckCheckInModal: React.FC<TruckCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newTruck,
  onChangeNewTruck
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Inbound Truck Gate Check-In</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">License Plate Number</label>
            <input
              type="text"
              value={newTruck.plate}
              onChange={(e) => onChangeNewTruck({ ...newTruck, plate: e.target.value })}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. MH-12-RN-4819"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Carrier Company</label>
            <input
              type="text"
              value={newTruck.carrier}
              onChange={(e) => onChangeNewTruck({ ...newTruck, carrier: e.target.value })}
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. Tata Logistics, Swift, BlueDart"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Driver Name</label>
              <input
                type="text"
                value={newTruck.driverName}
                onChange={(e) => onChangeNewTruck({ ...newTruck, driverName: e.target.value })}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Driver Mobile</label>
              <input
                type="text"
                value={newTruck.driverPhone}
                onChange={(e) => onChangeNewTruck({ ...newTruck, driverPhone: e.target.value })}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Assign Dock Bay</label>
            <select
              value={newTruck.dockId}
              onChange={(e) => onChangeNewTruck({ ...newTruck, dockId: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="DOCK-06">Dock 06 (Available - Recommended)</option>
              <option value="DOCK-08">Dock 08 (Reserved)</option>
              <option value="DOCK-01">Dock 01</option>
              <option value="DOCK-03">Dock 03</option>
              <option value="DOCK-05">Dock 05</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Cargo Description</label>
            <input
              type="text"
              value={newTruck.cargo}
              onChange={(e) => onChangeNewTruck({ ...newTruck, cargo: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer shadow-lg"
            >
              Confirm Gate Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
