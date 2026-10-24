/**
 * YardSight Schemas & Domain Error Catalog
 * Built using @packages/standards telemetry and entity schema templates.
 */

import {
  createEntitySchema,
  createTelemetrySchema,
  nameField,
  registerDomainError,
  z,
} from '@packages/standards';

// Register YardSight Domain Errors
registerDomainError('ANPR_PLATE_UNREADABLE', {
  status: 422,
  title: 'License Plate OCR Unreadable',
  userHint: 'Clean high-speed ANPR camera lens or re-trigger IR strobe lights.',
});

registerDomainError('SPILL_HAZARD_CRITICAL', {
  status: 409,
  title: 'Hazardous Chemical / Oil Spill Detected',
  userHint: 'Containment protocol locked barrier gates. Immediate HazMat dispatch required.',
});

// 1. ANPR Camera Detection Telemetry Schema
export const anprDetectionSchema = createTelemetrySchema(
  {
    plateText: z.string().min(2).max(12).toUpperCase().trim(),
    vehicleType: z.enum(['truck', 'tanker', 'van', 'forklift', 'sedan']).default('truck'),
    vehicleColor: z.string().default('unknown'),
    zoneId: z.string().min(1),
    speedKmh: z.number().nonnegative().optional(),
    isAuthorized: z.boolean().default(true),
  },
  { prefix: 'anpr' }
);

export type AnprDetection = z.infer<typeof anprDetectionSchema>;

// 2. Spill Hazard Detection Telemetry Schema
export const spillHazardSchema = createTelemetrySchema(
  {
    spillType: z.enum(['oil', 'diesel', 'chemical', 'hydraulic_fluid', 'water']),
    areaSqMeters: z.number().positive(),
    barrierGateClosed: z.boolean().default(true),
    zoneName: z.string().min(1),
  },
  { prefix: 'spl' }
);

export type SpillHazard = z.infer<typeof spillHazardSchema>;

// 3. Yard CCTV Camera Entity Schema
export const yardCameraSchema = createEntitySchema(
  {
    cameraName: nameField('Camera Name'),
    ipAddress: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IPv4 address'),
    rtspPort: z.number().int().default(554),
    zone: z.enum(['gate_inbound', 'gate_outbound', 'fuel_bay', 'loading_dock', 'storage_yard']),
    isActive: z.boolean().default(true),
  },
  { prefix: 'cam' }
);

export type YardCamera = z.infer<typeof yardCameraSchema>;
