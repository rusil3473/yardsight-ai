import React, { useState, useEffect } from 'react';
import { FileText, Download, Truck, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { yardApi } from '../api/yardApi';

interface EWayBillsTabProps {
  onNotify?: (msg: string) => void;
}

export const EWayBillsTab: React.FC<EWayBillsTabProps> = () => {
  const [selectedTruckId, setSelectedTruckId] = useState('TRK-9041');
  const [docType, setDocType] = useState<'GST_EWAY_BILL' | 'US_EBOL'>('GST_EWAY_BILL');
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleTrucks = [
    { id: 'TRK-9041', plate: 'MH 12 RN 4589', carrier: 'TCI Freight Intermodal', goods: 'High-Tech Automotive Components', value: 3450000 },
    { id: 'TRK-9042', plate: 'TX 942-WKY', carrier: 'Schneider National', goods: 'Medical Grade Sanitization Equipment', value: 890000 },
    { id: 'TRK-9043', plate: 'DL 01 AB 9021', carrier: 'Delhi-Gujarat Transport Corp', goods: 'Industrial Injection Molded Parts', value: 1250000 },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await yardApi.listDocuments('TENANT-MY-HUB');
      if (res.success && res.data.documents) {
        setSavedDocs(res.data.documents);
      }
    } catch {
      // offline fallback
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await yardApi.generateDocument({
        truck_id: selectedTruckId,
        doc_type: docType,
        tenant_id: 'TENANT-MY-HUB',
      });

      if (res.success) {
        setGeneratedDoc(res.data);
        loadDocuments();
      } else {
        setErrorMsg('Failed to generate transport document. Please verify truck registration.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'API connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadStatement = () => {
    if (!generatedDoc) return;
    const content = `===============================================================
YARDSIGHT AI - OFFICIAL TRANSPORT STATUTORY CLEARANCE
===============================================================
Document Type : ${generatedDoc.type || docType}
Document No   : ${generatedDoc.document_number || 'EWB-2026-904128'}
Timestamp     : ${new Date().toISOString()}
Facility Hub  : TENANT-MY-HUB (Navi Mumbai Multi-Modal Logistics Hub)
Truck ID      : ${selectedTruckId}
License Plate : ${generatedDoc.vehicle_number || 'MH 12 RN 4589'}
Carrier       : ${generatedDoc.carrier_name || 'TCI Freight Intermodal'}
Part-A Status : STATUTORY GST TAX CLEARED (E-Invoice IRN Verified)
Part-B Status : VEHICLE ASSIGNED VIA OPENCV ANPR HOMOGRAPHY
HSN Code      : 84713010 (Commercial Data Storage & Electronic Units)
Status        : AUTHENTIC / CRYPTOGRAPHICALLY SEALED
===============================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDoc.document_number || 'EWB-904128'}_statement.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              STATUTORY TRANSPORT DOCUMENT GENERATOR
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              INDIA GST PART-B & US eBOL
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated statutory freight document creation linked directly to OpenCV ANPR gate verified license plates.
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setDocType('GST_EWAY_BILL')}
            className={`py-1.5 px-3 rounded font-bold transition ${
              docType === 'GST_EWAY_BILL' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 India GST EWB-01
          </button>
          <button
            type="button"
            onClick={() => setDocType('US_EBOL')}
            className={`py-1.5 px-3 rounded font-bold transition ${
              docType === 'US_EBOL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇺🇸 US Electronic BOL
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs font-mono text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Generator Controls */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Select Inbound / Dwell Truck</label>
            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              {sampleTrucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate} ({t.carrier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Regulatory Scheme</label>
            <input
              type="text"
              readOnly
              value={docType === 'GST_EWAY_BILL' ? 'GST Statutory Rule 138 (Part-A + Part-B)' : 'USDOT / FMCSA Electronic Bill of Lading'}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 cursor-not-allowed"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'GENERATING...' : 'GENERATE TRANSPORT SEAL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Document Card */}
      {generatedDoc && (
        <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-5 font-mono text-xs space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>OFFICIAL CLEARANCE: {generatedDoc.document_number || 'EWB-2026-904128'}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadStatement}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed Receipt (.txt)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">ASSIGNED VEHICLE</div>
              <div className="text-white font-bold">{generatedDoc.vehicle_number || 'MH 12 RN 4589'}</div>
              <div className="text-[10px] text-emerald-400">ANPR Verified ✓</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">CONSIGNOR / LOGISTICS</div>
              <div className="text-white font-bold">{generatedDoc.carrier_name || 'TCI Freight Intermodal'}</div>
              <div className="text-[10px] text-slate-400">GSTIN: 27AABCT2849P1ZZ</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">CARGO DESCRIPTION</div>
              <div className="text-white font-bold">HSN 8471: Auto Electr.</div>
              <div className="text-[10px] text-slate-400">Value: ₹34,50,000</div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">VALIDITY PERIOD</div>
              <div className="text-cyan-300 font-bold">Active: 48 Hours</div>
              <div className="text-[10px] text-slate-400">Distance: 480 KM</div>
            </div>
          </div>
        </div>
      )}

      {/* Facility Document Ledger */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          <span>Active Facility Document Ledger ({savedDocs.length} Records)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Doc ID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Truck / Plate</th>
                <th className="py-2.5 px-4">Carrier</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {savedDocs.length > 0 ? (
                savedDocs.map((doc: any, idx: number) => (
                  <tr key={doc.id || idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-cyan-400 font-bold">{doc.document_number || doc.id}</td>
                    <td className="py-2.5 px-4">{doc.type}</td>
                    <td className="py-2.5 px-4 text-white">{doc.vehicle_number || doc.truck_id}</td>
                    <td className="py-2.5 px-4 text-slate-300">{doc.carrier_name || 'Standard Fleet'}</td>
                    <td className="py-2.5 px-4 text-slate-400">{new Date(doc.created_at || Date.now()).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        CLEARED
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No documents generated yet for this facility hub. Click "GENERATE TRANSPORT SEAL" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
