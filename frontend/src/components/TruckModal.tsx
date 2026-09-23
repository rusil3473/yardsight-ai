import React, { useState, useEffect } from 'react';
import { Truck, X, Check, Save } from 'lucide-react';

export interface TruckFormData {
  id?: string;
  plate_number: string;
  carrier_name: string;
  driver_name: string;
  driver_phone: string;
  dock_number: string;
  cargo_desc: string;
  status: string;
  country: string;
  free_time_minutes: number;
}

interface TruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TruckFormData) => Promise<{ success: boolean; message?: string }>;
  initialTruck?: any | null;
  marketMode?: 'IN_GST' | 'US_FREIGHT';
}

export const TruckModal: React.FC<TruckModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTruck,
  marketMode = 'IN_GST'
}) => {
  const isUS = marketMode === 'US_FREIGHT';
  const isEditing = Boolean(initialTruck?.id || initialTruck?.truck_id);

  const [formData, setFormData] = useState<TruckFormData>({
    plate_number: '',
    carrier_name: '',
    driver_name: '',
    driver_phone: '',
    dock_number: 'Dock 01',
    cargo_desc: '',
    status: 'INBOUND',
    country: isUS ? 'US' : 'IN',
    free_time_minutes: 120
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTruck) {
      setFormData({
        id: initialTruck.id || initialTruck.truck_id,
        plate_number: initialTruck.plate_number || '',
        carrier_name: initialTruck.carrier_name || '',
        driver_name: initialTruck.driver_name || '',
        driver_phone: initialTruck.driver_phone || '',
        dock_number: initialTruck.dock_number || initialTruck.assigned_bay || 'Dock 01',
        cargo_desc: initialTruck.cargo_desc || initialTruck.cargo_items || '',
        status: initialTruck.status || 'INBOUND',
        country: initialTruck.country || (isUS ? 'US' : 'IN'),
        free_time_minutes: initialTruck.free_time_minutes || 120
      });
    } else {
      setFormData({
        plate_number: isUS ? 'TX-55-A912' : 'KA-04-MM-8844',
        carrier_name: isUS ? 'Swift Transportation' : 'Tata Logistics Express',
        driver_name: isUS ? 'Johnathan Davis' : 'Harish Verma',
        driver_phone: isUS ? '+1-512-555-0199' : '+91-98765-11223',
        dock_number: 'Dock 01',
        cargo_desc: isUS ? '24 Pallets (Automotive Spares)' : '24 Pallets (Commercial FMCG / Spares)',
        status: 'INBOUND',
        country: isUS ? 'US' : 'IN',
        free_time_minutes: 120
      });
    }
    setErrorMsg(null);
  }, [initialTruck, isUS, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate_number.trim()) {
      setErrorMsg('License Plate number is required');
      return;
    }
    if (!formData.carrier_name.trim()) {
      setErrorMsg('Carrier name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await onSubmit(formData);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Operation failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {isEditing ? `Update Freight Truck: ${formData.plate_number}` : 'Check-In New Inbound Truck'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditing ? 'Modify dock assignment, status, and driver telemetry' : 'Register vehicle into SQLite yard digital twin & trigger ANPR unwarp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Plate Number & Country */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Vehicle License Plate</label>
              <input
                type="text"
                value={formData.plate_number}
                onChange={(e) => setFormData({ ...formData, plate_number: e.target.value.toUpperCase() })}
                required
                placeholder="e.g. MH-12-RN-4819"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jurisdiction</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-cyan-500 focus:outline-none"
              >
                <option value="IN">IN (India GST)</option>
                <option value="US">US (North America)</option>
              </select>
            </div>
          </div>

          {/* Carrier Partner */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Transport Carrier Agency</label>
            <input
              type="text"
              value={formData.carrier_name}
              onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
              required
              placeholder="e.g. Tata Logistics, BlueDart, Swift, Schneider"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Driver Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Driver Full Name</label>
              <input
                type="text"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                required
                placeholder="e.g. Harish Verma"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Driver Phone (WhatsApp)</label>
              <input
                type="text"
                value={formData.driver_phone}
                onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                required
                placeholder="+91-98765-00000"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dock Assignment & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Assigned Dock Bay</label>
              <select
                value={formData.dock_number}
                onChange={(e) => setFormData({ ...formData, dock_number: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="Dock 01">Dock 01 (Primary Inbound)</option>
                <option value="Dock 02">Dock 02 (Cross-Dock)</option>
                <option value="Dock 03">Dock 03 (Loading Bay)</option>
                <option value="Dock 04">Dock 04 (Heavy Freight)</option>
                <option value="Dock 05">Dock 05 (High Priority)</option>
                <option value="Dock 06">Dock 06 (Available)</option>
                <option value="Dock 07">Dock 07 (Express Transit)</option>
                <option value="Dock 08">Dock 08 (Cold Chain)</option>
                <option value="Bay 01">Bay 01</option>
                <option value="Bay 02">Bay 02</option>
                <option value="Bay 03">Bay 03</option>
                <option value="Bay 04">Bay 04</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Yard Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="INBOUND">INBOUND (Gate Queued)</option>
                <option value="AT_DOCK">AT_DOCK (Unloading)</option>
                <option value="DETENTION">DETENTION (Overdue SLA)</option>
                <option value="CLEARED">CLEARED (Departed Yard)</option>
              </select>
            </div>
          </div>

          {/* Cargo Description */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Manifest Cargo Description</label>
            <input
              type="text"
              value={formData.cargo_desc}
              onChange={(e) => setFormData({ ...formData, cargo_desc: e.target.value })}
              placeholder="e.g. 24 Pallets Commercial Electronics & FMCG"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving to SQLite...</span>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Truck</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Register & Check-In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
