import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CameraFeed } from '../types';
import type {
  CctvLayoutMode,
  MatrixStatus,
  LiveDetectionEntity,
  CctvMatrixProps,
} from './cctv/types';
import { CctvTopBar } from './cctv/CctvTopBar';
import { CctvFeedViewport } from './cctv/CctvFeedViewport';
import { CctvInspectModal } from './cctv/CctvInspectModal';
import { CctvAddCameraModal } from './cctv/CctvAddCameraModal';
import { CctvAddNvrModal } from './cctv/CctvAddNvrModal';
import { CctvSyncChannelsModal } from './cctv/CctvSyncChannelsModal';
import { API_BASE_URL } from '../config/env';

export const CctvMatrix: React.FC<CctvMatrixProps> = ({
  feeds,
  selectedCamera,
  onSelectCamera,
  onTriggerAlert,
  onRefreshCameras,
  onOpenNimbus,
}) => {
  // Navigation & Layout (Default to 8-channel multi grid)
  const [layoutMode, setLayoutMode] = useState<CctvLayoutMode>('8');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [inspectModalFeed, setInspectModalFeed] = useState<CameraFeed | null>(null);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState<boolean>(false);
  const [isAddNvrModalOpen, setIsAddNvrModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Streaming & Health State (Live streaming enabled by default for all visible channels)
  const [pausedFeedIds, setPausedFeedIds] = useState<Set<string>>(new Set());
  const [streamErrorMap, setStreamErrorMap] = useState<Record<string, boolean>>({});
  const [retryKey, setRetryKey] = useState<number>(0);
  const [liveDetections, setLiveDetections] = useState<Record<string, LiveDetectionEntity[]>>({});

  // Real-time Clock in Indian Standard Time (IST)
  const getLiveTimestamp = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())} IST`;
  };

  const [currentTime, setCurrentTime] = useState<string>(() => getLiveTimestamp());
  const [matrixStatus, setMatrixStatus] = useState<MatrixStatus>({
    nvr_online: true,
    nvr_serial: 'BE124E0PCA95532',
    total_channels: 8,
    cameras: {},
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getLiveTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll NVR & Hardware Matrix Connectivity Status
  useEffect(() => {
    const fetchMatrixStatus = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/cameras/matrix/status`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && typeof data === 'object') {
            setMatrixStatus((prev) => ({
              nvr_online: data.nvr_online ?? prev.nvr_online ?? true,
              nvr_serial: data.nvr_serial ?? prev.nvr_serial ?? 'BE124E0PCA95532',
              total_channels: data.total_channels ?? prev.total_channels ?? 32,
              cameras:
                data.cameras && typeof data.cameras === 'object'
                  ? { ...prev.cameras, ...data.cameras }
                  : prev.cameras,
            }));
          }
        }
      } catch {
        // Ignore network drop
      }
    };
    fetchMatrixStatus();
    const interval = setInterval(fetchMatrixStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  // Pagination & Layout Calculations
  const pageSize =
    layoutMode === 'single'
      ? 1
      : layoutMode === '4'
      ? 4
      : layoutMode === '8'
      ? 8
      : layoutMode === '9'
      ? 9
      : layoutMode === '16'
      ? 16
      : feeds.length || 32;

  // Sort feeds deterministically by channel and attach real-time matrix status
  const sortedFeeds = useMemo(() => {
    return [...feeds]
      .sort((a, b) => {
        const chA = (a as any).dmss_channel ?? (parseInt(a.id?.replace(/\D/g, '') || '0', 10) || 0);
        const chB = (b as any).dmss_channel ?? (parseInt(b.id?.replace(/\D/g, '') || '0', 10) || 0);
        return chA - chB;
      })
      .map((f) => {
        const liveInfo = matrixStatus.cameras[f.id.toUpperCase()];
        return {
          ...f,
          status: liveInfo?.status ? (liveInfo.status as any) : f.status,
        };
      });
  }, [feeds, matrixStatus.cameras]);

  const totalChannels = sortedFeeds.length || 32;
  const totalPages = Math.max(1, Math.ceil(totalChannels / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const visibleFeeds = sortedFeeds.slice(startIndex, startIndex + pageSize);

  const getSnapshotUrl = useCallback(
    (feedId: string, tick?: number) => {
      const base = `${API_BASE_URL}/api/cameras/${feedId.toUpperCase()}/snapshot`;
      return tick ? `${base}?t=${tick}` : base;
    },
    []
  );

  const handleToggleStream = (feedId: string) => {
    setPausedFeedIds((prev) => {
      const next = new Set(prev);
      if (next.has(feedId)) next.delete(feedId);
      else next.add(feedId);
      return next;
    });
  };

  const handleRetryStream = (feedId: string) => {
    setStreamErrorMap((prev) => ({ ...prev, [feedId]: false }));
    setRetryKey(Date.now());
  };

  const handleTelemetryUpdate = useCallback((camId: string, telemetry: any[]) => {
    setLiveDetections((prev) => ({ ...prev, [camId]: telemetry }));
  }, []);

  const getSnapshotUrlWrapper = useCallback(
    (id: string, tick?: number) => {
      return getSnapshotUrl(id, tick ?? retryKey);
    },
    [getSnapshotUrl, retryKey]
  );

  const gridColsClass =
    layoutMode === 'single'
      ? 'grid-cols-1 max-w-4xl mx-auto'
      : layoutMode === '4'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : layoutMode === '8'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4'
      : layoutMode === '9'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : layoutMode === '16'
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8';

  return (
    <div className="space-y-4">
      {/* Telemetry & Controls Bar */}
      <CctvTopBar
        matrixStatus={matrixStatus}
        totalChannels={totalChannels}
        layoutMode={layoutMode}
        currentPage={activePage}
        totalPages={totalPages}
        onLayoutChange={(mode) => {
          setLayoutMode(mode);
          setCurrentPage(1);
        }}
        onPageChange={(p) => setCurrentPage(p)}
        onOpenAddCamera={() => setIsAddCameraModalOpen(true)}
        onOpenAddNvr={() => setIsAddNvrModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Dynamic Multi-Channel Camera Grid */}
      <div className={`grid gap-3 ${gridColsClass}`}>
        {visibleFeeds.map((feed) => (
          <CctvFeedViewport
            key={feed.id}
            feed={feed}
            isStreaming={!pausedFeedIds.has(feed.id)}
            isSelected={selectedCamera?.id === feed.id}
            streamError={!!streamErrorMap[feed.id]}
            currentTime={currentTime}
            layoutMode={layoutMode}
            liveDetections={liveDetections[feed.id]}
            onToggleStream={() => handleToggleStream(feed.id)}
            onInspect={() => setInspectModalFeed(feed)}
            onTriggerAlert={() => onTriggerAlert(feed)}
            onSelectCamera={() => {
              onSelectCamera(feed);
              setInspectModalFeed(feed);
            }}
            onRetryStream={() => handleRetryStream(feed.id)}
            onTelemetryUpdate={handleTelemetryUpdate}
            getSnapshotUrl={getSnapshotUrlWrapper}
          />
        ))}
      </div>

      {/* Inspect Channel Modal */}
      {inspectModalFeed && (
        <CctvInspectModal
          feed={inspectModalFeed}
          onClose={() => setInspectModalFeed(null)}
          matrixStatus={matrixStatus}
          liveDetections={liveDetections[inspectModalFeed.id]}
          currentTime={currentTime}
          getSnapshotUrl={getSnapshotUrl}
          onOpenNimbus={onOpenNimbus}
          onRefreshCameras={onRefreshCameras}
        />
      )}

      {/* Add Camera Modal */}
      <CctvAddCameraModal
        isOpen={isAddCameraModalOpen}
        onClose={() => setIsAddCameraModalOpen(false)}
        onSuccess={onRefreshCameras}
      />

      {/* Add NVR Gateway Modal */}
      <CctvAddNvrModal
        isOpen={isAddNvrModalOpen}
        onClose={() => setIsAddNvrModalOpen(false)}
        onSuccess={onRefreshCameras}
      />

      {/* Auto-Sync NVR Channels Modal */}
      <CctvSyncChannelsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={onRefreshCameras}
      />
    </div>
  );
};

export default CctvMatrix;
