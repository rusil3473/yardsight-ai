import { useState } from 'react';
import { Truck, Clock, FileText, Send, CheckCircle2, QrCode } from 'lucide-react';

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
  generatedDoc: any;
  marketMode: string;
}

export const DockTurnaroundTracker: React.FC<DockTrackerProps> = ({
  trucks,
  onGenerateDocument,
  onSendDispatch,
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-critical">
            {trucks.filter((t) => t.is_detention).length} Detention Risk
          </span>
          <span className="badge badge-primary">
            {trucks.length} Trucks in Yard
          </span>
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
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{t.assigned_bay}</span>
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
                  <span>{t.hours_formatted}</span>
                </div>
                {t.is_detention ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
                    ⚠️ Detention Accrued: +${t.accrued_detention_fee_usd} USD
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
                  {t.cargo_items}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Ref: {t.manifest_bol}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => onGenerateDocument(t.truck_id, marketMode === 'India' ? 'GST_EWAY_BILL' : 'US_EBOL')}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <FileText size={14} />
                  <span>{marketMode === 'India' ? 'Generate GST E-Way Bill' : 'Generate US eBOL'}</span>
                </button>

                <button
                  onClick={() => handleDispatch(t.truck_id)}
                  disabled={isDispatched}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 12px',
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

          <div className="telemetry-code">
            {JSON.stringify(generatedDoc, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};
