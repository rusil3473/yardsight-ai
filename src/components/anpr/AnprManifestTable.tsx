import React from 'react';
import { CheckCircle2, AlertOctagon, Edit2, Check, X } from 'lucide-react';
import type { PlateRecord } from '../../types';
import { validatePlateString } from './AnprTypes';

interface AnprManifestTableProps {
  records: PlateRecord[];
  editingRecordId: string | null;
  editPlateValue: string;
  saveLoading: boolean;
  onStartEdit: (rec: PlateRecord) => void;
  onCancelEdit: () => void;
  onSaveEdit: (rec: PlateRecord) => void;
  onEditPlateChange: (val: string) => void;
}

export const AnprManifestTable: React.FC<AnprManifestTableProps> = ({
  records,
  editingRecordId,
  editPlateValue,
  saveLoading,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditPlateChange,
}) => {
  return (
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
          {records.map((rec) => {
            const isUS = rec.country === 'US';
            const isAuthorized = rec.status === 'authorized';

            return (
              <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4">
                  {editingRecordId === rec.id ? (
                    <div className="space-y-1.5 py-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">{isUS ? '🇺🇸' : '🇮🇳'}</span>
                        <input
                          type="text"
                          value={editPlateValue}
                          onChange={(e) => onEditPlateChange(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveEdit(rec);
                            if (e.key === 'Escape') onCancelEdit();
                          }}
                          autoFocus
                          placeholder="Enter corrected plate"
                          className="bg-slate-950 border border-cyan-400 text-white font-mono font-bold text-xs px-2 py-1 rounded outline-none focus:ring-1 focus:ring-cyan-300 w-36 uppercase tracking-wider shadow"
                        />
                        <button
                          type="button"
                          onClick={() => onSaveEdit(rec)}
                          disabled={saveLoading}
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow"
                          title="Save corrected plate (Enter)"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Cancel edit (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Real-time format validator pill */}
                      {(() => {
                        const val = validatePlateString(editPlateValue, rec.country);
                        return (
                          <div
                            className={`text-[10px] font-mono flex items-center space-x-1 ${
                              val.isValid ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                val.isValid ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                              }`}
                            />
                            <span>{val.desc}</span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 group">
                      <span className="text-base">{isUS ? '🇺🇸' : '🇮🇳'}</span>
                      <span className="font-bold text-white text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-700 tracking-wider">
                        {rec.plateNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => onStartEdit(rec)}
                        className="opacity-70 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Admin Edit: Correct misread plate characters"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {rec.isCorrected && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 cursor-help"
                          title={`Corrected by Admin (Original OCR: ${rec.originalPlate || 'Misread'})`}
                        >
                          EDITED
                        </span>
                      )}
                    </div>
                  )}
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
  );
};
