import { describe, it, expect } from 'vitest';
import { analyzeSpecularReflection } from './spillDetector';

describe('spillDetector engine', () => {
  it('classifies high chromatic dispersion as hazardous hydrocarbon', () => {
    const analysis = analyzeSpecularReflection(160, 62, 'Polished Concrete');
    expect(analysis.isHazardousHydrocarbon).toBe(true);
    expect(analysis.spillCategory).toBe('Diesel Fuel');
    expect(analysis.refractiveIndex).toBeGreaterThan(1.4);
    expect(analysis.recommendedAbsorbentLbs).toBeGreaterThan(0);
  });

  it('classifies low chromatic dispersion as non-hazardous rainwater', () => {
    const analysis = analyzeSpecularReflection(90, 12, 'Polished Concrete');
    expect(analysis.isHazardousHydrocarbon).toBe(false);
    expect(analysis.spillCategory).toBe('Rainwater Puddle');
    expect(analysis.refractiveIndex).toBeCloseTo(1.333, 2);
    expect(analysis.recommendedAbsorbentLbs).toBe(0);
  });
});
