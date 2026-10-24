
export interface HomographyResult {
  rawCctvB64: string;
  unwarpedPlateB64: string;
  claheEnhancedB64?: string;
  matrix?: number[][];
  latencyMs: number;
  formatDetails?: string;
  isValidFormat: boolean;
}

export const CORNER_PRESETS = {
  overhead35: {
    label: '35° Acute Overhead Tilt (Gate North)',
    corners: [[220.0, 180.0], [430.0, 205.0], [415.0, 270.0], [210.0, 240.0]],
  },
  slantedSide: {
    label: '25° Lateral Slant (Tractor-Trailer Bay)',
    corners: [[190.0, 160.0], [440.0, 195.0], [425.0, 280.0], [180.0, 250.0]],
  },
  orthogonal: {
    label: 'Calibrated Orthogonal (0° Perspective)',
    corners: [[180.0, 170.0], [420.0, 170.0], [420.0, 260.0], [180.0, 260.0]],
  },
};

export const validatePlateString = (val: string, country: 'US' | 'IN') => {
  const cleaned = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (country === 'IN') {
    const isValid = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(cleaned);
    return {
      isValid,
      desc: isValid ? 'HSRP Standard Verified' : 'Format: State + RTO + Series + 4 Digits'
    };
  } else {
    const isValid = cleaned.length >= 5 && cleaned.length <= 8;
    return {
      isValid,
      desc: isValid ? 'USDOT Commercial Standard' : 'Format: 5-8 alphanumeric characters'
    };
  }
};
