import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

export default function BarChartComp({ title, subtitle, items = [] }: { title?: string; subtitle?: string; items?: Array<{ label: string; value: number; color?: string }> }) {
  if (!items || !items.length) return null;
  const colors = ['#F5A623', 'rgba(245,166,35,0.5)', 'rgba(245,166,35,0.3)'];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '16px 20px'
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
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items.map(i => ({ name: i.label, value: i.value }))} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              height={30}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{
                    background: '#1a1714',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{label}</div>
                    <div style={{ color: '#F5A623', fontWeight: 600 }}>{payload[0].value}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {items.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color ? entry.color : colors[index % 2]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { BarChartComp };
