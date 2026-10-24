import React from 'react';
import { Clock, FileText, Send, CheckCircle2, Trash2, Edit } from 'lucide-react';

export interface TruckRecord {
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

interface DockTruckCardProps {
  truck: TruckRecord;
  isDispatched: boolean;
  marketMode: string;
  onGenerateDocument: (truckId: string, docType: string) => void;
  onDispatch: (truckId: string) => void;
  onUpdateStatus?: (truckId: string, status: string, dockNumber?: string) => void;
  onDeleteTruck?: (truckId: string) => void;
  onEditTruck?: (truck: any) => void;
}

export const DockTruckCard: React.FC<DockTruckCardProps> = ({
  truck: t,
  isDispatched,
  marketMode,
  onGenerateDocument,
  onDispatch,
  onUpdateStatus,
  onDeleteTruck,
  onEditTruck
}) => {
  return (
    <div
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {t.truck_id}
          </span>
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
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: t.is_detention ? 'var(--danger)' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
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
          onClick={() => onDispatch(t.truck_id)}
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
};
