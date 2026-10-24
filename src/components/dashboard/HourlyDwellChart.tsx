import React from 'react';

interface MetricItem {
  hour: string;
  trucks: number;
  dwell: number;
}

interface HourlyDwellChartProps {
  hourlyMetrics: MetricItem[];
  hoveredBarIndex: number | null;
  onHoverBar: (index: number | null) => void;
  isIndia: boolean;
}

export const HourlyDwellChart: React.FC<HourlyDwellChartProps> = ({
  hourlyMetrics,
  hoveredBarIndex,
  onHoverBar,
  isIndia
}) => {
  return (
    <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Hourly Gate & Dock Turnaround Cycle
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Truck arrivals vs Average Dwell Minutes with 60-min SLA threshold</p>
          </div>
          <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SLA Compliance: 89.4%
          </span>
        </div>

        {/* SVG Chart Container */}
        <div className="mt-6 relative h-56 w-full">
          <div className="absolute right-2 top-[32%] z-10 rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-red-300">
            SLA Threshold: 60m Free Limit
          </div>

          <svg className="w-full h-full" viewBox="0 0 540 190" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="barGood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="barOvertime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="20" x2="520" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
            <line x1="40" y1="65" x2="520" y2="65" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.8" />
            <line x1="40" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
            <line x1="40" y1="155" x2="520" y2="155" stroke="#475569" strokeWidth="1" opacity="0.6" />

            {/* Y-Axis Labels */}
            <text x="10" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">90m</text>
            <text x="10" y="69" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">60m</text>
            <text x="10" y="114" fill="#64748b" fontSize="10" fontFamily="monospace">30m</text>
            <text x="15" y="159" fill="#64748b" fontSize="10" fontFamily="monospace">0m</text>

            {/* Bars & Interactive Points */}
            {hourlyMetrics.map((d, i) => {
              const barX = 75 + i * 75;
              const barW = 34;
              const barH = (d.dwell / 100) * 135;
              const barY = 155 - barH;
              const isOver = d.dwell > 60;
              const isHovered = hoveredBarIndex === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => onHoverBar(i)}
                  onMouseLeave={() => onHoverBar(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  <rect
                    x={barX - barW / 2}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx="6"
                    fill={isOver ? 'url(#barOvertime)' : 'url(#barGood)'}
                    filter={isHovered ? 'drop-shadow(0px 0px 10px rgba(6,182,212,0.7))' : 'none'}
                    opacity={isHovered ? 1 : 0.9}
                  />

                  <text
                    x={barX}
                    y={barY - 8}
                    fill={isOver ? '#fca5a5' : '#67e8f9'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.dwell}m
                  </text>

                  <text
                    x={barX}
                    y="175"
                    fill={isHovered ? '#f8fafc' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {d.hour}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredBarIndex !== null && hourlyMetrics[hoveredBarIndex] && (
            <div
              className="absolute z-20 rounded-xl bg-slate-900 border border-cyan-500/40 p-2.5 shadow-2xl text-xs pointer-events-none transform -translate-x-1/2"
              style={{
                left: `${75 + hoveredBarIndex * 75}px`,
                top: '10px'
              }}
            >
              <div className="font-bold text-white">{hourlyMetrics[hoveredBarIndex].hour} Operational Window</div>
              <div className="text-[11px] text-slate-300">
                Arrivals: <span className="text-cyan-400 font-bold">{hourlyMetrics[hoveredBarIndex].trucks} trucks</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Average Dwell: <span className={hourlyMetrics[hoveredBarIndex].dwell > 60 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{hourlyMetrics[hoveredBarIndex].dwell} mins</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span>Standard Operations (&lt;60m Free Time)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span>Detention Overtime ({isIndia ? '₹2,400' : '$75'}/hr Incurred)</span>
        </span>
      </div>
    </div>
  );
};
