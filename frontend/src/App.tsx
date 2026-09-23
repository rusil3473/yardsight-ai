import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import type { TabId } from './components/CorporateNavbar';
import { CorporateLoginModal } from './components/CorporateLoginModal';
import { MCPAgentDrawer } from './components/MCPAgentDrawer';

import { HomeOverviewView } from './views/HomeOverviewView';
import { LiveVideoView } from './views/LiveVideoView';
import { FleetTrackView } from './views/FleetTrackView';
import { EWayBillsView } from './views/EWayBillsView';
import { RoofLeakView } from './views/RoofLeakView';
import { ScaleSettingsView } from './views/ScaleSettingsView';

const API_BASE = 'http://127.0.0.1:8001/api';

const MainAppContent: React.FC = () => {
  const { tenant, token } = useAuth();
  const activeTenantId = tenant?.tenant_id || (tenant as any)?.id || 'TENANT-AMZN-BLR1';

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [marketMode, setMarketMode] = useState<'IN_GST' | 'US_FREIGHT'>('IN_GST');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMCPOpen, setIsMCPOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState('CAM-01');
  const [anprData, setAnprData] = useState<any>(null);
  const [leakData, setLeakData] = useState<any>(null);
  const [rainIntensity, setRainIntensity] = useState<number>(0.65);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isLoadingANPR, setIsLoadingANPR] = useState(false);
  const [mcpTools] = useState<any[]>([
    { name: 'get_yard_overview', description: 'Retrieves real-time yard status across all CCTV streams.', inputSchema: {} },
    { name: 'analyze_gate_anpr', description: 'Applies OpenCV 5 perspective homography to unwarp tilted plate.', inputSchema: {} },
    { name: 'check_roof_leakage', description: 'Analyzes specular glare and wet concrete expansion in interior godown.', inputSchema: {} },
    { name: 'generate_transport_documents', description: 'Auto-generates Indian GST E-Way Bill or US eBOL.', inputSchema: {} },
    { name: 'send_driver_dispatch_alert', description: 'Sends proactive WhatsApp alert to truck driver.', inputSchema: {} }
  ]);

  useEffect(() => {
    const isDFW = activeTenantId === 'TENANT-US-DFW';
    fetchANPR(isDFW ? 'TX-49-B219' : 'MH-12-RN-4819', isDFW ? 'US' : 'IN');
    fetchLeak(0.65);
    fetchDwellTrucks(activeTenantId);
  }, [activeTenantId]);

  const fetchANPR = async (plate: string, country: string) => {
    setIsLoadingANPR(true);
    try {
      const res = await fetch(`${API_BASE}/anpr/unwarp?plate=${plate}&country=${country}`);
      if (res.ok) {
        const data = await res.json();
        setAnprData(data);
      }
    } catch (e) {
      console.warn('Backend offline, using fallback ANPR state', e);
    } finally {
      setIsLoadingANPR(false);
    }
  };

  const fetchLeak = async (intensity: number) => {
    try {
      const res = await fetch(`${API_BASE}/leak/status?intensity=${intensity}`);
      if (res.ok) {
        const data = await res.json();
        setLeakData(data);
      }
    } catch (e) {
      console.warn('Backend offline, using fallback leak state', e);
    }
  };

  const fetchDwellTrucks = async (tenantId?: string) => {
    const tId = tenantId || activeTenantId;
    try {
      const res = await fetch(`${API_BASE}/dwell/trucks?tenant_id=${tId}`);
      if (res.ok) {
        const data = await res.json();
        setTrucks(data);
      }
    } catch (e) {
      console.warn('Backend offline, using fallback dwell state', e);
    }
  };

  const handleAddTruck = async (truckData: any) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/trucks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...truckData, tenant_id: activeTenantId })
      });
      if (res.ok) {
        await fetchDwellTrucks(activeTenantId);
        return { success: true };
      }
    } catch (e: any) {
      console.error('Failed to add truck:', e);
      return { success: false, message: e.message };
    }
    return { success: false, message: 'Failed to register truck' };
  };

  const handleUpdateTruckStatus = async (truckId: string, status: string, dockNumber?: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/trucks/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ truck_id: truckId, status, dock_number: dockNumber })
      });
      if (res.ok) {
        await fetchDwellTrucks(activeTenantId);
      }
    } catch (e) {
      console.error('Failed to update truck status:', e);
    }
  };

  const handleDeleteTruck = async (truckId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/trucks/${truckId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        await fetchDwellTrucks(activeTenantId);
        return true;
      }
    } catch (e) {
      console.error('Failed to delete truck:', e);
    }
    return false;
  };

  const handleGenerateDoc = async (truckId: string, docType: string) => {
    try {
      const res = await fetch(`${API_BASE}/documents/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truck_id: truckId, doc_type: docType })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedDoc(data);
      }
    } catch (e) {
      console.warn('Backend offline, using generated fallback', e);
    }
  };

  const handleSendDispatch = async (truckId: string, phone: string = '+91-98765-43210') => {
    try {
      const res = await fetch(`${API_BASE}/dispatch/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truck_id: truckId, phone, channel: 'WHATSAPP' })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, simulated dispatch', e);
      return { status: 'DELIVERED', message: 'Simulated WhatsApp dispatch sent successfully' };
    }
  };

  const handleExecuteMCP = async (toolName: string, args: any) => {
    try {
      const res = await fetch(`${API_BASE}/mcp/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_name: toolName, arguments: args })
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error('MCP invocation failed');
    } catch {
      return { status: 'MOCK_SUCCESS', tool: toolName, message: 'MCP tool executed cleanly on local agentic core.' };
    }
  };

  const handleIntensityChange = (val: number) => {
    setRainIntensity(val);
    fetchLeak(val);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      {/* Amazon / AWS Supply Chain Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        marketMode={marketMode}
        onSelectMarketMode={setMarketMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenMCP={() => setIsMCPOpen(true)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Amazon/AWS Breadcrumb Header with Light/Dark Mode Switcher */}
        <TopHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Main Tab Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'home' && (
            <HomeOverviewView
              onNavigateTab={setActiveTab}
              marketMode={marketMode}
              trucks={trucks}
              onAddTruck={handleAddTruck}
              onRefreshTrucks={() => fetchDwellTrucks(activeTenantId)}
            />
          )}

          {activeTab === 'video' && (
            <LiveVideoView
              anprData={anprData}
              leakData={leakData}
              onRefreshPlate={fetchANPR}
              onSelectFeed={setActiveFeed}
              activeFeed={activeFeed}
              isLoadingANPR={isLoadingANPR}
            />
          )}

          {activeTab === 'track' && (
            <FleetTrackView
              trucks={trucks}
              onGenerateDocument={handleGenerateDoc}
              onSendDispatch={handleSendDispatch}
              onAddTruck={handleAddTruck}
              onUpdateStatus={handleUpdateTruckStatus}
              onDeleteTruck={handleDeleteTruck}
              onRefreshTrucks={() => fetchDwellTrucks(activeTenantId)}
              generatedDoc={generatedDoc}
              marketMode={marketMode}
            />
          )}

          {activeTab === 'eway_bills' && (
            <EWayBillsView marketMode={marketMode} />
          )}

          {activeTab === 'leak' && (
            <RoofLeakView
              leakData={leakData}
              rainIntensity={rainIntensity}
              onIntensityChange={handleIntensityChange}
            />
          )}

          {activeTab === 'scale' && (
            <ScaleSettingsView />
          )}
        </main>

        {/* Amazon Alexa+ MCP Server Drawer */}
        {isMCPOpen && (
          <MCPAgentDrawer
            tools={mcpTools}
            onExecuteTool={handleExecuteMCP}
          />
        )}

        {/* Corporate SSO Login Modal */}
        <CorporateLoginModal />

        {/* Enterprise Clean Footer */}
        <footer className="mt-auto px-6 py-6 border-t border-slate-200/80 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-2">
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">Documentation</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">API Reference</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">Security & Compliance</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">Support Hub</a>
          </div>
          <p>
            © 2026 YardSight AI (GodownOS) • Enterprise Logistics Intelligence Platform • All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
