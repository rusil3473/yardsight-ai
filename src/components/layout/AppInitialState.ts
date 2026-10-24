import type { CameraFeed, VlmChatMessage } from '../../types';

export const CHANNEL_NAMES: Record<number, { name: string; loc: string; res: string }> = {
  1: { name: 'Gate 01 Inbound ANPR & Optical Inspection', loc: 'Inbound Gate 01 - South Portal', res: '2560x1440 (2.5K Quad HD)' },
  2: { name: 'Loading Dock 3 (Intermodal Bay)', loc: 'Warehouse Central High-Bay', res: '1080p (1920x1080)' },
  3: { name: 'Chemical & Hazardous Hazmat Staging', loc: 'Bay 4 Concrete Apron (East)', res: '1080p (1920x1080)' },
  4: { name: 'Outbound Weighbridge & Scale Apron', loc: 'West Staging Apron', res: '1080p (1920x1080)' },
};

export const INITIAL_CAMERAS: CameraFeed[] = Array.from({ length: 32 }, (_, i) => {
  const ch = i + 1;
  const def = CHANNEL_NAMES[ch] || {
    name: `Facility Monitoring Zone ${String.fromCharCode(65 + ((ch - 1) % 26))}${Math.floor((ch - 1) / 26) + 1}`,
    loc: `Facility Zone ${String.fromCharCode(65 + ((ch - 1) % 26))}`,
    res: '1080p (1920x1080)',
  };
  return {
    id: `CAM-${String(ch).padStart(2, '0')}`,
    name: def.name,
    location: def.loc,
    rtspUrl: `DMSS://BE124E0PCA95532?channel=${ch}`,
    status: 'ONLINE',
    fps: ch === 3 ? 25 : 30,
    resolution: def.res,
    cameraAngle: `NVR CH-${String(ch).padStart(2, '0')}`,
    detections: [],
  };
});

export const INITIAL_VLM_MESSAGES: VlmChatMessage[] = [
  {
    id: 'vlm-init-1',
    role: 'assistant',
    content: `YardSight VLM operational reasoning agent online. Connected to Nebius AI Studio (Llama-3.2-11B-Vision-Instruct) with automatic spatial reasoning fallback. Powered by OpenCV 4.10 perspective homography and specular albedo leak physics. Ask me anything about yard operations, license plates, dwell SLAs, or fluid containment.`,
    timestamp: new Date().toISOString(),
  },
];
