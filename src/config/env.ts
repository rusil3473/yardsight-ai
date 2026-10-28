/**
 * YardSight AI - Centralized Frontend Configuration
 * Reads from Vite environment variables (VITE_*) with local fallback defaults.
 */

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8001';

export const GO2RTC_URL: string =
  (import.meta as any).env?.VITE_GO2RTC_URL || 'http://127.0.0.1:1984';

export const WS_BASE_URL: string =
  (import.meta as any).env?.VITE_WS_URL || API_BASE_URL.replace(/^http/, 'ws');

export const RTSP_TUNNEL_PORT: number =
  Number((import.meta as any).env?.VITE_RTSP_TUNNEL_PORT) || 1554;
