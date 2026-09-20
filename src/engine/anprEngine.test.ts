import { describe, it, expect } from 'vitest';
import { parsePlate, computeHomographyMatrix } from './anprEngine';

describe('anprEngine', () => {
  it('identifies and normalizes valid Indian HSRP license plates', () => {
    const result = parsePlate('MH 12 RN 4589', 'IN');
    expect(result.isValid).toBe(true);
    expect(result.country).toBe('IN');
    expect(result.stateOrRegion).toBe('Maharashtra');
    expect(result.confidence).toBeGreaterThan(0.95);
  });

  it('identifies and parses North American US DOT plates', () => {
    const result = parsePlate('TX 942-WKY', 'US');
    expect(result.isValid).toBe(true);
    expect(result.country).toBe('US');
    expect(result.stateOrRegion).toBe('Texas');
    expect(result.confidence).toBeGreaterThan(0.95);
  });

  it('computes 3x3 homography matrix for 4 corner coordinates', () => {
    const corners: [number, number][] = [
      [10, 10],
      [110, 15],
      [105, 60],
      [8, 55],
    ];

    const H = computeHomographyMatrix(corners);
    expect(H).toHaveLength(3);
    expect(H[0]).toHaveLength(3);
    expect(H[2][2]).toBe(1.0);
  });
});
