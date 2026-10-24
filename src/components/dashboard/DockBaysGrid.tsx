import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export interface DockBay {
  dock_id: string;
  name: string;
  status: 'OCCUPIED' | 'DETENTION' | 'HAZARD' | 'AVAILABLE' | 'RESERVED';
  truck_id?: string;
  plate_number?: string;
  carrier?: string;
  dwell_minutes?: number;
  free_time_minutes?: number;
  driver_name?: string;
  driver_phone?: string;
  cargo?: string;
  detention_fee?: number;
  hazard_detail?: string;
  eta?: string;
}

interface DockBaysGridProps {
  dockBays: DockBay[];
  tenantName: string;
  isIndia: boolean;
  onSelectDock: (bay: DockBay) => void;
  onSendDispatchAlert: (bay: DockBay) => void;
}

export const DockBaysGrid: React.FC<DockBaysGridProps> = ({
  dockBays,
  tenantName,
  isIndia,
  onSelectDock,
  onSendDispatchAlert
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Godown Dock Operations & Digital Twin Yard Layout
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live bay turnaround, detention clock accrual, and roof moisture anomaly telemetry for {tenantName}
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>In SLA (&lt;60m)</span>
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
            <span>Detention Overtime</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Moisture Hazard</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            <span>Available</span>
          </span>
        </div>
      </div>

      {/* 8-Bay Warehouse Schematic Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dockBays.map((bay) => {
          const isDetention = bay.status === 'DETENTION';
          const isHazard = bay.status === 'HAZARD';
          const isAvailable = bay.status === 'AVAILABLE';
          const isReserved = bay.status === 'RESERVED';

          return (
            <div
              key={bay.dock_id}
              onClick={() => onSelectDock(bay)}
              className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px] ${
                isDetention
                  ? 'bg-red-950/20 border-red-500/50 hover:border-red-400 hover:bg-red-950/30'
                  : isHazard
                  ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 hover:bg-amber-950/30'
                  : isAvailable
                  ? 'bg-slate-950/40 border-slate-700/60 border-dashed hover:border-cyan-500/50 hover:bg-slate-900/40'
                  : isReserved
                  ? 'bg-slate-950/30 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
              }`}
              style={{
                boxShadow: isDetention ? '0 0 20px -5px rgba(239,68,68,0.25)' : undefined
              }}
            >
              {/* Bay Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">{bay.dock_id}</span>
                  <h3 className="text-xs font-bold text-white mt-0.5">{bay.name}</h3>
                </div>

                {/* Status Badge */}
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] font-bold border ${
                    isDetention
                      ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                      : isHazard
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isReserved
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {bay.status}
                </span>
              </div>

              {/* Bay Core Information */}
              <div className="my-2.5">
                {isHazard ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Roof Specular Leak</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-snug">
                      {bay.hazard_detail || 'Moisture detected. Bay locked for inspection.'}
                    </p>
                  </div>
                ) : isAvailable ? (
                  <div className="py-2 text-center text-slate-400 text-xs">
                    <div className="font-semibold text-emerald-400">+ Ready for Docking</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Click to Assign Truck</div>
                  </div>
                ) : isReserved ? (
                  <div className="text-xs text-slate-400">
                    <div className="font-semibold text-purple-300">Reserved for Container</div>
                    <div className="text-[10px] text-slate-500 mt-1">{bay.eta}</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white">{bay.plate_number}</span>
                      <span className="text-[10px] text-slate-400">{bay.truck_id}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{bay.carrier}</div>

                    {/* Dwell Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Dwell: {bay.dwell_minutes}m</span>
                        <span className={isDetention ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {isDetention ? `+${(bay.dwell_minutes || 0) - (bay.free_time_minutes || 60)}m Over` : `${(bay.free_time_minutes || 60) - (bay.dwell_minutes || 0)}m Free`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isDetention ? 'bg-red-500' : 'bg-cyan-500'
                          }`}
                          style={{
                            width: `${Math.min(100, ((bay.dwell_minutes || 0) / (bay.free_time_minutes || 60)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bay Footer Actions */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                {isDetention ? (
                  <>
                    <span className="text-red-400 font-bold">Penalty: {isIndia ? `₹${bay.detention_fee}` : `$${bay.detention_fee}`}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendDispatchAlert(bay);
                      }}
                      className="rounded bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white px-2 py-0.5 font-bold transition-colors cursor-pointer"
                      title="Send WhatsApp Dispatch to Driver"
                    >
                      ⚡ WhatsApp Dispatch
                    </button>
                  </>
                ) : isHazard ? (
                  <>
                    <span className="text-amber-400 font-semibold">Bay Locked</span>
                    <span className="text-cyan-400 group-hover:underline">Inspect Leak →</span>
                  </>
                ) : isAvailable ? (
                  <>
                    <span className="text-slate-500">{bay.name} Available</span>
                    <span className="text-cyan-400 group-hover:underline">+ Assign</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-500 truncate max-w-[120px]">{bay.driver_name}</span>
                    <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="h-3 w-3" />
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
