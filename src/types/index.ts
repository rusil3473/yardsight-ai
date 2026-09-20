export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
}

export type IncidentSeverity = 'info' | 'warning' | 'critical';

export interface Detection {
  id: string;
  timestamp: string;
  type: 'plate' | 'spill' | 'ppe_violation' | 'perimeter_breach' | 'forklift_hazard';
  confidence: number;
  bbox: BoundingBox;
  label: string;
  severity: IncidentSeverity;
  metadata?: Record<string, string | number | boolean>;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  rtspUrl: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  fps: number;
  resolution: string;
  detections: Detection[];
  cameraAngle: string;
}

export interface PlateRecord {
  id: string;
  plateNumber: string;
  country: 'US' | 'IN';
  stateOrRegion: string;
  vehicleType: 'Heavy Tractor-Trailer' | 'Container Rig' | 'Medium Duty Van' | 'Tanker';
  timestamp: string;
  confidence: number;
  gateId: string;
  status: 'authorized' | 'flagged' | 'quarantine';
  driverName?: string;
  carrier: string;
}

export interface SpillIncident {
  id: string;
  cameraId: string;
  surfaceType: 'Polished Concrete' | 'Porous Asphalt' | 'Loading Bay Ramp';
  spillType: 'Diesel Fuel' | 'Hydraulic Fluid' | 'Rainwater Puddle' | 'Engine Coolant';
  estimatedAreaSqFt: number;
  refractiveIndex: number;
  confidence: number;
  timestamp: string;
  severity: IncidentSeverity;
  status: 'active' | 'containment_dispatched' | 'neutralized';
}

export interface VlmChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedCameraId?: string;
  evidenceFrameUrl?: string;
}
