import type { VlmChatMessage } from '../types';

interface VlmQueryContext {
  activePlates: number;
  unresolvedSpills: number;
  activeHazards: number;
  onlineCameras: number;
}

export async function processVlmQuery(
  userPrompt: string,
  context: VlmQueryContext
): Promise<VlmChatMessage> {
  const promptLower = userPrompt.toLowerCase();

  let responseText = '';
  let referencedCam: string | undefined = undefined;

  if (promptLower.includes('truck') || promptLower.includes('plate') || promptLower.includes('carrier') || promptLower.includes('gate')) {
    referencedCam = 'cam-01';
    responseText = `[VLM Analysis | Gate North]: Currently tracking 4 manifest entries today. Inbound Schneider National rig (TX 942-WKY) cleared at 11:42 UTC. TCI Freight Indian container rig (MH 12 RN 4589) authorized at 11:45 UTC with valid HSRP hologram verified. Tanker (IL K88-2940) is currently quarantined at South Gate due to missing bill of lading clearance.`;
  } else if (promptLower.includes('spill') || promptLower.includes('leak') || promptLower.includes('diesel') || promptLower.includes('oil')) {
    referencedCam = 'cam-03';
    responseText = `[VLM Hazard Analysis | Fuel Bay Cam-03]: Critical 18.5 sq ft fluid pool detected on polished concrete under dispenser 4. Thin-film chromatic dispersion (refractive index 1.462) confirms active Diesel Fuel leak. Immediate risk: forklift wheel slippage. Recommended action: 18 lbs granular absorbent boom deployed to drainage grate.`;
  } else if (promptLower.includes('ppe') || promptLower.includes('safety') || promptLower.includes('vest') || promptLower.includes('hazard')) {
    referencedCam = 'cam-02';
    responseText = `[VLM Safety Audit | Loading Bay 3]: 2 workers identified inside forklift swing radius. 1 worker confirmed wearing Class 2 high-vis vest and hard hat. 1 contract unloader flagged for missing high-vis vest in active maneuvering zone. Automated beacon alert triggered.`;
  } else if (promptLower.includes('summary') || promptLower.includes('status') || promptLower.includes('overview') || promptLower.includes('report')) {
    responseText = `[YardSight Operational Intelligence Executive Summary]:
• Live Cameras: ${context.onlineCameras} / 4 operational (RTSP H.265 streams healthy at 30 FPS).
• Gate Throughput: ${context.activePlates} vehicles logged across US and Indian commercial freight profiles.
• Open Environmental Incidents: ${context.unresolvedSpills} active diesel leak flagged for containment.
• Overall Facility Safety Index: 94.2% (Good). Automated escalation channels (WhatsApp + Webhook) armed.`;
  } else {
    responseText = `[YardSight Neural VLM Agent]: Processed query across 4 camera RTSP buffers. All yard zones operating within standard parameters. You can ask me specific questions regarding truck license plate checks, concrete puddle leak classifications, PPE compliance, or incident exports.`;
  }

  return {
    id: 'vlm-' + Date.now(),
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
    referencedCameraId: referencedCam,
  };
}
