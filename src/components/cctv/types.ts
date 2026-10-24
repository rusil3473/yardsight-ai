import type { CameraFeed } from '../../types';

export type CctvLayoutMode = '4' | '8' | '9' | '16' | 'all' | 'single';

export interface LiveDetectionBbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LiveDetectionEntity {
  id: string;
  track_id: number;
  label: string;
  state: string;
  velocity: number;
  confidence: number;
  bbox: LiveDetectionBbox;
}

export interface MatrixCameraStatus {
  camera_id: string;
  name: string;
  device_sn: string;
  channel: number;
  online: boolean;
  status: string;
  device_status?: string;
}

export interface MatrixStatus {
  nvr_online: boolean;
  nvr_serial: string;
  total_channels?: number;
  cameras: Record<string, MatrixCameraStatus>;
}

export interface CctvMatrixProps {
  feeds: CameraFeed[];
  selectedCamera: CameraFeed | null;
  onSelectCamera: (feed: CameraFeed) => void;
  onTriggerAlert: (feed: CameraFeed) => void;
  onRefreshCameras?: () => void;
  onOpenNimbus?: (camId: string) => void;
}
