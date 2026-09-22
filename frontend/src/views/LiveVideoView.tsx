import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Radio, Plus, Check } from 'lucide-react';
import { CCTVStreamGrid } from '../components/CCTVStreamGrid';
import { ANPRInspector } from '../components/ANPRInspector';
import { CameraModal } from '../components/CameraModal';
import type { CCTVCamera } from '../components/CameraModal';
import { useAuth } from '../context/AuthContext';

interface LiveVideoViewProps {
  anprData: any;
  leakData: any;
  onRefreshPlate: (plate: string, country: string) => void;
  onSelectFeed: (feedId: string) => void;
  activeFeed: string;
  isLoadingANPR?: boolean;
}

export const LiveVideoView: React.FC<LiveVideoViewProps> = ({
  anprData,
  leakData,
  onRefreshPlate,
  onSelectFeed,
  activeFeed,
  isLoadingANPR = false
}) => {
  const { tenant, token } = useAuth();
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [isLoadingCameras, setIsLoadingCameras] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCamera, setEditingCamera] = useState<CCTVCamera | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTenantId = tenant.tenant_id || (tenant as any).id || 'TENANT-AMZN-BLR1';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCameras = async () => {
    setIsLoadingCameras(true);
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/cameras?tenant_id=${activeTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setCameras(data.cameras || []);
      }
    } catch (err) {
      console.error('Failed to fetch cameras from SQLite:', err);
    } finally {
      setIsLoadingCameras(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [activeTenantId]);

  const handleOpenAdd = () => {
    setEditingCamera(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camera: CCTVCamera) => {
    setEditingCamera(camera);
    setIsModalOpen(true);
  };

  const handleSaveCamera = async (cameraData: Partial<CCTVCamera>) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (editingCamera) {
      // Update existing camera
      const res = await fetch(`http://127.0.0.1:8001/api/cameras/${editingCamera.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(cameraData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update camera');
      }
      showToast(`Updated camera "${cameraData.name || editingCamera.name}"`);
    } else {
      // Create new camera
      const res = await fetch('http://127.0.0.1:8001/api/cameras', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...cameraData,
          tenant_id: activeTenantId
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create camera');
      }
      const data = await res.json();
      showToast(`Added new CCTV camera "${data.camera.name}" to ${activeTenantId}`);
    }

    fetchCameras();
  };

  const handleDeleteCamera = async (cameraId: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8001/api/cameras/${cameraId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to delete camera');
      }
      showToast(`Camera deleted from SQLite database.`);
      fetchCameras();
    } catch (err: any) {
      alert(`Error deleting camera: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-300">
          <Camera className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
          <Check className="h-4 w-4 text-emerald-400 ml-2" />
        </div>
      )}

      {/* Video Hub Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800/50">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live Streams Active ({cameras.length})
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700/40">
              OpenCV 5.0 Homography
            </span>
            <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold border border-cyan-500/20">
              Dahua DMSS & RTSP Ready
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Video Surveillance Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tenant.name} • {cameras.length} active cameras with real-time homography, DMSS app sync & thermal leak analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Camera</span>
          </button>

          <button
            onClick={() => {
              onRefreshPlate('MH-12-RN-4819', 'IN');
              fetchCameras();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${(isLoadingANPR || isLoadingCameras) ? 'animate-spin' : ''}`} />
            <span>Resync Stream</span>
          </button>
        </div>
      </div>

      {/* CCTV Dynamic Camera Grid */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 p-5 backdrop-blur-sm shadow-sm dark:shadow-xl">
        <CCTVStreamGrid
          cameras={cameras}
          anprData={anprData}
          leakData={leakData}
          onSelectFeed={onSelectFeed}
          activeFeed={activeFeed}
          onAddCamera={handleOpenAdd}
          onEditCamera={handleOpenEdit}
          onDeleteCamera={handleDeleteCamera}
        />
      </div>

      {/* OpenCV 5 Homography ANPR Inspector */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Camera className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              Gate ANPR & Plate Recognition
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 ml-9">
              Perspective homography unwarps oblique camera angles for high-accuracy OCR scanning.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            <Radio className="h-3 w-3" />
            Processing
          </span>
        </div>

        <ANPRInspector
          anprData={anprData}
          onRefreshPlate={onRefreshPlate}
          isLoading={isLoadingANPR}
        />
      </div>

      {/* Camera Add / Edit Modal */}
      <CameraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCamera}
        initialCamera={editingCamera}
        tenantId={activeTenantId}
      />
    </div>
  );
};
