import React from 'react';
import { MessageSquareQuote, Clock, Droplets, BellOff, ArrowRight } from 'lucide-react';

export const RedditLogisticsBanner: React.FC = () => {
  const problems = [
    {
      subreddit: 'r/Truckers',
      title: '14-Hour Gate Detention & Lost Paperwork',
      quote: 'The worst part of trucking is sitting at warehouse docks for 6-14 hours because bills of lading were lost or gate passes stalled.',
      icon: <Clock size={16} color="var(--danger)" />
    },
    {
      subreddit: 'r/logistics',
      title: 'Monsoon Roof Leaks Destroying Dry Inventory',
      quote: 'Every monsoon our rented godown gets unnoticed roof sheet leaks. Hundreds of bags of cement and grain are ruined before guards notice.',
      icon: <Droplets size={16} color="var(--cyan)" />
    },
    {
      subreddit: 'r/securityguards',
      title: '500 False CCTV Alerts / Day',
      quote: 'Motion cameras trigger continuously when cats walk by or headlights flash. Managers turn alerts off completely.',
      icon: <BellOff size={16} color="var(--warning)" />
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <MessageSquareQuote size={18} color="var(--primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Reddit Field Evidence & Operational Failures Solved</h3>
        <span className="badge badge-warning">Industry Pain Points</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {problems.map((p, i) => (
          <div
            key={i}
            style={{
              background: 'hsla(215, 30%, 15%, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '6px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{p.subreddit}</span>
                {p.icon}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{p.quote}"
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Autonomous AI Fix Active</span>
              <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
