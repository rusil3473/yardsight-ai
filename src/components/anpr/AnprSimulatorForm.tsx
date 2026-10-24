import React from 'react';
import { Scan, Globe, Sliders } from 'lucide-react';
import { CORNER_PRESETS } from './AnprTypes';

interface AnprSimulatorFormProps {
  testPlateInput: string;
  selectedCountryHint: 'US' | 'IN';
  carrierInput: string;
  selectedPreset: keyof typeof CORNER_PRESETS;
  isProcessing: boolean;
  onTestPlateChange: (val: string) => void;
  onCountrySelect: (country: 'US' | 'IN', defaultPlate: string, defaultCarrier: string) => void;
  onCarrierChange: (val: string) => void;
  onPresetChange: (preset: keyof typeof CORNER_PRESETS) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AnprSimulatorForm: React.FC<AnprSimulatorFormProps> = ({
  testPlateInput,
  selectedCountryHint,
  carrierInput,
  selectedPreset,
  isProcessing,
  onTestPlateChange,
  onCountrySelect,
  onCarrierChange,
  onPresetChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>OpenCV 4.10 Perspective Homography Rectification</span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Angle Calibration:</span>
          <select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value as keyof typeof CORNER_PRESETS)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded px-2 py-1 font-mono focus:outline-none"
          >
            {Object.entries(CORNER_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Target Market Standard</label>
          <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => onCountrySelect('US', 'TX 942-WKY', 'Schneider National Intermodal')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition cursor-pointer ${
                selectedCountryHint === 'US' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 US Plates
            </button>
            <button
              type="button"
              onClick={() => onCountrySelect('IN', 'MH 12 RN 4589', 'TCI Freight Intermodal Logistics')}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition cursor-pointer ${
                selectedCountryHint === 'IN' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India HSRP
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Raw License Plate String</label>
          <input
            type="text"
            value={testPlateInput}
            onChange={(e) => onTestPlateChange(e.target.value)}
            placeholder={selectedCountryHint === 'US' ? 'e.g. TX 789-XYZ' : 'e.g. MH 12 RN 4589'}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Carrier / Logistics Operator</label>
          <input
            type="text"
            value={carrierInput}
            onChange={(e) => onCarrierChange(e.target.value)}
            placeholder="e.g. Schneider / TCI Freight"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs py-2 px-4 rounded-lg transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>{isProcessing ? 'CALCULATING H...' : 'EXECUTE OPENCV UNWARP'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
