import React, { useState, useEffect } from 'react';
import {
  Cloud, ShieldCheck, AlertCircle, X, RefreshCw, Key, CheckCircle2,
  ExternalLink, Lock, QrCode, FileText, Ban
} from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

interface DahuaCloudConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  nvrSerial?: string;
  tenantId?: string;
}

export const DahuaCloudConnectModal: React.FC<DahuaCloudConnectModalProps> = ({
  isOpen,
  onClose,
  nvrSerial = 'BE124E0PCA95532',
  tenantId = 'TENANT-MY-HUB',
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [entitlementInfo, setEntitlementInfo] = useState<any>(null);
  const [activeGrant, setActiveGrant] = useState<any>(null);
  const [pairingUrl, setPairingUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/cloud-share/status?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setEntitlementInfo(data.entitlement_info);
        if (data.has_grant) {
          setActiveGrant(data.grant);
        }
      }
    } catch {
      // Network drop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen, tenantId]);

  const handleInitiateConnect = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_BASE_URL}/api/cloud-share/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nvr_serial: nvrSerial,
          channel_count: 32,
          tenant_id: tenantId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        setActiveGrant(data.grant);
        setPairingUrl(data.pairing_url);
        setEntitlementInfo(data.entitlement_info);
      } else {
        setErrorMsg(data.message || 'Failed to initiate authorization session');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error initiating authorization');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!activeGrant?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/cloud-share/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_id: activeGrant.id,
          reason: 'CUSTOMER_REVOKED',
          tenant_id: tenantId,
        }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEntitlementPending = entitlementInfo?.status === 'ENTITLEMENT_PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dahua DMSS Cloud Share & Delegation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Official DoLynk Open API read-only delegation — Zero credential sharing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Customer Ownership Guarantee Alert */}
          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <span>Customer Ownership & Zero-Password Guarantee</span>
            </div>
            <p className="leading-relaxed">
              You retain <strong>100% device ownership</strong> of your Dahua NVR ({nvrSerial}). YardSight AI
              never asks for or stores your DMSS username or password. Access is granted via official Dahua cloud
              sharing and can be revoked at any second directly within your DMSS mobile app.
            </p>
          </div>

          {/* 2. Phase 0 Entitlement Gate Status */}
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Dahua DoLynk Entitlement Status: {isEntitlementPending ? 'APPROVAL PENDING' : 'AUTHORIZED'}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {entitlementInfo?.message || 'Awaiting formal commercial 32-stream approval from Dahua India.'}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                Cloud Quota: 0 / 4 Streams
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                Edge Connector: 32 Channels Active (Local LAN)
              </span>
            </div>
          </div>

          {/* 3. Granted Scopes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              Delegation Permission Scopes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">Live View (Read-Only)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Device Config (Blocked)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>NVR HDD History (Blocked)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>PTZ Control (Blocked)</span>
              </div>
            </div>
          </div>

          {/* 4. Pairing & Delegation URL */}
          {pairingUrl && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> Official DMSS Delegation Link
              </span>
              <p className="text-slate-400 text-[11px]">
                Scan with DMSS mobile app or open the official DoLynk authorization session:
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300 break-all select-all">
                {pairingUrl}
              </div>
            </div>
          )}

          {/* 5. DPDP Statutory Compliance Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <FileText className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              <strong>India DPDP Act (2023) Notice:</strong> In-memory video frames are processed strictly for facility
              logistics, vehicle ANPR, and spill safety. Every stream access and token refresh is permanently recorded
              in your tenant audit log.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            {activeGrant?.authorization_state === 'AUTHORIZED' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Cloud Share Active
              </span>
            ) : (
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
                State: {activeGrant?.authorization_state || 'Not Connected'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {activeGrant && activeGrant.authorization_state !== 'REVOKED' && (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Revoke Access</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleInitiateConnect}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
              <span>{activeGrant ? 'Re-authorize / Refresh' : 'Connect Dahua Cloud'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
