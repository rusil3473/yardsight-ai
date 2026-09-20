import type { PlateRecord } from '../types';

// Standard Regex for Indian High Security Registration Plates (HSRP)
// Format: 2-letter State Code + 2-digit RTO Code + Optional 1-2 letters + 4-digit Unique Number
const INDIA_HSRP_REGEX = /^([A-Z]{2})\s*([0-9]{2})\s*([A-Z]{1,3})?\s*([0-9]{4})$/i;

// Standard North American Commercial & Passenger Plate Formats
// e.g. 7 characters alphanumeric with dash/space
const US_PLATE_REGEX = /^([A-Z0-9]{2,4})[- ]?([A-Z0-9]{3,4})$/i;

export interface PlateClassification {
  isValid: boolean;
  country: 'US' | 'IN' | 'UNKNOWN';
  stateOrRegion: string;
  normalizedPlate: string;
  confidence: number;
}

const INDIAN_STATE_CODES: Record<string, string> = {
  MH: 'Maharashtra',
  DL: 'Delhi NCR',
  GJ: 'Gujarat',
  KA: 'Karnataka',
  TN: 'Tamil Nadu',
  HR: 'Haryana',
  UP: 'Uttar Pradesh',
  RJ: 'Rajasthan',
  WB: 'West Bengal',
  AP: 'Andhra Pradesh',
  TS: 'Telangana',
};

const US_SAMPLE_PREFIXES: Record<string, string> = {
  TX: 'Texas',
  CA: 'California',
  IL: 'Illinois',
  NY: 'New York',
  GA: 'Georgia',
  OH: 'Ohio',
  FL: 'Florida',
  WA: 'Washington',
};

export function parsePlate(rawPlate: string, preferredCountryHint?: 'US' | 'IN'): PlateClassification {
  const clean = rawPlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Check Indian HSRP format
  const inMatch = rawPlate.trim().toUpperCase().match(INDIA_HSRP_REGEX);
  if (inMatch || (clean.length >= 8 && clean.length <= 10 && preferredCountryHint === 'IN')) {
    const stateCode = rawPlate.slice(0, 2).toUpperCase();
    const stateName = INDIAN_STATE_CODES[stateCode] || 'India (National Permit)';
    return {
      isValid: true,
      country: 'IN',
      stateOrRegion: stateName,
      normalizedPlate: rawPlate.trim().toUpperCase(),
      confidence: 0.984,
    };
  }

  // Check US Plate format
  const usMatch = rawPlate.trim().toUpperCase().match(US_PLATE_REGEX);
  if (usMatch || clean.length >= 5) {
    const prefix = clean.slice(0, 2);
    const stateName = US_SAMPLE_PREFIXES[prefix] || 'United States (USDOT)';
    return {
      isValid: true,
      country: 'US',
      stateOrRegion: stateName,
      normalizedPlate: rawPlate.trim().toUpperCase(),
      confidence: 0.976,
    };
  }

  return {
    isValid: false,
    country: 'UNKNOWN',
    stateOrRegion: 'Unrecognized',
    normalizedPlate: rawPlate,
    confidence: 0.42,
  };
}

/**
 * Calculates 3x3 Homography Matrix coefficients to rectify tilted plate angle
 * transforms 4 perspective corner points into an orthogonal rectangle
 */
export function computeHomographyMatrix(
  corners: [number, number][]
): number[][] {
  if (corners.length !== 4) {
    throw new Error('Homography requires exactly 4 corner coordinates.');
  }

  // Simplified perspective normalization transformation matrix
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = corners;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const sx = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sy = y0 - y1 + y2 - y3;

  const g = (sx * dy2 - dx2 * sy) / (dx1 * dy2 - dx2 * dy1 || 1);
  const h = (dx1 * sy - sx * dy1) / (dx1 * dy2 - dx2 * dy1 || 1);
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;

  return [
    [a, b, x0],
    [d, e, y0],
    [g, h, 1.0],
  ];
}

export const INITIAL_PLATE_RECORDS: PlateRecord[] = [
  {
    id: 'rec-01',
    plateNumber: 'TX 942-WKY',
    country: 'US',
    stateOrRegion: 'Texas',
    vehicleType: 'Heavy Tractor-Trailer',
    timestamp: '2026-09-20T11:42:15Z',
    confidence: 0.988,
    gateId: 'North Gate Inbound - Bay 1',
    status: 'authorized',
    driverName: 'Marcus Vance',
    carrier: 'Schneider National Logistics',
  },
  {
    id: 'rec-02',
    plateNumber: 'MH 12 RN 4589',
    country: 'IN',
    stateOrRegion: 'Maharashtra',
    vehicleType: 'Container Rig',
    timestamp: '2026-09-20T11:45:30Z',
    confidence: 0.992,
    gateId: 'North Gate Inbound - Bay 2',
    status: 'authorized',
    driverName: 'Rajesh Sharma',
    carrier: 'TCI Freight International',
  },
  {
    id: 'rec-03',
    plateNumber: 'IL K88-2940',
    country: 'US',
    stateOrRegion: 'Illinois',
    vehicleType: 'Tanker',
    timestamp: '2026-09-20T11:49:05Z',
    confidence: 0.965,
    gateId: 'South Gate Fuel Depot',
    status: 'flagged',
    driverName: 'Unknown / Unmanifested',
    carrier: 'Independent Contract Hauler',
  },
  {
    id: 'rec-04',
    plateNumber: 'DL 01 AB 9021',
    country: 'IN',
    stateOrRegion: 'Delhi NCR',
    vehicleType: 'Medium Duty Van',
    timestamp: '2026-09-20T11:51:22Z',
    confidence: 0.979,
    gateId: 'East Perimeter Gate',
    status: 'authorized',
    driverName: 'Amit Patel',
    carrier: 'Blue Dart Express Intermodal',
  },
];
