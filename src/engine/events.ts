/**
 * YardSight AI - Decoupled Event System
 * Powered by @packages/events EventBus.
 * Eliminates tight component coupling and enables reactive operational workflows.
 */

import { defaultEventBus as eventBus } from '@packages/events';
import type { PlateRecord, SpillIncident, VlmChatMessage } from '../types';

export interface YardEvents {
  'anpr:plate-scanned': PlateRecord;
  'leak:detected': SpillIncident;
  'actuator:pump-triggered': { bayId: string; pumpId: string; timestamp: string };
  'vlm:query-completed': VlmChatMessage;
  'camera:selected': string;
  'view:navigate': string;
}

export { eventBus };
