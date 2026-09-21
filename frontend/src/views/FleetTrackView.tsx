import React from 'react';
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

  return (
    <div className="space-y-6">
      {/* Track Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              Active Yard Detention Watch
            </span>
            <span className="text-xs text-slate-400">SLA: {tenant.free_time_hours}hr Free Time</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-white tracking-tight">
            Fleet Dwell & Dock Turnaround Tracker
          </h2>
          <p className="text-xs text-slate-400">
            Real-time demurrage meter at ${tenant.detention_rate_per_hour}/hr with automated driver WhatsApp gate clearance.
          </p>
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
