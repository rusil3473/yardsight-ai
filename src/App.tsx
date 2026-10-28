import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import type { CameraFeed, PlateRecord, SpillIncident, VlmChatMessage } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnterpriseAuthPortal } from './components/EnterpriseAuthPortal';
import { Sidebar, type TabId } from './components/Sidebar';
import { HomeOverviewTab } from './components/HomeOverviewTab';
import { FleetTrackTab } from './components/FleetTrackTab';
import { CctvMatrix } from './components/CctvMatrix';
import { NimbusHub } from './components/NimbusHub';
import { NimbusFloatingCopilot } from './components/NimbusFloatingCopilot';
import { AnprGateScanner } from './components/AnprGateScanner';
import { VlmChatAssistant } from './components/VlmChatAssistant';
import { SpillAnalysisModal } from './components/SpillAnalysisModal';
import { BusinessIntelligenceTab } from './components/BusinessIntelligenceTab';
import { EWayBillsTab } from './components/EWayBillsTab';
import { ScaleSettingsTab } from './components/ScaleSettingsTab';
import { IncidentAlertModal } from './components/IncidentAlertModal';
import { AuditReportModal } from './components/AuditReportModal';
import { INITIAL_PLATE_RECORDS } from './engine/anprEngine';
import { INITIAL_SPILLS } from './engine/spillDetector';
import { yardApi } from './api/yardApi';
import { StandardErrorAlert, type ProblemDetails, type StandardUser } from '@packages/standards';
import { INITIAL_CAMERAS, INITIAL_VLM_MESSAGES } from './components/layout/AppInitialState';
import { AppHeader } from './components/layout/AppHeader';
import { API_BASE_URL } from './config/env';
import { LeakWorkbenchTab } from './components/layout/LeakWorkbenchTab';
import { ThemeProvider } from './context/ThemeContext';

const MainAppContent: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [marketMode, setMarketMode] = useState<'IN_GST' | 'US_FREIGHT'>('IN_GST');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Operational State
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [plates, setPlates] = useState<PlateRecord[]>(INITIAL_PLATE_RECORDS);
  const [spills, setSpills] = useState<SpillIncident[]>(INITIAL_SPILLS);
  const [vlmMessages, setVlmMessages] = useState<VlmChatMessage[]>(INITIAL_VLM_MESSAGES);
  const [trucks, setTrucks] = useState<any[]>([]);

  // Modals
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [activeSpillModal, setActiveSpillModal] = useState<SpillIncident | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [apiError, setApiError] = useState<ProblemDetails | null>(null);

  // Leak Live Workbench State
  const [leakRainIntensity, setLeakRainIntensity] = useState(0.5);
  const [leakMetrics, setLeakMetrics] = useState<any>(null);

  // Standard User mapping for CASL RBAC
  const standardUser: StandardUser = {
    id: user.user_id,
    email: user.email,
    name: user.name,
    role: user.role === 'corporate_admin' ? 'admin' : user.role === 'yard_master' ? 'yard_master' : 'security_guard',
  };

  const activeSpillsCount = spills.filter((s) => s.status === 'active').length;
  const detentionTrucksCount = trucks.filter((t) => t.is_detention).length;

  const fetchCameras = async () => {
    try {
      const tenantParam = tenant?.tenant_id ? `?tenant_id=${encodeURIComponent(tenant.tenant_id)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/cameras${tenantParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cameras && Array.isArray(data.cameras) && data.cameras.length > 0) {
          setCameras(
            data.cameras.map((c: any) => ({
              id: c.id,
              name: c.name,
              location: c.location,
              rtspUrl: c.stream_url || `DMSS://${c.dmss_serial}?channel=${c.dmss_channel}`,
              status: c.status || 'ONLINE',
              fps: c.fps || 30,
              resolution: c.resolution || '1080p',
              cameraAngle: `NVR CH-${String(c.dmss_channel || 1).padStart(2, '0')}`,
              detections: [],
            }))
          );
        }
      }
    } catch {
      // Keep initial fallback
    }
  };

  const fetchTrucks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trucks?tenant_id=${tenant.tenant_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'SUCCESS' && Array.isArray(data.trucks)) {
          setTrucks(data.trucks);
        }
      }
    } catch {
      // Keep initial
    }
  };

  const fetchLeakData = async (intensity: number) => {
    try {
      const res = await yardApi.getLeakStatus(intensity);
      setLeakMetrics(res);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchTrucks();
    fetchCameras();
    fetchLeakData(leakRainIntensity);
  }, []);

  const handleAddPlate = (rec: PlateRecord) => {
    setPlates((prev) => [rec, ...prev]);
  };

  const handleUpdatePlate = (id: string, updatedPlate: string) => {
    setPlates((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              originalPlate: p.originalPlate || p.plateNumber,
              plateNumber: updatedPlate.toUpperCase().trim(),
              isCorrected: true,
              correctedBy: 'Admin',
            }
          : p
      )
    );
  };

  const handleDispatchContainment = (spillId: string) => {
    setSpills((prev) =>
      prev.map((s) => (s.id === spillId ? { ...s, status: 'containment_dispatched' } : s))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-row font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200">
      {/* Unified Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        marketMode={marketMode}
        onSelectMarketMode={setMarketMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        cameraCount={cameras.length}
        detentionCount={detentionTrucksCount}
        hasLeak={activeSpillsCount > 0}
      />

      {/* Main Operations Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Industrial Command Header */}
        <AppHeader
          tenantName={tenant.name}
          roleLabel={user.role_label}
          activeSpillsCount={activeSpillsCount}
          firstActiveSpill={spills.find((s) => s.status === 'active') || spills[0]}
          standardUser={standardUser}
          onOpenSpillModal={setActiveSpillModal}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          onOpenAuditModal={() => setIsAuditOpen(true)}
        />

        {/* Global Error Banner */}
        {apiError && (
          <div className="p-4 bg-red-950/40 border-b border-red-500/40">
            <StandardErrorAlert error={apiError} onDismiss={() => setApiError(null)} />
          </div>
        )}

        {/* Main Operational Workspace Content */}
        <main className="p-6 flex-1">
          {/* TAB 1: LOGISTICS COMMAND OVERVIEW */}
          {activeTab === 'home' && (
            <HomeOverviewTab
              marketMode={marketMode}
              onNavigateTab={(tab) => setActiveTab(tab)}
              trucks={trucks}
              onRefreshTrucks={fetchTrucks}
            />
          )}

          {/* TAB 2: LIVE CCTV MATRIX */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>SURVEILLANCE MATRIX: DAHUA NVR MULTI-CHANNEL ({cameras.length} CHANNELS)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Enterprise NVR multi-channel ingestion with zero mock frames & live optical hardware capture
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>DAHUA NVR (BE124E0PCA95532): {cameras.length} CH ONLINE</span>
                </span>
              </div>
              <CctvMatrix
                feeds={cameras}
                selectedCamera={selectedCamera}
                onSelectCamera={(feed) => setSelectedCamera(feed)}
                onRefreshCameras={fetchCameras}
                onOpenNimbus={() => setActiveTab('nimbus')}
                onTriggerAlert={(feed) => {
                  if (feed.id === 'CAM-03' || feed.id === 'cam-03') {
                    setActiveSpillModal(spills[0]);
                  } else {
                    setIsAlertModalOpen(true);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 3: NIMBUS MULTIMODAL BUSINESS INTELLIGENCE HUB */}
          {activeTab === 'nimbus' && <NimbusHub />}

          {/* TAB 4: OPENCV 4.10 ANPR GATE SCANNER */}
          {activeTab === 'anpr' && (
            <AnprGateScanner
              records={plates}
              onAddRecord={handleAddPlate}
              onUpdateRecord={handleUpdatePlate}
            />
          )}

          {/* TAB 5: NEBIUS VLM SPATIAL AGENT */}
          {activeTab === 'vlm' && (
            <VlmChatAssistant
              messages={vlmMessages}
              onSendMessage={(msg) => setVlmMessages((prev) => [...prev, msg])}
              activePlatesCount={plates.length}
              unresolvedSpillsCount={activeSpillsCount}
            />
          )}

          {/* TAB 6: CONCRETE SPECULAR LEAKS & ACTUATORS */}
          {activeTab === 'leak' && (
            <LeakWorkbenchTab
              spills={spills}
              leakRainIntensity={leakRainIntensity}
              leakMetrics={leakMetrics}
              onRainIntensityChange={(val) => {
                setLeakRainIntensity(val);
                fetchLeakData(val);
              }}
              onOpenSpillModal={setActiveSpillModal}
            />
          )}

          {/* TAB 7: FACTORYOS & ENERGY OCR */}
          {activeTab === 'production' && <BusinessIntelligenceTab />}

          {/* TAB 8: FLEET & DOCK DWELL TRACKING */}
          {activeTab === 'track' && (
            <FleetTrackTab
              trucks={trucks}
              marketMode={marketMode}
              onGenerateDocument={() => setActiveTab('eway_bills')}
              onSendDispatch={() => setIsAlertModalOpen(true)}
              onRefreshTrucks={fetchTrucks}
              generatedDoc={null}
            />
          )}

          {/* TAB 9: E-WAY BILLS & EBOL TRANSIT */}
          {activeTab === 'eway_bills' && <EWayBillsTab />}

          {/* TAB 10: SCALE TELEMETRY & COMPLIANCE */}
          {activeTab === 'scale' && <ScaleSettingsTab />}
        </main>
      </div>

      {/* Interactive Modals */}
      <SpillAnalysisModal
        isOpen={!!activeSpillModal}
        spill={activeSpillModal}
        currentUser={standardUser}
        onClose={() => setActiveSpillModal(null)}
        onDispatchContainment={handleDispatchContainment}
      />

      <IncidentAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      <AuditReportModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        plates={plates}
        spills={spills}
      />

      {/* Ambient Floating Nimbus AI Copilot */}
      <NimbusFloatingCopilot activeCameraId={selectedCamera?.id || 'CAM-01'} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}

const AuthGate: React.FC = () => {
  const { isAuthenticated, token } = useAuth();

  if (!isAuthenticated || !token) {
    return <EnterpriseAuthPortal />;
  }

  return <MainAppContent />;
};
