import { describe, it, expect } from 'vitest';
import {
  anprDetectionSchema,
  spillHazardSchema,
  yardCameraSchema,
} from './yardSchemas';
import { validateOrThrow, DomainError } from '@packages/standards';

describe('YardSight Standard Schemas & Domain Errors', () => {
  it('validates anpr telemetry and auto-injects standard telemetry IDs and timestamps', () => {
    const parsed = validateOrThrow(anprDetectionSchema, {
      deviceId: 'cam_gate_01',
      readingType: 'anpr_plate',
      plateText: 'ka01mj4590',
      vehicleType: 'truck',
      zoneId: 'inbound_bay_1',
      confidence: 0.96,
    });

    expect(parsed.id).toMatch(/^anpr_/);
    expect(parsed.plateText).toBe('KA01MJ4590');
    expect(parsed.confidence).toBe(0.96);
    expect(parsed.isAuthorized).toBe(true);
    expect(parsed.timestamp).toBeDefined();
  });

  it('validates spill hazard alarms with critical severity', () => {
    const alarm = validateOrThrow(spillHazardSchema, {
      deviceId: 'cam_fuel_04',
      readingType: 'chemical_spill',
      spillType: 'diesel',
      areaSqMeters: 14.5,
      zoneName: 'Fuel Storage Bay 4',
      severity: 'critical',
    });

    expect(alarm.id).toMatch(/^spl_/);
    expect(alarm.spillType).toBe('diesel');
    expect(alarm.barrierGateClosed).toBe(true);
    expect(alarm.severity).toBe('critical');
  });

  it('formats registered domain errors into RFC 7807 problem details', () => {
    const err = new DomainError('ANPR_PLATE_UNREADABLE', 'Plate obstructed by mud');
    const problem = err.toProblemDetails();

    expect(problem.status).toBe(422);
    expect(problem.code).toBe('ANPR_PLATE_UNREADABLE');
    expect(problem.title).toBe('License Plate OCR Unreadable');
    expect(problem.userHint).toContain('Clean high-speed ANPR camera lens');
  });

  it('validates yard camera entity schema with standard ID prefix and timestamps', () => {
    const cam = validateOrThrow(yardCameraSchema, {
      cameraName: 'Gate Inbound PTZ',
      ipAddress: '192.168.1.100',
      zone: 'gate_inbound',
    });

    expect(cam.id).toMatch(/^cam_/);
    expect(cam.cameraName).toBe('Gate Inbound PTZ');
    expect(cam.rtspPort).toBe(554);
    expect(cam.isActive).toBe(true);
    expect(cam.createdAt).toBeDefined();
  });
});
