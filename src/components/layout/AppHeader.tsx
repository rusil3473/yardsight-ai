import React from 'react';
import { AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { Can, type StandardUser } from '@packages/standards';
import type { SpillIncident } from '../../types';

interface AppHeaderProps {
  tenantName: string;
  roleLabel: string;
  activeSpillsCount: number;
  firstActiveSpill?: SpillIncident | null;
  standardUser: StandardUser;
  onOpenSpillModal: (spill: SpillIncident) => void;
  onOpenAlertModal: () => void;
  onOpenAuditModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  tenantName,
  roleLabel,
  activeSpillsCount,
  firstActiveSpill,
  standardUser,
  onOpenSpillModal,
  onOpenAlertModal,
  onOpenAuditModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base text-white font-mono tracking-wider">
              {tenantName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center space-x-3">
          {/* Critical Alert Indicator */}
          {activeSpillsCount > 0 && firstActiveSpill && (
            <button
              type="button"
              onClick={() => onOpenSpillModal(firstActiveSpill)}
              className="hidden sm:flex items-center space-x-2 bg-red-950/60 border border-red-500/40 px-3 py-1 rounded-lg text-xs font-mono text-red-300 animate-pulse cursor-pointer hover:bg-red-900/60"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{activeSpillsCount} ACTIVE HAZARD</span>
            </button>
          )}

          {/* Quick Incident Escalation Dispatch */}
          <button
            type="button"
            onClick={onOpenAlertModal}
            className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-500/40 transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Incident Dispatch</span>
          </button>

          {/* PDF Audit Export (CASL RBAC Guarded) */}
          <Can user={standardUser} do="audit:export">
            <button
              type="button"
              onClick={onOpenAuditModal}
              className="bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-cyan-500/40 transition shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Audit PDF</span>
            </button>
          </Can>
        </div>
      </div>
    </header>
  );
};
