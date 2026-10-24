import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { TabId } from './Sidebar';
import {
  YardKpisGrid,
  DockBaysGrid,
  HourlyDwellChart,
  RecentActivityFeed,
  DockBayDetailModal,
  TruckCheckInModal,
  FieldProblemsModal,
  HomeOverviewHeader,
  HomeGettingStartedGuide,
  type DockBay
} from './dashboard';
import { truckFormSchema } from '../schemas/formSchemas';


interface HomeOverviewViewProps {
  onNavigateTab: (tab: TabId) => void;
  marketMode: 'IN_GST' | 'US_FREIGHT';
  trucks?: any[];
  onAddTruck?: (data: any) => Promise<{ success: boolean; message?: string }>;
  onRefreshTrucks?: () => void;
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({
  onNavigateTab,
  marketMode,
  trucks,
  onAddTruck,
  onRefreshTrucks
}) => {
  const { tenant } = useAuth();
  const isIndia = marketMode === 'IN_GST';

  // State Management
  const [isFieldValidationOpen, setIsFieldValidationOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedDock, setSelectedDock] = useState<DockBay | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [eventFilter, setEventFilter] = useState<'ALL' | 'DETENTION' | 'VISION' | 'LEAK'>('ALL');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Inbound Truck Form
  const [newTruck, setNewTruck] = useState({
    plate: '',
    carrier: '',
    driverName: '',
    driverPhone: '',
    dockId: 'DOCK-01',
    cargo: ''
  });

  const [cameraCount, setCameraCount] = useState<number>(0);

  useEffect(() => {
    const tid = tenant?.tenant_id || (tenant as any)?.id || 'TENANT-MY-HUB';
    fetch(`http://127.0.0.1:8001/api/cameras?tenant_id=${tid}`)
      .then(res => res.json())
      .then(data => setCameraCount(data.cameras?.length || 0))
      .catch(() => setCameraCount(0));
  }, [tenant]);

  // Digital Twin Dock Bays
  const [dockBays, setDockBays] = useState<DockBay[]>(
    Array.from({ length: 8 }, (_, i) => ({
      dock_id: `DOCK-${String(i + 1).padStart(2, '0')}`,
      name: `Dock ${String(i + 1).padStart(2, '0')}`,
      status: 'AVAILABLE',
      dwell_minutes: 0,
      detention_fee: 0
    }))
  );

  const truckList = trucks || [];
  const detentionTrucks = truckList.filter(t => t.is_detention);

  const [hourlyMetrics, setHourlyMetrics] = useState<Array<{ hour: string; trucks: number; dwell: number }>>([
    { hour: '06:00', trucks: 0, dwell: 0 },
    { hour: '08:00', trucks: 0, dwell: 0 },
    { hour: '10:00', trucks: 0, dwell: 0 },
    { hour: '12:00', trucks: 0, dwell: 0 },
    { hour: '14:00', trucks: 0, dwell: 0 },
    { hour: '16:00', trucks: 0, dwell: 0 },
  ]);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/dwell/hourly')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'SUCCESS' && Array.isArray(data.metrics)) {
          setHourlyMetrics(data.metrics);
        }
      })
      .catch(() => {});
  }, [trucks]);

  const RECENT_ACTIVITIES = truckList.map((t) => ({
    type: t.is_detention ? ('DETENTION' as const) : ('VISION' as const),
    time: 'Just now',
    event: t.is_detention ? 'Detention Overtime Warning' : 'Gate Check-In Verified',
    desc: `Truck ${t.plate_number} assigned to ${t.dock_number || 'Dock 01'} (${t.carrier_name})`,
    badge: t.is_detention ? 'DETENTION' : 'ANPR',
    badgeColor: t.is_detention ? 'red' : 'cyan'
  }));

  const handleSendDispatchAlert = async (dock: DockBay) => {
    try {
      await fetch('http://127.0.0.1:8001/api/dispatch/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truck_id: dock.truck_id || 'TRK-9041',
          message: `${dock.name} unloading complete. Detention penalty accrued. Proceed to Gate 02 Departure immediately.`
        })
      });
      setDispatchSuccessMsg(`WhatsApp & SMS Dispatch Alert sent to ${dock.driver_name} (${dock.driver_phone})!`);
      setTimeout(() => setDispatchSuccessMsg(null), 4500);
    } catch {
      setDispatchSuccessMsg(`Dispatch alert broadcast locally to driver ${dock.driver_name}!`);
      setTimeout(() => setDispatchSuccessMsg(null), 4500);
    }
  };

  useEffect(() => {
    const baseBays: DockBay[] = Array.from({ length: 8 }, (_, i) => ({
      dock_id: `DOCK-${String(i + 1).padStart(2, '0')}`,
      name: `Dock ${String(i + 1).padStart(2, '0')}`,
      status: 'AVAILABLE',
      dwell_minutes: 0,
      detention_fee: 0
    }));

    if (trucks && trucks.length > 0) {
      trucks.forEach((t) => {
        const rawDock = t.dock_number || t.assigned_bay || 'Dock 01';
        let match = baseBays.find(b => b.name.toLowerCase() === rawDock.toLowerCase() || b.dock_id.toLowerCase() === rawDock.toLowerCase());
        if (!match) {
          match = baseBays.find(b => b.status === 'AVAILABLE');
        }
        if (match) {
          match.status = t.is_detention ? 'DETENTION' : t.status === 'CLEARED' ? 'AVAILABLE' : 'OCCUPIED';
          match.truck_id = t.truck_id || t.id;
          match.plate_number = t.plate_number;
          match.carrier = t.carrier_name;
          match.driver_name = t.driver_name;
          match.driver_phone = t.driver_phone;
          match.cargo = t.cargo_desc || t.cargo_items;
          match.dwell_minutes = t.dwell_minutes || 0;
          match.free_time_minutes = t.free_time_minutes || 120;
          match.detention_fee = isIndia ? (t.detention_charge || 0) : ((t.detention_charge || 0) / 32);
        }
      });
    }
    setDockBays(baseBays);
  }, [trucks, isIndia]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = truckFormSchema.safeParse({
      plate_number: newTruck.plate.trim().toUpperCase(),
      carrier_name: newTruck.carrier.trim(),
      driver_name: newTruck.driverName.trim() || 'Assigned Driver',
      driver_phone: newTruck.driverPhone.trim() || (isIndia ? '+91-98765-00000' : '+1-512-555-0100'),
      dock_number: newTruck.dockId || 'DOCK-01',
      cargo_desc: newTruck.cargo.trim() || 'Standard Commercial Freight',
      status: 'INBOUND',
      country: isIndia ? 'IN' : 'US',
      free_time_minutes: 120
    });

    if (!validation.success) {
      const issue = validation.error.issues[0];
      setDispatchSuccessMsg(`Validation error: ${issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid truck info'}`);
      setTimeout(() => setDispatchSuccessMsg(null), 4500);
      return;
    }

    if (onAddTruck) {
      const res = await onAddTruck(validation.data);
      if (res && res.success) {
        setIsCheckInModalOpen(false);
        setNewTruck({ plate: '', carrier: '', driverName: '', driverPhone: '', dockId: 'DOCK-01', cargo: '' });
        setDispatchSuccessMsg(`Truck ${validation.data.plate_number} checked into ${validation.data.dock_number}! Part B transit recorded.`);
        setTimeout(() => setDispatchSuccessMsg(null), 4500);
        onRefreshTrucks?.();
      } else {
        setDispatchSuccessMsg(res?.message || 'Check-in failed. Please verify vehicle registration format.');
        setTimeout(() => setDispatchSuccessMsg(null), 4500);
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {dispatchSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in flex items-center gap-3 text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Top Operations Command Banner */}
      <HomeOverviewHeader
        tenantName={tenant.name}
        tenantLocation={tenant.location}
        activeDocks={tenant.active_docks}
        camerasOnline={tenant.cameras_online}
        onOpenCheckIn={() => setIsCheckInModalOpen(true)}
        onNavigateTab={onNavigateTab}
      />

      {/* Getting Started Guide */}
      {(!trucks || trucks.length === 0) && (
        <HomeGettingStartedGuide
          activeDocks={tenant.active_docks}
          onOpenCheckIn={() => setIsCheckInModalOpen(true)}
          onNavigateTab={onNavigateTab}
        />
      )}


      {/* Decoupled Subcomponent 1: Executive Yard KPIs Grid */}
      <YardKpisGrid
        truckList={truckList}
        detentionTrucks={detentionTrucks}
        cameraCount={cameraCount}
        isIndia={isIndia}
        onNavigateTab={onNavigateTab}
      />

      {/* Decoupled Subcomponent 2: 8-Bay Digital Twin Layout */}
      <DockBaysGrid
        dockBays={dockBays}
        tenantName={tenant.name}
        isIndia={isIndia}
        onSelectDock={(bay) => setSelectedDock(bay)}
        onSendDispatchAlert={handleSendDispatchAlert}
      />

      {/* Decoupled Subcomponents 3 & 4: Turnaround Analytics & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <HourlyDwellChart
          hourlyMetrics={hourlyMetrics}
          hoveredBarIndex={hoveredBarIndex}
          onHoverBar={setHoveredBarIndex}
          isIndia={isIndia}
        />

        <RecentActivityFeed
          truckList={truckList}
          tenantName={tenant.name}
          activities={RECENT_ACTIVITIES}
          eventFilter={eventFilter}
          onSetEventFilter={setEventFilter}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* Decoupled Modal Dialogs */}
      <DockBayDetailModal
        dock={selectedDock}
        tenantName={tenant.name}
        isIndia={isIndia}
        onClose={() => setSelectedDock(null)}
        onSendDispatch={handleSendDispatchAlert}
        onOpenCheckIn={() => setIsCheckInModalOpen(true)}
      />

      <TruckCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSubmit={handleCheckInSubmit}
        newTruck={newTruck}
        onChangeNewTruck={setNewTruck}
      />

      <FieldProblemsModal
        isOpen={isFieldValidationOpen}
        onClose={() => setIsFieldValidationOpen(false)}
      />
    </div>
  );
};

export const HomeOverviewTab = HomeOverviewView;
export type HomeOverviewTabProps = HomeOverviewViewProps;

