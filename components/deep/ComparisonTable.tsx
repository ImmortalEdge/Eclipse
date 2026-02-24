import React from 'react';

export default function ComparisonTable({ title, items = [], rows = [] }: { title?: string; items?: string[]; rows?: Array<{ label: string; values: string[]; winner?: number }> }) {
  if (!items || !items.length || !rows || !rows.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '16px 20px',
      overflowX: 'auto'
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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}></th>
            {items.map((it, i) => (
              <th key={i} style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 400
              }}>
                {it}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{
                padding: '12px 16px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 400
              }}>
                {r.label}
              </td>
              {r.values.map((v, ci) => (
                <td key={ci} style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: 13,
                  color: r.winner === ci ? '#F5A623' : 'rgba(255,255,255,0.6)',
                  fontWeight: r.winner === ci ? 500 : 400
                }}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ComparisonTable };
