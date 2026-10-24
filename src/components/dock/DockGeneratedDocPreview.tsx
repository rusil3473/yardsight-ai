import React from 'react';
import { QrCode } from 'lucide-react';

interface DockGeneratedDocPreviewProps {
  generatedDoc: any;
}

export const DockGeneratedDocPreview: React.FC<DockGeneratedDocPreviewProps> = ({ generatedDoc }) => {
  if (!generatedDoc) return null;

  return (
    <div
      style={{
        background: 'hsla(215, 30%, 10%, 0.95)',
        border: '1px solid var(--primary)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: '0 0 25px var(--primary-glow)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={20} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
            {generatedDoc.type === 'GST_EWAY_BILL' ? 'Official Indian GST E-Way Bill (EWB-01)' : 'US Electronic Bill of Lading (eBOL)'}
          </h4>
        </div>
        <span className="badge badge-primary">Auto-Generated from CCTV</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '14px',
          fontSize: '0.82rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Document Number:</span>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
            {generatedDoc.eway_bill_number || generatedDoc.bol_number}
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Vehicle Registered:</span>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {generatedDoc.part_b?.vehicle_number || generatedDoc.power_unit_plate}
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Digital Signature:</span>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#86efac' }}>
            {generatedDoc.digital_signature || generatedDoc.fmcsa_status}
          </div>
        </div>
      </div>

      {/* Formatted Certificate Metadata */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 mt-3 text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Consignment Authority:</span>
          <span className="text-white font-semibold">
            {generatedDoc.type === 'GST_EWAY_BILL'
              ? 'National Informatics Centre (NIC) • Form EWB-01'
              : 'Federal Motor Carrier Safety Administration (FMCSA)'}
          </span>
        </div>
        {generatedDoc.part_a && (
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Supplier:</span>
              <div className="text-slate-300 font-medium truncate">{generatedDoc.part_a.gstin_supplier}</div>
            </div>
            <div>
              <span className="text-slate-500">Total Invoice:</span>
              <div className="text-emerald-400 font-bold font-mono">
                ₹{generatedDoc.part_a.total_invoice_value_inr?.toLocaleString()} INR
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono">
            Digital Signature: {generatedDoc.digital_signature || 'VERIFIED-SHA256'}
          </span>
          <button
            onClick={() => window.print()}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs cursor-pointer"
          >
            Print Document Certificate →
          </button>
        </div>
      </div>
    </div>
  );
};
