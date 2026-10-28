import type { CameraFeed, VlmChatMessage } from '../../types';

export const INITIAL_CAMERAS: CameraFeed[] = Array.from({ length: 8 }, (_, i) => {
  const ch = i + 1;
  const pad = String(ch).padStart(2, '0');
  return {
    id: `CAM-${pad}`,
    name: `Channel ${pad}`,
    location: `Channel ${pad}`,
    rtspUrl: `DMSS://BE124E0PCA95532?channel=${ch}`,
    status: 'ONLINE',
    fps: 30,
    resolution: ch === 1 ? '2560x1440 (2.5K Quad HD)' : '1080p (1920x1080)',
    cameraAngle: `NVR CH-${pad}`,
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
