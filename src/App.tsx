import { useState } from 'react';
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  Scan,
  Droplets,
  Bot,
  MessageSquare,
  FileText,
} from 'lucide-react';
import type { CameraFeed, PlateRecord, SpillIncident, VlmChatMessage } from './types';
import { CctvMatrix } from './components/CctvMatrix';
import { AnprGateScanner } from './components/AnprGateScanner';
import { SpillAnalysisModal } from './components/SpillAnalysisModal';
import { VlmChatAssistant } from './components/VlmChatAssistant';
import { WhatsAppAlertModal } from './components/WhatsAppAlertModal';
import { AuditReportModal } from './components/AuditReportModal';
import { INITIAL_PLATE_RECORDS } from './engine/anprEngine';
import { INITIAL_SPILLS } from './engine/spillDetector';

const INITIAL_CAMERAS: CameraFeed[] = [
  {
    id: 'cam-01',
    name: 'Gate North Commercial Inbound',
    location: 'North Perimeter Barrier 1 & 2',
    rtspUrl: 'rtsp://10.240.1.11:554/h265',
    status: 'ONLINE',
    fps: 30,
    resolution: '4K (3840x2160)',
    cameraAngle: 'Overhead 35° Tilt - ANPR Calibrated',
    detections: [
      {
        id: 'det-01',
        timestamp: '2026-09-20T11:45:30Z',
        type: 'plate',
        confidence: 0.992,
        bbox: { x: 34, y: 55, w: 32, h: 28 },
        label: 'ANPR: MH 12 RN 4589 (HSRP)',
        severity: 'info',
      },
    ],
  },
  {
    id: 'cam-02',
    name: 'Loading Dock 3 (Intermodal Bay)',
    location: 'Warehouse Central High-Bay',
    rtspUrl: 'rtsp://10.240.1.12:554/h265',
    status: 'ONLINE',
    fps: 30,
    resolution: '1080p (1920x1080)',
    cameraAngle: 'Wide-Angle 110° FOV',
    detections: [
      {
        id: 'det-02',
        timestamp: '2026-09-20T11:50:00Z',
        type: 'ppe_violation',
        confidence: 0.945,
        bbox: { x: 62, y: 38, w: 18, h: 42 },
        label: 'PPE ALERT: Missing Hi-Vis Vest',
        severity: 'warning',
      },
    ],
  },
  {
    id: 'cam-03',
    name: 'Fuel Dispensing & Maintenance Bay',
    location: 'South Depot Service Pad',
    rtspUrl: 'rtsp://10.240.1.13:554/h265',
    status: 'ONLINE',
    fps: 25,
    resolution: '1080p (1920x1080)',
    cameraAngle: 'Depot Pad Fixed 45°',
    detections: [
      {
        id: 'det-03',
        timestamp: '2026-09-20T11:38:40Z',
        type: 'spill',
        confidence: 0.965,
        bbox: { x: 42, y: 64, w: 38, h: 26 },
        label: 'CRITICAL LEAK: Diesel Fuel (18.5 sq ft)',
        severity: 'critical',
      },
    ],
  },
  {
    id: 'cam-04',
    name: 'Perimeter West Container Storage',
    location: 'West Staging Apron',
    rtspUrl: 'rtsp://10.240.1.14:554/h265',
    status: 'ONLINE',
    fps: 30,
    resolution: '1080p (1920x1080)',
    cameraAngle: 'PTZ Auto-Tracking Zone',
    detections: [],
  },
];

const INITIAL_VLM_MESSAGES: VlmChatMessage[] = [
  {
    id: 'vlm-init-1',
    role: 'assistant',
    content: `YardSight VLM operational reasoning agent online. Initialized with 4 RTSP camera feeds, OpenCV ANPR homography pipeline, and thin-film concrete specular reflection models. You can query me using natural language about any yard activity, vehicle manifests, or containment statuses.`,
    timestamp: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'anpr' | 'spills' | 'vlm'>('matrix');
  const [cameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [plates, setPlates] = useState<PlateRecord[]>(INITIAL_PLATE_RECORDS);
  const [spills, setSpills] = useState<SpillIncident[]>(INITIAL_SPILLS);
  const [vlmMessages, setVlmMessages] = useState<VlmChatMessage[]>(INITIAL_VLM_MESSAGES);

  // Modals
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [activeSpillModal, setActiveSpillModal] = useState<SpillIncident | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const activeSpillsCount = spills.filter(s => s.status === 'active').length;


  const handleAddPlate = (rec: PlateRecord) => {
    setPlates(prev => [rec, ...prev]);
  };

  const handleDispatchContainment = (spillId: string) => {
    setSpills(prev =>
      prev.map(s => (s.id === spillId ? { ...s, status: 'containment_dispatched' } : s))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Industrial Command Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white font-mono tracking-wider">
                  YARDSIGHT<span className="text-cyan-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OPENCV + NVIDIA VLM
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Multi-RTSP CCTV Intelligence & Logistics Gate Automation
              </div>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-3">
            {/* Critical Alert Indicator */}
            {activeSpillsCount > 0 && (
              <div className="hidden sm:flex items-center space-x-2 bg-red-950/60 border border-red-500/40 px-3 py-1 rounded-lg text-xs font-mono text-red-300 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{activeSpillsCount} ACTIVE HAZARD</span>
              </div>
            )}

            {/* Quick WhatsApp Dispatch */}
            <button
              type="button"
              onClick={() => setIsWhatsAppOpen(true)}
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-500/40 transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp Dispatch</span>
            </button>

            {/* PDF Audit Export */}
            <button
              type="button"
              onClick={() => setIsAuditOpen(true)}
              className="bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-cyan-500/40 transition shadow-lg shadow-cyan-600/20 flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Audit PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Bar Telemetry */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">SYSTEM ARMED: 4 FEEDS ONLINE</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">BITRATE: 18.4 Mbps</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-cyan-400 hidden md:inline">HOMOGRAPHY ENGINE: 98.4% ACCURACY</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">MARKETS:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">🇺🇸 US DOT Freight</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">🇮🇳 India HSRP Corridors</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-2 ${
              activeTab === 'matrix'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>CCTV Matrix (4-Grid)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anpr')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-2 ${
              activeTab === 'anpr'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>ANPR Gate Scanner ({plates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spills')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-2 ${
              activeTab === 'spills'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Specular Concrete Leaks ({spills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vlm')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-2 ${
              activeTab === 'vlm'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>VLM Spatial Agent</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <CctvMatrix
              feeds={cameras}
              selectedCamera={selectedCamera}
              onSelectCamera={(feed) => setSelectedCamera(feed)}
              onTriggerAlert={(feed) => {
                if (feed.id === 'cam-03') {
                  setActiveSpillModal(spills[0]);
                } else {
                  setIsWhatsAppOpen(true);
                }
              }}
            />

            {/* Quick KPI Bar below Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 uppercase">Tracked Inbound</div>
                  <div className="text-xl font-bold text-white mt-1">{plates.length} Trucks</div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Scan className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 uppercase">Hazardous Leaks</div>
                  <div className="text-xl font-bold text-red-400 mt-1">{activeSpillsCount} Active</div>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 uppercase">Safety Compliance</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">96.8%</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 uppercase">Reasoning VLM</div>
                  <div className="text-xl font-bold text-purple-400 mt-1">NVIDIA Cosmos</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anpr' && (
          <AnprGateScanner records={plates} onAddRecord={handleAddPlate} />
        )}

        {activeTab === 'spills' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
                    <Droplets className="w-6 h-6 text-amber-400" />
                    <span>SPECULAR CONCRETE LEAK DETECTION PIPELINE</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Edge Luminance Variance & Chromatic Dispersion (Thin-Film Interference Model)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  OSHA 1910.120 / CPCB HAZARD ENGINE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spills.map(s => {
                  const isCrit = s.severity === 'critical';
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSpillModal(s)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all bg-slate-950/80 hover:scale-[1.02] shadow-xl ${
                        isCrit
                          ? 'border-red-500/80 bg-red-950/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {s.cameraId}
                        </span>
                        <span className={`font-bold ${isCrit ? 'text-red-400' : 'text-emerald-400'}`}>
                          {s.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-base font-bold text-white font-mono">{s.spillType}</div>
                      <div className="text-xs text-slate-400 mt-1">{s.surfaceType}</div>

                      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-slate-500">Pool Area:</div>
                          <div className="text-slate-200 font-bold">{s.estimatedAreaSqFt} sq ft</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Refractive Index:</div>
                          <div className="text-cyan-400 font-bold">{s.refractiveIndex}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono py-2 rounded-lg transition text-center"
                      >
                        Inspect Specular Curve →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vlm' && (
          <VlmChatAssistant
            messages={vlmMessages}
            onSendMessage={(msg) => setVlmMessages(prev => [...prev, msg])}
            activePlatesCount={plates.length}
            unresolvedSpillsCount={activeSpillsCount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          YardSight AI • Multi-RTSP CCTV Computer Vision & Reasoning VLM Platform
        </div>
        <div>
          OpenCV AI Competition 2026 (AWS) & Nebius x NVIDIA Global AI Hackathon
        </div>
      </footer>

      {/* Active Modals */}
      <SpillAnalysisModal
        isOpen={!!activeSpillModal}
        spill={activeSpillModal}
        onClose={() => setActiveSpillModal(null)}
        onDispatchContainment={handleDispatchContainment}
      />

      <WhatsAppAlertModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <AuditReportModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        plates={plates}
        spills={spills}
      />
    </div>
  );
}
