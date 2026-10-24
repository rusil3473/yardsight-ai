import {
  LayoutDashboard,
  Video,
  Scan,
  Bot,
  Truck,
  FileText,
  Droplets,
  Settings,
  Factory,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

export type TabId =
  | 'home'
  | 'video'
  | 'nimbus'
  | 'anpr'
  | 'vlm'
  | 'leak'
  | 'production'
  | 'track'
  | 'eway_bills'
  | 'scale';

export interface NavItemConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge: string | null;
  badgeColor?: string;
  description: string;
}

export function getSidebarNavItems(
  cameraCount: number = 4,
  detentionCount: number = 0,
  hasLeak: boolean = false
): NavItemConfig[] {
  return [
    {
      id: 'home',
      label: 'Logistics Command',
      icon: LayoutDashboard,
      badge: null,
      description: 'KPIs, real-time yard digital twin'
    },
    {
      id: 'video',
      label: 'Live CCTV Matrix',
      icon: Video,
      badge: cameraCount > 0 ? `${cameraCount} LIVE` : null,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      description: 'Multi-RTSP CCTV 4-Grid surveillance'
    },
    {
      id: 'nimbus',
      label: 'Nimbus AI Hub',
      icon: Sparkles,
      badge: 'INTELLIGENCE',
      badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      description: 'Multimodal business context & Q&A'
    },
    {
      id: 'anpr',
      label: 'OpenCV 4.10 ANPR',
      icon: Scan,
      badge: 'HOMOGRAPHY',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      description: '4-corner rectification & 3x3 matrix'
    },
    {
      id: 'vlm',
      label: 'Nebius VLM Agent',
      icon: Bot,
      badge: 'NVIDIA AI',
      badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      description: 'Multimodal spatial reasoning agent'
    },
    {
      id: 'leak',
      label: 'Concrete Specular Leaks',
      icon: Droplets,
      badge: hasLeak ? 'CRITICAL' : null,
      badgeColor: 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse',
      description: 'Hydrocarbon leak & pump actuators'
    },
    {
      id: 'production',
      label: 'FactoryOS & Energy',
      icon: Factory,
      badge: 'AI BI',
      badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      description: 'SEC benchmarks & Energy OCR'
    },
    {
      id: 'track',
      label: 'Fleet & Dock Dwell',
      icon: Truck,
      badge: detentionCount > 0 ? `${detentionCount} ALERT` : null,
      badgeColor: 'bg-red-500/15 text-red-400 border border-red-500/30',
      description: 'Turnaround SLAs & detention prevention'
    },
    {
      id: 'eway_bills',
      label: 'E-Way Bills & eBOL',
      icon: FileText,
      badge: null,
      description: 'Statutory GST & US eBOL transit'
    },
    {
      id: 'scale',
      label: 'Scale & Governance',
      icon: Settings,
      badge: null,
      description: '100k rate limits & audit trail'
    }
  ];
}
