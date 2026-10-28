import React from 'react';
import {
  Server, Plus, RefreshCw, LayoutGrid, Grid, Square, ChevronLeft, ChevronRight, Layers, Cloud
} from 'lucide-react';
import type { CctvLayoutMode, MatrixStatus } from './types';

interface CctvTopBarProps {
  matrixStatus: MatrixStatus;
  totalChannels: number;
  layoutMode: CctvLayoutMode;
  currentPage: number;
  totalPages: number;
  onLayoutChange: (mode: CctvLayoutMode) => void;
  onPageChange: (page: number) => void;
  onOpenAddCamera: () => void;
  onOpenAddNvr: () => void;
  onOpenSyncModal: () => void;
  onOpenCloudShare?: () => void;
}

export const CctvTopBar: React.FC<CctvTopBarProps> = ({
  matrixStatus,
  totalChannels,
  layoutMode,
  currentPage,
  totalPages,
  onLayoutChange,
  onPageChange,
  onOpenAddCamera,
  onOpenAddNvr,
  onOpenSyncModal,
  onOpenCloudShare,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-xs font-mono shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Hardware Telemetry & Quick Action Modals */}
      <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
        <span
          className={`flex items-center gap-1.5 font-bold ${
            matrixStatus.nvr_online ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              matrixStatus.nvr_online ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
            }`}
          />
          <span>
            Dahua NVR ({matrixStatus.nvr_serial}): {totalChannels} Channels Configured
          </span>
        </span>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
        <button
          type="button"
          onClick={onOpenAddCamera}
          className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          title="Register new RTSP / DMSS camera stream"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Camera</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddNvr}
          className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          title="Connect Dahua or ONVIF NVR Master Unit"
        >
          <Server className="w-3.5 h-3.5" />
          <span>Add NVR</span>
        </button>
        <button
          type="button"
          onClick={onOpenSyncModal}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-cyan-50 dark:bg-slate-900 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 border border-cyan-200 dark:border-cyan-800/60 transition flex items-center gap-1.5 cursor-pointer font-bold"
          title="Auto-fetch all 32/48 channels from Dahua NVR"
        >
          <RefreshCw className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>Sync NVR Channels</span>
        </button>
        {onOpenCloudShare && (
          <button
            type="button"
            onClick={onOpenCloudShare}
            className="px-2.5 py-1 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            title="Official Dahua DMSS Cloud Share & Delegation"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Connect Cloud</span>
          </button>
        )}
      </div>

      {/* Dahua Layout Switcher & Pagination */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onLayoutChange('4')}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
              layoutMode === '4' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="4-Split Quad Grid"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>4-Split</span>
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('8')}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
              layoutMode === '8' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="8-Split Multi Grid"
          >
            <Grid className="w-3 h-3" />
            <span>8-Split</span>
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('9')}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
              layoutMode === '9' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="9-Split Quad Grid"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>9-Split</span>
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('16')}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
              layoutMode === '16' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="16-Split Matrix View"
          >
            <Square className="w-3 h-3" />
            <span>16-Split</span>
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('all')}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
              layoutMode === 'all' ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="All Cameras Grid"
          >
            <Layers className="w-3 h-3" />
            <span>All Channels</span>
          </button>
        </div>

        {/* Pagination when layout is paginated */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-cyan-400 font-mono px-1.5 font-bold">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
