import React from 'react';
import { Truck, Clock, AlertTriangle } from 'lucide-react';
import { DockTurnaroundTracker } from '../components/DockTurnaroundTracker';
import { useAuth } from '../context/AuthContext';

interface FleetTrackViewProps {
  trucks: any[];
  onGenerateDocument: (truckId: string, docType: string) => void;
  onSendDispatch: (truckId: string) => void;
  generatedDoc: any;
  marketMode: string;
}

export const FleetTrackView: React.FC<FleetTrackViewProps> = ({
  trucks,
  onGenerateDocument,
  onSendDispatch,
  generatedDoc,
  marketMode
}) => {
  const { tenant } = useAuth();
  const detentionCount = trucks.filter(t => t.is_detention).length;

  return (
    <div className="space-y-6">
      {/* Track Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/50">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            {detentionCount > 0 ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 border border-red-500/20 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                {detentionCount} Detention Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                All Within SLA
              </span>
            )}
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {tenant.free_time_hours}hr Free Time
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Fleet & Dock Turnaround
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time dwell monitoring with automated detention alerts and driver dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5 text-center">
            <div className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{trucks.length}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Active Trucks</div>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 px-4 py-2.5 text-center">
            <div className="text-lg font-extrabold text-amber-400" style={{ fontFamily: 'var(--font-heading)' }}>{tenant.active_docks}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dock Bays</div>
          </div>
        </div>
      </div>

      {/* Dock Turnaround Component */}
      <DockTurnaroundTracker
        trucks={trucks}
        onGenerateDocument={onGenerateDocument}
        onSendDispatch={onSendDispatch}
        generatedDoc={generatedDoc}
        marketMode={marketMode}
      />
    </div>
  );
};
