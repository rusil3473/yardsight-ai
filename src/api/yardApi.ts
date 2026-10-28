/**
 * YardSight AI - Universal Standard API Client
 * Built using @packages/standards StandardApiClient and RFC 7807 Error Envelope.
 */

import { StandardApiClient } from '@packages/standards';
import type { YardCamera } from '../schemas/yardSchemas';
import { API_BASE_URL } from '../config/env';

export const API_BASE = API_BASE_URL;
const TOKEN_KEY = 'yardsight_auth_token';

let memoryToken: string | null = null;

export function getAuthToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return memoryToken;
  } catch {
    return memoryToken;
  }
}

export function setAuthToken(token: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // ignore
  }
  memoryToken = token;
}

export function clearAuthToken(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
  memoryToken = null;
}

export const client = new StandardApiClient({
  baseUrl: API_BASE,
  getToken: getAuthToken,
  onUnauthorized: () => {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  },
});

export const yardApi = {
  // 1. Health & Telemetry
  checkHealth: async () => {
    return client.get<{ status: string; database?: any; scale_limiter?: any }>('/api/health');
  },

  getScaleMetrics: async () => {
    return client.get<Record<string, any>>('/api/metrics/scale');
  },

  listTenants: async () => {
    return client.get<{ tenants: Array<{ tenant_id: string; name: string }> }>('/api/tenants');
  },

  // 2. Camera Management
  testCameraStream: async (streamData: {
    stream_type: string;
    stream_url?: string;
    dmss_serial?: string;
    dmss_channel?: number;
  }) => {
    return client.post<Record<string, any>>('/api/cameras/test-stream', streamData);
  },

  createCamera: async (payload: Partial<YardCamera> & Record<string, any>) => {
    return client.post<{ camera: Record<string, any> }>('/api/cameras', payload);
  },

  updateCamera: async (id: string, payload: Record<string, any>) => {
    return client.patch<{ camera: Record<string, any> }>(`/api/cameras/${id}`, payload);
  },

  deleteCamera: async (id: string) => {
    return client.delete<{ deleted_camera_id: string }>(`/api/cameras/${id}`);
  },

  // 3. OpenCV 4.10 / 5 ANPR Perspective Homography
  unwarpPlate: async (payload: {
    plate_hint?: string;
    country?: string;
    image_b64?: string;
    corner_points?: number[][];
  }) => {
    return client.post<{
      plate_number: string;
      country: string;
      confidence_pct: number;
      raw_cctv_b64: string;
      unwarped_plate_b64: string;
      clahe_enhanced_b64?: string;
      corners?: number[][];
      homography_matrix?: number[][];
      is_valid_format: boolean;
      format_details?: string;
      processing_time_ms: number;
    }>('/api/anpr/unwarp', payload);
  },

  detectAndRegisterPlate: async (payload: {
    plate_hint?: string;
    country?: string;
    image_b64?: string;
    corner_points?: number[][];
    tenant_id?: string;
    gate_id?: string;
    carrier_name?: string;
    driver_name?: string;
  }) => {
    return client.post<{
      status: string;
      message: string;
      unwarp: any;
      scan_record: any;
      truck: any;
      truck_created: boolean;
    }>('/api/anpr/detect-and-register', payload);
  },

  getAnprRecords: async (tenantId: string = 'TENANT-MY-HUB', limit: number = 50) => {
    return client.get<{ status: string; records: any[] }>(`/api/anpr/records?tenant_id=${tenantId}&limit=${limit}`);
  },

  correctAnprRecord: async (recordId: string, payload: {
    new_plate_number: string;
    tenant_id?: string;
    admin_user_id?: string;
  }) => {
    return client.patch<{ status: string; message: string; record: any }>(`/api/anpr/records/${recordId}`, payload);
  },

  getCameraTelemetry: async (cameraId: string) => {
    return client.get<{
      camera_id: string;
      timestamp: number;
      active_tracks_count: number;
      detections: Array<{
        id: string;
        track_id: number;
        label: string;
        state: string;
        velocity: number;
        confidence: number;
        bbox: { x: number; y: number; w: number; h: number };
      }>;
    }>(`/api/cameras/${cameraId}/telemetry`);
  },

  // 4. Nebius x NVIDIA Multimodal VLM Reasoning
  chatVlm: async (payload: {
    prompt: string;
    camera_id?: string;
    image_b64?: string;
    context?: Record<string, any>;
  }) => {
    return client.post<{
      id: string;
      role: string;
      content: string;
      timestamp: string;
      model: string;
      referenced_camera_id?: string;
      spatial_detections?: Array<Record<string, any>>;
      latency_ms: number;
    }>('/api/vlm/chat', payload);
  },

  // 5. Roof Moisture, Specular Albedo & Actuators
  getLeakStatus: async (intensity: number = 0.5) => {
    return client.get<{
      status: string;
      rain_intensity: number;
      wet_area_sqm: number;
      leak_rate_liters_per_hour: number;
      leak_severity: string;
      action_dispatched: string;
      metrics: {
        wet_pixels: number;
        estimated_surface_area_sqm: number;
        expansion_velocity_cm_per_min: number;
        severity: string;
        action_required: string;
      };
      cctv_frame_b64?: string;
    }>(`/api/leak/status?intensity=${intensity}`);
  },

  triggerPump: async (payload: { bay_id: string; pump_id?: string; initiated_by?: string }) => {
    return client.post<{
      status: string;
      action: string;
      target: string;
      message: string;
      timestamp: string;
    }>('/api/leak/actuator/pump', payload);
  },

  triggerForkliftDivert: async (payload: { bay_id: string; zone_name?: string; initiated_by?: string }) => {
    return client.post<{
      status: string;
      action: string;
      target: string;
      message: string;
      timestamp: string;
    }>('/api/leak/actuator/forklift', payload);
  },

  // 6. Document Generation (E-Way Bill & eBOL)
  generateDocument: async (payload: { truck_id: string; doc_type: string; tenant_id?: string }) => {
    return client.post<Record<string, any>>('/api/documents/generate', payload);
  },

  listDocuments: async (tenantId: string = 'TENANT-MY-HUB') => {
    return client.get<{ documents: Array<Record<string, any>> }>(`/api/documents/list?tenant_id=${tenantId}`);
  },

  deleteDocument: async (id: string) => {
    return client.delete<{ deleted_id: string }>(`/api/documents/${id}`);
  },

  // 7. Trucks & Facilities
  createTruck: async (truckData: Record<string, any>) => {
    return client.post<{ truck: Record<string, any> }>('/api/trucks', truckData);
  },

  updateTruck: async (id: string, truckData: Record<string, any>) => {
    return client.patch<{ truck: Record<string, any> }>(`/api/trucks/${id}`, truckData);
  },

  deleteTruck: async (id: string) => {
    return client.delete<{ deleted_id: string }>(`/api/trucks/${id}`);
  },

  // 8. Business Intelligence & ERP Gateway
  updateBusinessProfile: async (profile: Record<string, any>) => {
    return client.post<Record<string, any>>('/api/v1/business/profile', profile);
  },

  createProductionLine: async (lineData: Record<string, any>) => {
    return client.post<Record<string, any>>('/api/v1/production/lines', lineData);
  },

  ingestProductionLog: async (logData: Record<string, any>) => {
    return client.post<Record<string, any>>('/api/v1/production/logs', logData);
  },

  exportErp: async (formatType: 'json' | 'tally_xml' = 'json') => {
    return client.get<Record<string, any>>(`/api/v1/export/erp?format_type=${formatType}`);
  },
};
