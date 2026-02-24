import React from 'react';

export default function Timeline({ title, events = [] }: { title?: string; events?: Array<{ date: string; title: string; description?: string }> }) {
  if (!events || !events.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '20px 24px'
    }}>
      {title ? (
        <div style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 16
        }}>
          {title}
        </div>
      ) : null}
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1, background: 'rgba(255,255,255,0.08)' }} />
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i === events.length - 1 ? 0 : 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 6,
              height: 6,
              border: '1.5px solid #F5A623',
              background: '#0a0908',
              borderRadius: '50%',
              marginLeft: -20,
              marginTop: 6,
              zIndex: 1
            }} />
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 10, color: '#F5A623', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{e.date}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginTop: 2 }}>{e.title}</div>
              {e.description ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{e.description}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Timeline };
