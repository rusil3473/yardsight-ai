import React, { useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarFacilitySelectorProps {
  marketMode: 'IN_GST' | 'US_FREIGHT';
  onSelectMarketMode: (mode: 'IN_GST' | 'US_FREIGHT') => void;
}

export const SidebarFacilitySelector: React.FC<SidebarFacilitySelectorProps> = ({
  marketMode,
  onSelectMarketMode
}) => {
  const { tenant, availableTenants, switchTenant } = useAuth();
  const [isFacilityMenuOpen, setIsFacilityMenuOpen] = useState(false);

  return (
    <>
      {/* Facility Selector */}
      <div className="p-3 border-b border-slate-800/60 relative">
        <button
          type="button"
          onClick={() => setIsFacilityMenuOpen(!isFacilityMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">FACILITY</div>
              <div className="text-xs font-bold text-white truncate">{tenant.name}</div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {isFacilityMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 py-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 animate-in fade-in">
            {availableTenants.map((t) => (
              <button
                key={t.tenant_id}
                type="button"
                onClick={() => {
                  switchTenant(t.tenant_id);
                  setIsFacilityMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="truncate">
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.location}</div>
                </div>
                {tenant.tenant_id === t.tenant_id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Regulatory Mode Switcher (India GST vs US Freight) */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => onSelectMarketMode('IN_GST')}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              marketMode === 'IN_GST'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 IN GST
          </button>
          <button
            type="button"
            onClick={() => onSelectMarketMode('US_FREIGHT')}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
              marketMode === 'US_FREIGHT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇺🇸 US eBOL
          </button>
        </div>
      </div>
    </>
  );
};
