import React from 'react';
import { AlertTriangle, MessageSquare, FileText, Sun, Moon } from 'lucide-react';
import { Can, type StandardUser } from '@packages/standards';
import type { SpillIncident } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200 shadow-sm dark:shadow-none">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base text-slate-900 dark:text-white font-mono tracking-wider">
              {tenantName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Right Status Controls & Theme Switcher */}
        <div className="flex items-center space-x-3">
          {/* Critical Alert Indicator */}
          {activeSpillsCount > 0 && firstActiveSpill && (
            <button
              type="button"
              onClick={() => onOpenSpillModal(firstActiveSpill)}
              className="hidden sm:flex items-center space-x-2 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 px-3 py-1 rounded-lg text-xs font-mono text-red-700 dark:text-red-300 animate-pulse cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/60"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>{activeSpillsCount} ACTIVE HAZARD</span>
            </button>
          )}

          {/* Quick Incident Escalation Dispatch */}
          <button
            type="button"
            onClick={onOpenAlertModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-500/40 transition shadow-sm hover:shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Incident Dispatch</span>
          </button>

          {/* PDF Audit Export (CASL RBAC Guarded) */}
          <Can user={standardUser} do="audit:export">
            <button
              type="button"
              onClick={onOpenAuditModal}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-cyan-500/40 transition shadow-sm hover:shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Audit PDF</span>
            </button>
          </Can>

          {/* Top-Right Light/Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle-button"
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="text-[11px] font-mono font-bold text-amber-300 hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-mono font-bold text-slate-800 hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
