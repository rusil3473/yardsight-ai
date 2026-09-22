import {
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Scale,
  ArrowRight
} from 'lucide-react';
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

  const CARRIER_BENCHMARKS = [
    { name: 'Tata Logistics Express', avgDwell: '52m', onTimeRate: '94.2%', activeTrucks: 2, status: 'OPTIMAL' },
    { name: 'BlueDart Surface Prime', avgDwell: '38m', onTimeRate: '98.5%', activeTrucks: 1, status: 'EXEMPLARY' },
    { name: 'Delhivery Heavy Freight', avgDwell: '64m', onTimeRate: '88.0%', activeTrucks: 1, status: 'DETENTION_RISK' },
    { name: 'VRL Logistics Cold Chain', avgDwell: '42m', onTimeRate: '96.1%', activeTrucks: 1, status: 'OPTIMAL' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Track Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
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
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan-400" />
              {tenant.free_time_hours}hr Free Time Window
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Fleet & Dock Turnaround Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time dwell monitoring with automated detention alerts, carrier SLAs, and driver WhatsApp gate passes for {tenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2 text-center shadow-sm">
            <div className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{trucks.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Trucks</div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2 text-center shadow-sm">
            <div className="text-lg font-extrabold text-amber-400" style={{ fontFamily: 'var(--font-heading)' }}>{tenant.active_docks}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dock Bays</div>
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

      {/* Operational Intelligence Row: Carrier SLA Benchmarks & Weighbridge Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Carrier SLA Benchmark Table */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Carrier Turnaround Efficiency Leaderboard
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +14% Faster Gate Release
            </span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="py-2.5 px-3">Carrier Partner</th>
                  <th className="py-2.5 px-3">Average Dwell</th>
                  <th className="py-2.5 px-3">On-Time SLA</th>
                  <th className="py-2.5 px-3">Active In Yard</th>
                  <th className="py-2.5 px-3 text-right">Operational Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {CARRIER_BENCHMARKS.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{c.avgDwell}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{c.onTimeRate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{c.activeTrucks} units</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold border ${
                        c.status === 'EXEMPLARY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : c.status === 'DETENTION_RISK'
                          ? 'bg-red-500/10 text-red-400 border-red-500/25'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weighbridge & Outbound Clearance Telemetry */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Gate Weighbridge Sync
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">CALIBRATED</span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Gross Vehicle Weight (GVW):</span>
                  <span className="font-mono text-white font-bold">38,420 kg</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Tare (Unladen Truck):</span>
                  <span className="font-mono text-slate-300">12,180 kg</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-800/60 flex justify-between text-xs font-bold text-emerald-400">
                  <span>Net Cargo Weight:</span>
                  <span>26,240 kg (Legal Limit: 28,000 kg)</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white text-xs">Outbound Gate 02 Auto-Pass</div>
                    <div className="text-[10px] text-slate-400">E-Way Bill QR verified at Weigh Scale</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Axle Load Sensors: Active</span>
            <span className="text-cyan-400 font-semibold font-mono">Tolerance: ±0.1%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
