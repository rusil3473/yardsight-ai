import { Eye, Video, Globe } from 'lucide-react';

interface YardHeaderProps {
  marketMode: string;
  setMarketMode: (val: string) => void;
}

export const YardHeader: React.FC<YardHeaderProps> = ({ marketMode, setMarketMode }) => {
  return (
    <header className="glass-panel" style={{ padding: '16px 26px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, hsl(158, 64%, 48%), hsl(187, 85%, 45%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px hsla(158, 64%, 52%, 0.4)'
          }}>
            <Eye size={26} color="#050811" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>YardSight AI (GodownOS)</h1>
              <span className="badge badge-primary">Amazon $138k</span>
              <span className="badge badge-cyan">Nebius x NVIDIA $50k</span>
              <span className="badge" style={{ background: 'hsla(38, 92%, 50%, 0.15)', color: 'var(--warning)' }}>
                OpenCV AI AWS
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Multi-Camera Edge Computer Vision • OpenCV 5 Homography • Specular Leak Detection • Alexa+ MCP
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Streams indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary)', background: 'hsla(158, 64%, 52%, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <span className="rec-dot"></span>
            <Video size={14} />
            <span>4/4 CCTV Feeds Online</span>
          </div>

          {/* Market Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'hsla(215, 30%, 16%, 0.8)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Globe size={15} color="var(--primary)" />
            <select
              value={marketMode}
              onChange={(e) => setMarketMode(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.84rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="India" style={{ background: '#09101f' }}>India (Bhiwandi / APMC Godowns & E-Way Bill)</option>
              <option value="US" style={{ background: '#09101f' }}>US (Interstate Freight Hub & eBOL)</option>
            </select>
          </div>

        </div>

      </div>
    </header>
  );
};
