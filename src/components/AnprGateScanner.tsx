import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, Scan, Globe } from 'lucide-react';
import type { PlateRecord } from '../types';
import { parsePlate } from '../engine/anprEngine';

interface AnprGateScannerProps {
  records: PlateRecord[];
  onAddRecord: (record: PlateRecord) => void;
}

export const AnprGateScanner: React.FC<AnprGateScannerProps> = ({
  records,
  onAddRecord,
}) => {
  const [testPlateInput, setTestPlateInput] = useState('');
  const [selectedCountryHint, setSelectedCountryHint] = useState<'US' | 'IN'>('US');
  const [vehicleType] = useState<PlateRecord['vehicleType']>('Heavy Tractor-Trailer');
  const [carrierInput, setCarrierInput] = useState('Swift Transportation Logistics');

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPlateInput.trim()) return;

    const parsed = parsePlate(testPlateInput, selectedCountryHint);

    const newRec: PlateRecord = {
      id: 'rec-' + Date.now(),
      plateNumber: parsed.normalizedPlate,
      country: parsed.country === 'UNKNOWN' ? selectedCountryHint : parsed.country,
      stateOrRegion: parsed.stateOrRegion,
      vehicleType,
      timestamp: new Date().toISOString(),
      confidence: parsed.confidence,
      gateId: 'North Gate Inbound - Bay 1',
      status: parsed.isValid ? 'authorized' : 'flagged',
      carrier: carrierInput || 'Standard Commercial Carrier',
      driverName: 'Verified Dispatch Operator',
    };

    onAddRecord(newRec);
    setTestPlateInput('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scan className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              ANPR NEURAL GATE ENGINE
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              OPENCV 4.10 HOMOGRAPHY
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dual-Market Automated Number Plate Recognition: US DOT Commercial & India HSRP Hologram Validation.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">BARRIER ARM: ACTIVE READY</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">LATENCY: 42ms</span>
        </div>
      </div>

      {/* Interactive Scan Simulator Form */}
      <form onSubmit={handleSimulateScan} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-4">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Simulate OCR Plate Read (Homography Perspective Rectification)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target Market Standard</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCountryHint('US');
                  if (!testPlateInput) setTestPlateInput('TX 831-PZR');
                }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                  selectedCountryHint === 'US' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 US Plates
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountryHint('IN');
                  if (!testPlateInput) setTestPlateInput('MH 14 EU 8812');
                }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
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
              onChange={(e) => setTestPlateInput(e.target.value)}
              placeholder={selectedCountryHint === 'US' ? 'e.g. TX 789-XYZ' : 'e.g. MH 12 RN 4589'}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Carrier / Logistics Operator</label>
            <input
              type="text"
              value={carrierInput}
              onChange={(e) => setCarrierInput(e.target.value)}
              placeholder="e.g. Schneider / TCI Freight"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs py-2 px-4 rounded-lg transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2"
            >
              <Scan className="w-4 h-4" />
              <span>TEST ANPR OCR</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Plate Manifest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Plate Number</th>
              <th className="py-3 px-4">Origin / Jurisdiction</th>
              <th className="py-3 px-4">Carrier & Driver</th>
              <th className="py-3 px-4">Gate & Time</th>
              <th className="py-3 px-4">OCR Confidence</th>
              <th className="py-3 px-4 text-right">Access Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {records.map(rec => {
              const isUS = rec.country === 'US';
              const isAuthorized = rec.status === 'authorized';

              return (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{isUS ? '🇺🇸' : '🇮🇳'}</span>
                      <span className="font-bold text-white text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                        {rec.plateNumber}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200">{rec.stateOrRegion}</div>
                    <div className="text-[10px] text-slate-500">{rec.vehicleType}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-sans">{rec.carrier}</div>
                    <div className="text-[10px] text-slate-500">{rec.driverName || 'Manifest Pending'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300">{rec.gateId}</div>
                    <div className="text-[10px] text-slate-500">{new Date(rec.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-cyan-400 font-bold">{(rec.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isAuthorized ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GATE OPEN</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>QUARANTINE</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
