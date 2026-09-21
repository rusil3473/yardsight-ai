import { useState } from 'react';
import { Cpu, Play, CheckCircle2, ChevronRight } from 'lucide-react';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPDrawerProps {
  tools: MCPTool[];
  onExecuteTool: (name: string, args: any) => Promise<any>;
}

export const MCPAgentDrawer: React.FC<MCPDrawerProps> = ({ tools, onExecuteTool }) => {
  const [selectedTool, setSelectedTool] = useState<string>('get_yard_overview');
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);

  const handleRun = async () => {
    setIsCalling(true);
    try {
      const res = await onExecuteTool(selectedTool, {});
      setToolOutput(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={22} color="var(--cyan)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Amazon Alexa+ Model Context Protocol (MCP) Server</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Self-hosted MCP specification (v2025-11-25) exposing yard cameras and telemetry to Alexa+ and AWS Bedrock agentic orchestrators.
            </p>
          </div>
        </div>
        <span className="badge badge-cyan">MCP Active • 5 Tools Registered</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Left: Tools List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
            Registered Agentic Tools
          </div>
          {tools.map((t) => {
            const isSelected = selectedTool === t.name;
            return (
              <div
                key={t.name}
                onClick={() => { setSelectedTool(t.name); setToolOutput(null); }}
                style={{
                  background: isSelected ? 'hsla(187, 85%, 53%, 0.12)' : 'hsla(215, 30%, 14%, 0.6)',
                  border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 700, color: isSelected ? 'var(--cyan)' : 'var(--text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {t.description.slice(0, 75)}...
                  </div>
                </div>
                <ChevronRight size={16} color={isSelected ? 'var(--cyan)' : 'var(--text-muted)'} />
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Execution Panel */}
        <div style={{ background: 'hsla(215, 30%, 10%, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOOL RUNNER</span>
              <button
                onClick={handleRun}
                disabled={isCalling}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', background: 'linear-gradient(135deg, hsl(187, 85%, 45%), hsl(200, 90%, 40%))' }}
              >
                <Play size={14} />
                <span>{isCalling ? 'Invoking MCP...' : `Execute ${selectedTool}`}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Tool schema payload:
            </div>
            <div className="telemetry-code" style={{ maxHeight: '160px', marginBottom: '12px' }}>
              {JSON.stringify(tools.find((t) => t.name === selectedTool)?.inputSchema ?? {}, null, 2)}
            </div>
          </div>

          {toolOutput && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Agent Output Response:</span>
              </div>
              <div className="telemetry-code" style={{ maxHeight: '160px' }}>
                {JSON.stringify(toolOutput, null, 2)}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
