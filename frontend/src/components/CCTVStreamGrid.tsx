import { Camera, ShieldAlert } from 'lucide-react';

interface CCTVGridProps {
  anprData: any;
  leakData: any;
  onSelectFeed: (feedId: string) => void;
  activeFeed: string;
}

export const CCTVStreamGrid: React.FC<CCTVGridProps> = ({
  anprData,
  leakData,
  onSelectFeed,
  activeFeed
}) => {
  const feeds = [
    {
      id: 'CAM-01',
      name: 'CAM 01 - Gate North ANPR',
      location: 'Main Entry Gate',
      status: 'ONLINE • VEHICLE DETECTED',
      badge: 'badge-primary',
      imgSrc: anprData?.raw_cctv_b64,
      overlayText: `Plate: ${anprData?.plate_number ?? 'MH-12-RN-4819'} (Confidence: 96.4%)`
    },
    {
      id: 'CAM-02',
      name: 'CAM 02 - Bay 01 Loading Dock',
      location: 'Dock Bay West',
      status: 'ONLINE • UNLOADING (45m)',
      badge: 'badge-cyan',
      imgSrc: null,
      fallbackText: 'Truck TX-49-B219 (Swift Trans) Unloading Pallet Batch 12/24'
    },
    {
      id: 'CAM-03',
      name: 'CAM 03 - Bay 03 Loading Dock',
      location: 'Dock Bay East',
      status: 'CRITICAL • DETENTION ALERT (2h 25m)',
      badge: 'badge-critical',
      imgSrc: null,
      fallbackText: 'Truck MH-12-RN-4819 Detained > 2 Hours! Accrued Fee: $31.25'
    },
    {
      id: 'CAM-04',
      name: 'CAM 04 - Interior Godown Floor',
      location: 'Storage Bay 2 (Cement & Grain)',
      status: leakData?.metrics?.severity ?? 'ONLINE • LEAK DETECTION',
      badge: 'badge-critical',
      imgSrc: leakData?.cctv_frame_b64,
      overlayText: `Puddle Area: ${leakData?.metrics?.estimated_surface_area_sqm ?? 3.4} m² • Leaking at ${leakData?.leak_rate_liters_per_hour ?? 42.5} L/hr`
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '22px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Multi-Camera CCTV Stream Grid</h3>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Click any stream to open deep computer vision inspection
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {feeds.map((f) => {
          const isSelected = activeFeed === f.id;
          return (
            <div
              key={f.id}
              onClick={() => onSelectFeed(f.id)}
              className="cctv-box"
              style={{
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? '0 0 20px hsla(158, 64%, 52%, 0.3)' : undefined
              }}
            >
              {/* Header inside stream */}
              <div className="cctv-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '4px' }}>
                  <span className="rec-dot"></span>
                  <span style={{ fontSize: '0.72rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>REC • {f.id}</span>
                </div>
                <span className={`badge ${f.badge}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {f.status.split('•')[0]}
                </span>
              </div>

              {/* Feed Image or Simulated Visual */}
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                {f.imgSrc ? (
                  <img
                    src={f.imgSrc}
                    alt={f.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#111827',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    {f.id === 'CAM-03' ? (
                      <ShieldAlert size={36} color="var(--danger)" style={{ marginBottom: '8px' }} />
                    ) : (
                      <Camera size={36} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    )}
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{f.fallbackText}</span>
                  </div>
                )}

                {/* Subtitle Bar at bottom of CCTV */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  padding: '16px 12px 6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.76rem', color: '#e2e8f0', fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    2026-09-22 03:40:00
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
