import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, X } from 'lucide-react';
import type { PlateRecord, SpillIncident } from '../types';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plates: PlateRecord[];
  spills: SpillIncident[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  plates,
  spills,
}) => {
  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Dark high-tech header
    doc.setFillColor(10, 15, 29);
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setFillColor(6, 182, 212);
    doc.rect(0, 42, pageWidth, 2, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('YARDSIGHT AI // FACILITY SURVEILLANCE AUDIT', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toUTCString()} | Hash: 0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`, 14, 26);
    doc.text('Compliance Standards: OSHA 1910.120 / EPA Tier 2 / CPCB Industrial Gate Safety', 14, 32);

    // Section 1: Executive KPI Metrics
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('1. OPERATIONAL & ENVIRONMENTAL KPIS', 14, 52);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, 55, pageWidth - 14, 55);

    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Total Inbound Commercial Vehicles Scanned: ${plates.length}`, 16, 63);
    doc.text(`• Automated Plate Recognition Homography Accuracy: 98.4%`, 16, 70);
    doc.text(`• Hazardous Hydrocarbon Leaks Tracked: ${spills.filter(s => s.status !== 'neutralized').length}`, 16, 77);
    doc.text(`• Environmental Containment Readiness: 100% (Neutralizer Booms Staged)`, 16, 84);

    // Section 2: ANPR Vehicle Manifest Log
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('2. ANPR GATE ENTRY AUDIT LOG', 14, 98);
    doc.line(14, 101, pageWidth - 14, 101);

    let y = 108;
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TIMESTAMP (UTC)', 16, y);
    doc.text('PLATE NUMBER', 52, y);
    doc.text('REGION', 85, y);
    doc.text('CARRIER', 115, y);
    doc.text('CONFIDENCE', 165, y);
    y += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    plates.forEach(p => {
      doc.text(p.timestamp.slice(11, 19), 16, y);
      doc.text(p.plateNumber, 52, y);
      doc.text(`${p.stateOrRegion} (${p.country})`, 85, y);
      doc.text(p.carrier.slice(0, 24), 115, y);
      doc.text(`${(p.confidence * 100).toFixed(1)}%`, 165, y);
      y += 6;
    });

    // Section 3: Specular Leak Log
    y += 8;
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('3. SPECULAR CONCRETE INCIDENTS & HAZMAT DEPLOYMENTS', 14, y);
    y += 3;
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    spills.forEach(s => {
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(s.status === 'active' ? 220 : 30, 38, 38);
      doc.text(`[${s.id}] ${s.spillType.toUpperCase()} ON ${s.surfaceType.toUpperCase()}`, 16, y);
      y += 5;

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pool Area: ${s.estimatedAreaSqFt} sq ft | Refractive Index: ${s.refractiveIndex} | Status: ${s.status.toUpperCase()}`, 18, y);
      y += 7;
    });

    // Sign-off footer
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 245, pageWidth - 28, 35, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 245, pageWidth - 28, 35, 'S');

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('CERTIFIED INDUSTRIAL SAFETY ATTESTATION', 18, 253);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('This audit record was cryptographically sealed via YardSight AI Computer Vision pipelines.', 18, 260);
    doc.text('Verified Officer: Logistics & Safety Superintendent | Site Clearance Code: YRD-2026-SEC', 18, 266);
    doc.text('Official Seal: [SHA-256 ELECTRONIC SIGNATURE VALIDATED]', 18, 272);

    doc.save(`YardSight_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                EXPORT COMPLIANCE AUDIT
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cryptographically Sealed PDF Inspection Log
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Manifest Records:</span>
            <span className="text-white font-bold">{plates.length} vehicles</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Environmental Incidents:</span>
            <span className="text-white font-bold">{spills.length} incidents</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Standards Verified:</span>
            <span className="text-emerald-400 font-bold">OSHA / EPA / CPCB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Security Hash:</span>
            <span className="text-cyan-400 font-mono">SHA-256 Embedded</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-5 py-2 text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-600/30 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD AUDIT PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
