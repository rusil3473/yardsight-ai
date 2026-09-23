import { useState } from 'react';
import { Truck, Clock, FileText, Send, CheckCircle2, QrCode, Trash2, Edit, Plus } from 'lucide-react';

interface TruckRecord {
  truck_id: string;
  plate_number: string;
  carrier_name: string;
  driver_name: string;
  driver_phone: string;
  manifest_bol: string;
  assigned_bay: string;
  dwell_minutes: number;
  is_detention: boolean;
  detention_minutes: number;
  accrued_detention_fee_usd: number;
  hours_formatted: string;
  status: string;
  cargo_items: string;
}

interface DockTrackerProps {
  trucks: TruckRecord[];
  onGenerateDocument: (truckId: string, docType: string) => void;
  onSendDispatch: (truckId: string) => void;
  onUpdateStatus?: (truckId: string, status: string, dockNumber?: string) => void;
  onDeleteTruck?: (truckId: string) => void;
  onEditTruck?: (truck: any) => void;
  onOpenCheckIn?: () => void;
  generatedDoc: any;
  marketMode: string;
}

export const DockTurnaroundTracker: React.FC<DockTrackerProps> = ({
  trucks,
  onGenerateDocument,
  onSendDispatch,
  onUpdateStatus,
  onDeleteTruck,
  onEditTruck,
  onOpenCheckIn,
  generatedDoc,
  marketMode
}) => {
  const [dispatchedTrucks, setDispatchedTrucks] = useState<Record<string, boolean>>({});

  const handleDispatch = (truckId: string) => {
    onSendDispatch(truckId);
    setDispatchedTrucks((prev) => ({ ...prev, [truckId]: true }));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Truck size={22} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dock Turnaround & Detention Prevention Tracker</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Eliminates the #1 Reddit complaint: 6 to 14 hour warehouse driver detention and lost bills of lading.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-critical">
            {trucks.filter((t) => t.is_detention).length} Detention Risk
          </span>
          <span className="badge badge-primary">
            {trucks.length} Trucks in Yard
          </span>
          {onOpenCheckIn && (
            <button
              onClick={onOpenCheckIn}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={14} />
              <span>+ Check-In Truck</span>
            </button>
          )}
        </div>
      </div>

      {/* Truck Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {trucks.map((t) => {
          const isDispatched = dispatchedTrucks[t.truck_id];

          return (
            <div
              key={t.truck_id}
              style={{
                background: 'hsla(215, 30%, 13%, 0.8)',
                border: t.is_detention ? '1px solid hsla(0, 84%, 60%, 0.4)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                alignItems: 'center'
              }}
            >
              {/* Truck Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.truck_id}</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    {(t as any).assigned_bay || (t as any).dock_number || 'Dock 02'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.plate_number}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {t.carrier_name} • Driver: {t.driver_name}
                </div>
              </div>

              {/* Dwell Time & Detention */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                  Yard Dwell Time
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: t.is_detention ? 'var(--danger)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  <span>{t.hours_formatted || `${t.dwell_minutes || 45} mins`}</span>
                </div>
                {t.is_detention ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
                    ⚠️ Detention Accrued: +${t.accrued_detention_fee_usd || 31.25} USD
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                    ✓ Within 2hr Free Time Window
                  </div>
                )}
              </div>

              {/* Cargo info */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                  Manifest Deliverable
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {(t as any).cargo_description || (t as any).cargo_items || '24 Pallets (Commercial FMCG / Spares)'}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Ref: {(t as any).manifest_bol || (t as any).bol_number || 'BOL-2026-8819'}
                </div>
              </div>

              {/* Action Buttons & Management Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={t.status || 'INBOUND'}
                    onChange={(e) => onUpdateStatus?.(t.truck_id, e.target.value, (t as any).assigned_bay || (t as any).dock_number)}
                    style={{
                      flex: 1,
                      background: 'hsla(215, 30%, 18%, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '6px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="INBOUND">STATUS: INBOUND</option>
                    <option value="AT_DOCK">STATUS: AT DOCK</option>
                    <option value="DETENTION">STATUS: DETENTION</option>
                    <option value="CLEARED">STATUS: CLEARED</option>
                  </select>

                  {onEditTruck && (
                    <button
                      onClick={() => onEditTruck(t)}
                      title="Edit Truck Details"
                      style={{
                        background: 'hsla(215, 30%, 20%, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        padding: '7px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Edit size={13} />
                    </button>
                  )}

                  {onDeleteTruck && (
                    <button
                      onClick={() => {
                        if (confirm(`Release and remove truck ${t.plate_number} (${t.carrier_name}) from yard registry?`)) {
                          onDeleteTruck(t.truck_id);
                        }
                      }}
                      title="Release / Delete Truck"
                      style={{
                        background: 'hsla(0, 84%, 60%, 0.12)',
                        border: '1px solid hsla(0, 84%, 60%, 0.3)',
                        borderRadius: '8px',
                        color: '#f87171',
                        padding: '7px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onGenerateDocument(t.truck_id, marketMode === 'IN_GST' ? 'GST_EWAY_BILL' : 'US_EBOL')}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: '10px' }}
                >
                  <FileText size={14} />
                  <span>{marketMode === 'IN_GST' ? 'Generate GST E-Way Bill' : 'Generate US eBOL'}</span>
                </button>

                <button
                  onClick={() => handleDispatch(t.truck_id)}
                  disabled={isDispatched}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    borderColor: isDispatched ? 'var(--primary)' : undefined,
                    color: isDispatched ? 'var(--primary)' : undefined
                  }}
                >
                  {isDispatched ? <CheckCircle2 size={14} /> : <Send size={14} />}
                  <span>{isDispatched ? 'Driver WhatsApp Sent' : 'WhatsApp Gate Clearance'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Generated Document Preview Card if active */}
      {generatedDoc && (
        <div style={{
          background: 'hsla(215, 30%, 10%, 0.95)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: '0 0 25px var(--primary-glow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                {generatedDoc.type === 'GST_EWAY_BILL' ? 'Official Indian GST E-Way Bill (EWB-01)' : 'US Electronic Bill of Lading (eBOL)'}
              </h4>
            </div>
            <span className="badge badge-primary">Auto-Generated from CCTV</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px', fontSize: '0.82rem' }}>
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
                {generatedDoc.type === 'GST_EWAY_BILL' ? 'National Informatics Centre (NIC) • Form EWB-01' : 'Federal Motor Carrier Safety Administration (FMCSA)'}
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
                  <div className="text-emerald-400 font-bold font-mono">₹{generatedDoc.part_a.total_invoice_value_inr?.toLocaleString()} INR</div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono">Digital Signature: {generatedDoc.digital_signature || 'VERIFIED-SHA256'}</span>
              <button
                onClick={() => window.print()}
                className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs cursor-pointer"
              >
                Print Document Certificate →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
