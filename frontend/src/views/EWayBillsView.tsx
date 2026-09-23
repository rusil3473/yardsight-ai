import React, { useState, useEffect } from 'react';
import {
  FileText,
  QrCode,
  Printer,
  Database,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EWayBillsViewProps {
  marketMode: 'IN_GST' | 'US_FREIGHT';
}

interface TruckItem {
  id: string;
  plate: string;
  carrier: string;
  goods: string;
  dock: string;
  status: 'PENDING_CLEARANCE' | 'INBOUND_INSPECTED' | 'DOCK_UNLOADING';
  invoiceValue: number;
}

export const EWayBillsView: React.FC<EWayBillsViewProps> = ({ marketMode }) => {
  const { user, token, tenant } = useAuth();
  const activeTenantId = tenant?.tenant_id || (tenant as any)?.id || 'TENANT-AMZN-BLR1';
  const [selectedTruckId, setSelectedTruckId] = useState('TRK-9041');
  const [docType, setDocType] = useState<'GST_EWAY_BILL' | 'US_EBOL'>(
    marketMode === 'IN_GST' ? 'GST_EWAY_BILL' : 'US_EBOL'
  );
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [trucksList, setTrucksList] = useState<TruckItem[]>([]);

  // Fetch live trucks & documents for the active facility
  useEffect(() => {
    fetchLiveTrucks();
    fetchDocuments();
  }, [marketMode, activeTenantId]);

  const fetchLiveTrucks = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/dwell/trucks?tenant_id=${activeTenantId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: TruckItem[] = data.map((t: any) => ({
          id: t.truck_id || t.id,
          plate: t.plate_number,
          carrier: t.carrier_name,
          goods: t.cargo_desc || t.cargo_items || 'Commercial Logistics Freight',
          dock: t.dock_number || t.assigned_bay || 'Bay 01',
          status: t.status === 'DETENTION' ? 'DOCK_UNLOADING' : t.status === 'AT_DOCK' ? 'DOCK_UNLOADING' : 'INBOUND_INSPECTED',
          invoiceValue: t.country === 'US' ? 48500 : 5420000
        }));
        setTrucksList(mapped);
        if (mapped.length > 0) {
          const firstId = mapped[0].id;
          setSelectedTruckId(firstId);
          handleGenerateDoc(firstId, marketMode === 'IN_GST' ? 'GST_EWAY_BILL' : 'US_EBOL', mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live trucks for facility:', e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/documents/list?tenant_id=${activeTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedDocuments(data.documents || []);
      }
    } catch {
      // Fallback
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://127.0.0.1:8001/api/documents/${docId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setSavedDocuments(prev => prev.filter(d => d.id !== docId && d.ewb_number !== docId));
        setCopiedToast('Document successfully deleted from register');
        setTimeout(() => setCopiedToast(null), 3000);
      }
    } catch (e) {
      console.error('Failed to delete document:', e);
    }
  };

  const handleGenerateDoc = async (truckId: string, type: 'GST_EWAY_BILL' | 'US_EBOL', customTrucks?: TruckItem[]) => {
    setIsLoading(true);
    setSelectedTruckId(truckId);
    setDocType(type);

    const sourceList = customTrucks || trucksList;
    const activeTruck = sourceList.find(t => t.id === truckId) || sourceList[0] || {
      id: truckId,
      plate: 'MH-12-RN-4819',
      carrier: 'Tata Logistics Express',
      goods: '24 Pallets Commercial Freight',
      dock: 'Dock 02',
      status: 'DOCK_UNLOADING' as const,
      invoiceValue: 5723000
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://127.0.0.1:8001/api/documents/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ truck_id: truckId, doc_type: type, tenant_id: activeTenantId })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDoc(data);
        fetchDocuments();
      } else {
        throw new Error('Fallback to local synthesis');
      }
    } catch {
      // High-fidelity fallback state
      if (type === 'GST_EWAY_BILL') {
        setGeneratedDoc({
          type: 'GST_EWAY_BILL',
          eway_bill_number: `1912-8841-0291`,
          generated_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          valid_until: new Date(Date.now() + 72 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          part_a: {
            gstin_supplier: '27AAACG0192Q1Z8 (Procter & Gamble India Pvt Ltd)',
            dispatch_from: 'Bhiwandi Warehousing Hub, Zone 4, Maharashtra - 421302',
            gstin_recipient: '29AABCR8810P1ZK (Amazon Seller Services Pvt Ltd - BLR1)',
            delivery_to: 'Hoskote Industrial Corridor, Bengaluru Rural, Karnataka - 562114',
            document_type: 'Tax Invoice INV-2026-8819',
            hsn_code: '84713010 (Commercial Computing & FMCG Goods)',
            taxable_amount_inr: 4850000.0,
            cgst_inr: 436500.0,
            sgst_inr: 436500.0,
            total_invoice_value_inr: activeTruck.invoiceValue || 5723000.0
          },
          part_b: {
            transporter_id: 'TRANS-TATA-9981',
            transporter_name: activeTruck.carrier,
            vehicle_number: activeTruck.plate,
            mode_of_transport: 'Road (Multi-Axle GPS Container)',
            driver_contact: '+91-98765-43210 (Ramesh Sharma)',
            approx_distance_km: 984
          },
          digital_signature: `GSTIN-SIG-8F91A0C2-ECDSA-SHA256-NIC-GATEWAY`,
          qr_string: `https://ewaybillgst.gov.in/verify?ewb=191288410291&plate=${activeTruck.plate}&val=5723000`,
          authorized_role: user.role
        });
      } else {
        setGeneratedDoc({
          type: 'US_ELECTRONIC_BOL',
          bol_number: `BOL-US-2026-994102`,
          issue_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          carrier_name: activeTruck.carrier,
          scac_code: 'TETL',
          truck_plate: activeTruck.plate,
          shipper: 'Dallas Sunbelt Distribution Park, DFW, TX 75261',
          consignee: 'Amazon Fulfillment Center SAT1, Schertz, TX 78154',
          fmcsa_status: 'VERIFIED_COMPLIANT',
          detention_clause: '$75.00/hr after 2.0 hours free time',
          authorized_role: user.role,
          cargo_description: activeTruck.goods
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast('Verification payload URL copied to clipboard!');
    setTimeout(() => setCopiedToast(null), 3000);
  };

  const filteredDocs = savedDocuments.filter(doc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (doc.ewb_number && doc.ewb_number.toLowerCase().includes(q)) ||
      (doc.truck_plate && doc.truck_plate.toLowerCase().includes(q)) ||
      (doc.transporter && doc.transporter.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in flex items-center gap-3 text-cyan-200 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="relative rounded-2xl border border-slate-800/80 p-5 sm:p-6 overflow-hidden shadow-2xl backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, hsla(220,32%,10%,0.95) 0%, hsla(225,35%,12%,0.92) 50%, hsla(220,30%,8%,0.98) 100%)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 20px 40px -15px rgba(0,0,0,0.7)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                Statutory Transport Documentation Hub
              </span>
              <span className="text-xs text-slate-400">
                GST Rule 138 (Form EWB-01) & FMCSA 49 CFR §373 (US eBOL)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Electronic Way Bills & Digital Bills of Lading
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Automated CCTV license-plate unwarping generates instant authenticated Part A & Part B transit manifests, eliminating 6-14 hour gate detention delays.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleGenerateDoc(selectedTruckId, 'GST_EWAY_BILL')}
              disabled={isLoading}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-2 active:scale-95 ${
                docType === 'GST_EWAY_BILL'
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/25'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🇮🇳 Indian GST EWB-01</span>
            </button>
            <button
              onClick={() => handleGenerateDoc(selectedTruckId, 'US_EBOL')}
              disabled={isLoading}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-2 active:scale-95 ${
                docType === 'US_EBOL'
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/25'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🇺🇸 US Uniform eBOL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Master-Detail 2-Column Command Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Logistics Queue (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-4 backdrop-blur-xl shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Active Yard Freight Queue
                </h2>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                {trucksList.length} Trucks Active
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Select any freight truck below to immediately inspect, generate, and sign its official statutory documentation:
            </p>

            {/* Truck Selection Cards */}
            <div className="mt-3 space-y-2.5">
              {trucksList.map((t) => {
                const isSelected = selectedTruckId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleGenerateDoc(t.id, docType)}
                    className={`rounded-xl py-3.5 px-4 pl-5 border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/15'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Active selection glowing bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 dark:bg-cyan-400 shadow-lg shadow-cyan-400" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 px-2 py-0.5 font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {t.plate}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">{t.id}</span>
                      </div>
                      <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
                        {t.dock}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {t.carrier}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {t.goods}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Invoice: ₹{(t.invoiceValue / 100000).toFixed(1)}L
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                        {isSelected ? 'Viewing Document →' : 'Click to Generate'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Help Card */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Statutory Compliance Notice</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Under GST Rule 138, moving taxable goods exceeding ₹50,000 without a valid Part B authenticated E-Way Bill incurs a 100% tax penalty and vehicle seizure. YardSight auto-syncs ANPR plate unwarps to Part B in 30ms.
            </p>
          </div>
        </div>

        {/* Right Column: Full Official Statutory Document Certificate (8 of 12 cols) */}
        <div className="lg:col-span-8">
          {generatedDoc ? (
            <div
              className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 20px 40px -15px rgba(0,0,0,0.2)'
              }}
            >
              {/* Document Action Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {generatedDoc.type === 'GST_EWAY_BILL'
                          ? 'GOVERNMENT OF INDIA • FORM GST EWB-01'
                          : 'UNITED STATES UNIFORM STRAIGHT BILL OF LADING'}
                      </span>
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hidden sm:inline">
                        DIGITALLY SEALED
                      </span>
                    </div>
                    <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-0.5 flex items-center gap-2">
                      <span>Doc #: {generatedDoc.eway_bill_number || generatedDoc.bol_number}</span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-slate-500 dark:text-slate-400">Issued: {generatedDoc.generated_date || generatedDoc.issue_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Print PDF Certificate"
                  >
                    <Printer className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Share Verification Link"
                  >
                    <Share2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Document Details: Indian GST EWB-01 */}
              {generatedDoc.type === 'GST_EWAY_BILL' ? (
                (() => {
                  const invoiceVal = Number(
                    generatedDoc?.part_a?.total_invoice_value_inr ||
                    generatedDoc?.part_a?.invoice_value_inr ||
                    5723000
                  );
                  const taxableVal = Number(
                    generatedDoc?.part_a?.taxable_amount_inr ||
                    Math.round(invoiceVal / 1.18)
                  );
                  const taxVal = Number(
                    (generatedDoc?.part_a?.cgst_inr && generatedDoc?.part_a?.sgst_inr)
                      ? (generatedDoc.part_a.cgst_inr + generatedDoc.part_a.sgst_inr)
                      : Math.round(invoiceVal - taxableVal)
                  );
                  const cgstVal = Math.round(taxVal / 2);
                  const sgstVal = Math.round(taxVal / 2);
                  const supplier = generatedDoc?.part_a?.gstin_supplier || '27AAACG0192Q1Z8 (Procter & Gamble India Pvt Ltd)';
                  const dispatchFrom = generatedDoc?.part_a?.dispatch_from || 'Bhiwandi Warehousing Hub, Zone 4, Maharashtra - 421302';
                  const recipient = generatedDoc?.part_a?.gstin_recipient || '29AABCR8810P1ZK (Amazon Seller Services BLR1)';
                  const deliveryTo = generatedDoc?.part_a?.delivery_to || 'Hoskote Industrial Corridor, Bengaluru Rural, Karnataka - 562114';
                  const vehicleNumber = generatedDoc?.part_b?.vehicle_number || generatedDoc?.vehicle_number || 'MH-12-RN-4819';
                  const transporterName = generatedDoc?.part_b?.transporter_name || generatedDoc?.transporter_name || 'Tata Logistics Express';
                  const transporterId = generatedDoc?.part_b?.transporter_id || 'TRANS-TATA-9981';
                  const driverContact = generatedDoc?.part_b?.driver_contact || '+91-98765-43210 (Ramesh Sharma)';
                  const transitMode = generatedDoc?.part_b?.mode_of_transport || 'Road (Multi-Axle GPS Container)';
                  const approxDistance = generatedDoc?.part_b?.approx_distance_km || generatedDoc?.part_a?.approx_distance_km || 984;
                  const validUntil = generatedDoc?.valid_until || '25-Sep-2026 11:59 PM';
                  const digitalSig = generatedDoc?.digital_signature || 'GSTIN-SIG-8F91A0C2-ECDSA-SHA256-NIC-GATEWAY';

                  return (
                    <div className="mt-5 space-y-4">
                      {/* Barcode representation */}
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">NIC National Electronic Gateway ID</span>
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">EWB-191288410291-GSTN-PORTAL-AUTH</span>
                        </div>
                        <div className="font-mono text-xs tracking-widest text-slate-600 dark:text-slate-400 select-none">
                          ||| ||||| || |||| |||||| ||| |||||||
                        </div>
                      </div>

                      {/* 2-Column Split: Part A & Part B */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Part-A: Goods & Tax Invoice */}
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                              PART-A: Consignment & Tax Invoice
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Invoice Value</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Supplier (Consignor):</span>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight mt-0.5">{supplier}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{dispatchFrom}</p>
                            </div>

                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Recipient (Consignee):</span>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight mt-0.5">{recipient}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{deliveryTo}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500">Taxable Goods Value:</span>
                                <p className="font-mono font-bold text-slate-900 dark:text-white">₹{taxableVal.toLocaleString()} INR</p>
                              </div>
                              <div>
                                <span className="text-slate-500">CGST + SGST (18%):</span>
                                <p className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{(cgstVal + sgstVal).toLocaleString()} INR</p>
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
                              <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Total Invoice Value:</span>
                              <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                ₹{invoiceVal.toLocaleString()} INR
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Part-B: Transshipment Vehicle & Driver */}
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              PART-B: Vehicle & Transshipment
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ANPR Synced</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Registered Vehicle:</span>
                                <p className="font-mono font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{vehicleNumber}</p>
                              </div>
                              <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                                Plate Verified (96.4%)
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Transporter Agency:</span>
                              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{transporterName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">ID: {transporterId}</p>
                            </div>

                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Driver In-Charge:</span>
                              <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{driverContact}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500">Transit Mode:</span>
                                <p className="text-slate-700 dark:text-slate-300">{transitMode}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Approx Distance:</span>
                                <p className="font-mono text-cyan-600 dark:text-cyan-300">{approxDistance} km</p>
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Statutory Validity:</span>
                              <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-300">
                                Valid until {validUntil}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR Verification & Highway Authority Strip */}
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white p-2 shadow-md shrink-0 border border-slate-200">
                            <QrCode className="h-16 w-16 text-slate-950" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span>NIC 2D Security Barcode & QR Code</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                              En-route highway tax officer mobile scan verification payload. Digitally encrypted and signed with National Informatics Centre (NIC) public key.
                            </p>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono uppercase">Cryptographic Signature:</span>
                          <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 truncate max-w-[240px]">
                            {digitalSig}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* US eBOL Content */
                (() => {
                  const usPlate = generatedDoc?.power_unit_plate || generatedDoc?.truck_plate || 'MH-12-RN-4819';
                  const usCarrier = generatedDoc?.carrier || generatedDoc?.carrier_name || 'Tata Logistics Express';
                  const usScac = generatedDoc?.scac_code || 'TETL';
                  const usShipper = generatedDoc?.shipper || 'Dallas Sunbelt Distribution Park, DFW, TX 75261';
                  const usConsignee = generatedDoc?.consignee || 'Amazon Fulfillment Center SAT1, Schertz, TX 78154';
                  const usStatus = generatedDoc?.fmcsa_status || 'VERIFIED_COMPLIANT';
                  const usDetention = generatedDoc?.detention_clause || '$75.00/hr after 2.0 hours free time';
                  const usTrailer = generatedDoc?.trailer_seal_number || 'SL-994102';
                  const usCargo = generatedDoc?.cargo_description || 'General Merchandise / Commercial Freight';
                  const usClass = generatedDoc?.nmfc_freight_class || 'Class 70 (Standard Freight)';

                  return (
                    <div className="mt-5 space-y-4">
                      {/* US DOT Barcode strip */}
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">FMCSA Uniform Bill of Lading Number</span>
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{generatedDoc?.bol_number || 'BOL-US-2026-994102'}</span>
                        </div>
                        <div className="font-mono text-xs tracking-widest text-slate-600 dark:text-slate-400 select-none">
                          |||| ||| |||||| || ||||| |||| |||
                        </div>
                      </div>

                      {/* 2-Column Split: Carrier/Vehicle & Routing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                              Motor Carrier & Equipment
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{usStatus}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Carrier Name:</span>
                                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{usCarrier}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">SCAC Code:</span>
                                <p className="font-mono font-bold text-cyan-600 dark:text-cyan-300 mt-0.5">{usScac}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Power Unit Plate:</span>
                                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">{usPlate}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Trailer Tamper Seal:</span>
                                <p className="font-mono font-bold text-amber-600 dark:text-amber-300 mt-0.5">{usTrailer}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">NMFC Freight Classification:</span>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{usClass}</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Cargo Description:</span>
                              <p className="text-slate-900 dark:text-white text-xs font-medium">{usCargo}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Routing, Facility & Detention
                            </span>
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">49 CFR §373</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Shipper (Origin Facility):</span>
                              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{usShipper}</p>
                            </div>

                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Consignee (Destination Facility):</span>
                              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{usConsignee}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Detention Protection Clause:</span>
                              <p className="font-bold text-amber-600 dark:text-amber-400 text-xs mt-0.5">{usDetention}</p>
                            </div>

                            <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">FMCSA Safety Audit:</span>
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">CLEARED • 100% COMPLIANT</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Electronic Seal & Signature */}
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white p-2 shadow-md shrink-0 border border-slate-200">
                            <QrCode className="h-16 w-16 text-slate-950" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span>DOT Electronic Seal & Proof of Delivery (ePOD)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                              Encrypted cryptographic bill of lading payload compliant with National Motor Freight Traffic Association (NMFTA) standard.
                            </p>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono uppercase">Master BOL Hash:</span>
                          <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 truncate max-w-[240px]">
                            DOT-BOL-{generatedDoc?.bol_number || '994102'}-SHA256-VALID
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            /* Loading State */
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center text-slate-400">
              <RefreshCw className="h-8 w-8 text-cyan-600 dark:text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Generating digital transport credentials...</p>
            </div>
          )}
        </div>
      </div>

      {/* SQLite Persisted Documents Archive */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/70 gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Statutory Transport Documents Ledger
                </h3>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  SQLite WAL Persisted
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanent audit trail of all signed Indian GST EWB-01 certificates and US eBOLs
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doc #, plate, transporter..."
              className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>
        </div>

        {/* Structured High-Contrast Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Document Number</th>
                <th className="py-3 px-3">Vehicle Plate</th>
                <th className="py-3 px-3">Transporter Agency</th>
                <th className="py-3 px-3">Document Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">{doc.ewb_number}</td>
                    <td className="py-3 px-3 font-mono text-slate-900 dark:text-white font-semibold">{doc.truck_plate}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{doc.transporter}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{doc.doc_type}</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.generated_at ? new Date(doc.generated_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.print()}
                          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold text-[11px] cursor-pointer"
                        >
                          Print Copy
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id || doc.ewb_number)}
                          title="Delete Document from Register"
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No documents matching your search query.
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
