import { describe, it, expect, vi, beforeEach } from 'vitest';
import { yardApi, setAuthToken, clearAuthToken, getAuthToken } from './yardApi';

describe('YardSight Standard API Client', () => {
  beforeEach(() => {
    clearAuthToken();
    vi.restoreAllMocks();
  });

  it('manages auth tokens in localStorage', () => {
    expect(getAuthToken()).toBeNull();
    setAuthToken('test_jwt_token_123');
    expect(getAuthToken()).toBe('test_jwt_token_123');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  it('handles successful API responses via StandardApiClient', async () => {
    const mockHealth = { status: 'ONLINE', scale_limiter: '100,000' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockHealth,
    } as any);

    const res = await yardApi.checkHealth();
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('ONLINE');
    }
  });

  it('invokes OpenCV ANPR unwarp endpoint correctly', async () => {
    const mockAnpr = {
      plate_number: 'MH 12 RN 4589',
      country: 'IN',
      confidence_pct: 98.5,
      raw_cctv_b64: 'data:image/jpeg;base64,...',
      unwarped_plate_b64: 'data:image/jpeg;base64,...',
      clahe_enhanced_b64: 'data:image/jpeg;base64,...',
      homography_matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      is_valid_format: true,
      processing_time_ms: 12.4,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockAnpr,
    } as any);

    const res = await yardApi.unwarpPlate({ plate_hint: 'MH 12 RN 4589', country: 'IN' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.plate_number).toBe('MH 12 RN 4589');
      expect(res.data.is_valid_format).toBe(true);
      expect(res.data.homography_matrix).toBeDefined();
    }
  });

  it('invokes Nebius VLM reasoning endpoint correctly', async () => {
    const mockVlm = {
      id: 'vlm-12345',
      role: 'assistant',
      content: '[VLM Spatial Analysis | Gate North]: Inbound truck cleared.',
      timestamp: '2026-10-09T00:00:00Z',
      model: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
      referenced_camera_id: 'cam-01',
      latency_ms: 84.2,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockVlm,
    } as any);

    const res = await yardApi.chatVlm({ prompt: 'Summarize Gate North traffic' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.role).toBe('assistant');
      expect(res.data.model).toBe('meta-llama/Llama-3.2-11B-Vision-Instruct');
    }
  });

  it('transforms 403 HTTP errors into RFC 7807 Problem Details envelope', async () => {
    const rfcError = {
      type: 'https://standards.hackathon.dev/errors/rbac-permission-denied',
      title: 'Permission Denied',
      status: 403,
      detail: "Role 'guard' lacks required permission 'documents:generate'",
      code: 'RBAC_PERMISSION_DENIED',
      userHint: 'You do not have permission to perform this action.',
      traceId: 'trc_12345678',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/problem+json' }),
      json: async () => rfcError,
    } as any);

    const res = await yardApi.generateDocument({ truck_id: 'TRK-1', doc_type: 'GST_EWAY_BILL' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('RBAC_PERMISSION_DENIED');
      expect(res.error.status).toBe(403);
      expect(res.error.userHint).toContain('You do not have permission');
    }
  });
});
