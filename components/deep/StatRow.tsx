import React from 'react';

export default function StatRow({ stats = [] }: { stats: Array<{ label: string, value: string, note?: string, trend?: 'up' | 'down' | null }> }) {
  if (!stats || !stats.length) return null;
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
      {stats.slice(0, 4).map((s, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: '16px 20px',
          flex: '1 1 calc(25% - 10px)',
          minWidth: 160,
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{s.label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginTop: 4, lineHeight: 1 }}>{s.value}</div>
          {s.note ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontStyle: 'italic' }}>{s.note}</div> : null}
        </div>
      ))}
    </div>
  );
}

export { StatRow };
