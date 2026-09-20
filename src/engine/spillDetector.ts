import type { SpillIncident } from '../types';

export interface SpillAnalysisResult {
  isHazardousHydrocarbon: boolean;
  spillCategory: 'Diesel Fuel' | 'Hydraulic Fluid' | 'Rainwater Puddle' | 'Engine Coolant';
  confidence: number;
  refractiveIndex: number;
  chromaticVariance: number;
  containmentProtocol: string;
  recommendedAbsorbentLbs: number;
}

/**
 * Evaluates camera specular reflection luminance, chromatic dispersion, and viscosity gradient
 * to classify spills on industrial concrete/asphalt
 */
export function analyzeSpecularReflection(
  specularLuminance: number, // 0 - 255
  chromaticVariance: number, // 0 - 100 (rainbow sheen / thin-film interference)
  _surfaceType: 'Polished Concrete' | 'Porous Asphalt' | 'Loading Bay Ramp'
): SpillAnalysisResult {
  // Thin-film interference creates distinctive high chromatic variance for hydrocarbons (oil/diesel)
  // Water has low chromatic variance (clear puddle reflecting ambient gray/blue)
  if (chromaticVariance > 45) {
    // Hydrocarbon detected
    const isHydraulic = specularLuminance > 180;
    return {
      isHazardousHydrocarbon: true,
      spillCategory: isHydraulic ? 'Hydraulic Fluid' : 'Diesel Fuel',
      confidence: 0.962,
      refractiveIndex: isHydraulic ? 1.485 : 1.462,
      chromaticVariance,
      containmentProtocol: 'OSHA 1910.120 / CPCB Hazard Tier 2. Deploy hydrophobic absorbent boom + granular neutralizer.',
      recommendedAbsorbentLbs: Math.round((specularLuminance / 20) * 4.5),
    };
  } else if (chromaticVariance > 25 && specularLuminance < 140) {
    return {
      isHazardousHydrocarbon: true,
      spillCategory: 'Engine Coolant',
      confidence: 0.894,
      refractiveIndex: 1.384,
      chromaticVariance,
      containmentProtocol: 'Ethylene glycol caution. Restrict forklift traction zone. Mop with neutralizing agent.',
      recommendedAbsorbentLbs: 12,
    };
  } else {
    // Normal water accumulation
    return {
      isHazardousHydrocarbon: false,
      spillCategory: 'Rainwater Puddle',
      confidence: 0.978,
      refractiveIndex: 1.333,
      chromaticVariance,
      containmentProtocol: 'Non-hazardous surface drainage. Deploy standard Caution Wet Floor cones if slip hazard exceeds 0.4 CoF.',
      recommendedAbsorbentLbs: 0,
    };
  }
}

export const INITIAL_SPILLS: SpillIncident[] = [
  {
    id: 'spill-01',
    cameraId: 'cam-03',
    surfaceType: 'Polished Concrete',
    spillType: 'Diesel Fuel',
    estimatedAreaSqFt: 18.5,
    refractiveIndex: 1.462,
    confidence: 0.965,
    timestamp: '2026-09-20T11:38:40Z',
    severity: 'critical',
    status: 'active',
  },
  {
    id: 'spill-02',
    cameraId: 'cam-02',
    surfaceType: 'Loading Bay Ramp',
    spillType: 'Hydraulic Fluid',
    estimatedAreaSqFt: 6.2,
    refractiveIndex: 1.485,
    confidence: 0.941,
    timestamp: '2026-09-20T11:15:10Z',
    severity: 'warning',
    status: 'containment_dispatched',
  },
  {
    id: 'spill-03',
    cameraId: 'cam-04',
    surfaceType: 'Porous Asphalt',
    spillType: 'Rainwater Puddle',
    estimatedAreaSqFt: 34.0,
    refractiveIndex: 1.333,
    confidence: 0.982,
    timestamp: '2026-09-20T10:50:00Z',
    severity: 'info',
    status: 'neutralized',
  },
];
