import React, { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import { DockTruckCard, type TruckRecord } from './dock/DockTruckCard';
import { DockGeneratedDocPreview } from './dock/DockGeneratedDocPreview';

export type { TruckRecord };

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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dock Turnaround &amp; Detention Prevention Tracker</h3>
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
        {trucks.map((t) => (
          <DockTruckCard
            key={t.truck_id}
            truck={t}
            isDispatched={!!dispatchedTrucks[t.truck_id]}
            marketMode={marketMode}
            onGenerateDocument={onGenerateDocument}
            onDispatch={handleDispatch}
            onUpdateStatus={onUpdateStatus}
            onDeleteTruck={onDeleteTruck}
            onEditTruck={onEditTruck}
          />
        ))}
      </div>

      {/* Generated Document Preview Card if active */}
      <DockGeneratedDocPreview generatedDoc={generatedDoc} />
    </div>
  );
};
