import { Droplets } from 'lucide-react';

interface LeakProps {
  leakData: any;
  rainIntensity: number;
  onIntensityChange: (val: number) => void;
}

export const PuddleLeakInspector: React.FC<LeakProps> = ({
  leakData,
  rainIntensity,
  onIntensityChange
}) => {
  if (!leakData) return null;

  const metrics = leakData.metrics;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Droplets size={22} color="var(--cyan)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Concrete Specular Reflection & Roof Leak Detector</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Detects diffuse albedo drop and overhead tube light glare on concrete floors to prevent monsoon inventory spoilage.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Simulate Rain Seepage:</div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={rainIntensity}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            style={{ width: '130px', cursor: 'pointer' }}
          />
          <span className="badge badge-cyan">{Math.round(rainIntensity * 100)}% Intensity</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
        
        {/* Visual Analysis Mask Box */}
        <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '220px', position: 'relative' }}>
          <img
            src={leakData.analysis_overlay_b64}
            alt="Puddle Analysis Overlay"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            background: 'rgba(0,0,0,0.75)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.74rem',
            color: '#f87171',
            fontFamily: 'var(--font-mono)'
          }}>
            [SPECULAR PEAKS DETECTED]: {metrics.specular_peaks_count} High-Luminance Pixels
          </div>
        </div>

        {/* Real-Time Metrics & Threat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{
            background: 'hsla(0, 84%, 60%, 0.1)',
            border: '1px solid hsla(0, 84%, 60%, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Anomaly Status
              </span>
              <span className="badge badge-critical">{metrics.severity}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {metrics.estimated_surface_area_sqm} m² Wet Concrete
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Accumulation Rate: <strong style={{ color: 'var(--cyan)' }}>{leakData.leak_rate_liters_per_hour} Liters/Hour</strong>
            </div>
          </div>

          <div style={{
            background: 'hsla(215, 30%, 14%, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Threatened Inventory in Splash Radius
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fca5a5' }}>
              {leakData.threatened_inventory}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              *Proactive automated WhatsApp alert dispatched to Warehouse Night Supervisor.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
