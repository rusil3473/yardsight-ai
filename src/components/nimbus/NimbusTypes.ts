export interface VehicleRecord {
  plate: string;
  carrier: string;
  gate: string;
  direction: string;
  timestamp: string;
  status: string;
  cargo: string;
  confidence: number;
  hsrp_verified: boolean;
  vehicle_type?: string;
}

export interface ProductionMetrics {
  facility_name: string;
  active_line: string;
  status: string;
  units_per_minute: number;
  total_briquettes_today: number;
  debris_filter_status: string;
  false_positives_prevented: number;
  power_draw_kw: number;
  temperature_celsius: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedCameraId?: string;
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'nimbus-init-1',
    role: 'assistant',
    content: `**Nimbus Autonomous Business Intelligence Engine Online.**\n\nI am continuously indexing live visual data across your 32 CCTV channels, Gate 1/2 ANPR cameras, and Briquette Line 01. You can ask me operational questions about inbound trucks, license plates, production throughput, or worker safety compliance.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    referencedCameraId: 'CAM-01',
  },
];

export const SAMPLE_QUESTIONS = [
  'Summarize inbound trucks and license plates today',
  'What is the current briquette production throughput?',
  'Audit worker safety and verify debris suppression',
  'Summarize Scale 1 weighbridge activity',
];
