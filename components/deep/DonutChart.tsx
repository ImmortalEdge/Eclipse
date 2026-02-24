import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DonutChart({ title, segments = [] }:{ title?:string; segments?:Array<{label:string; value:number}> }){
  if(!segments || !segments.length) return null;
  const colors = ['#F5A623','#E8880A','#FFD166','rgba(245,166,35,0.5)','rgba(245,166,35,0.3)'];
  const total = segments.reduce((s:any,i:any)=>s+i.value,0);
  return (
    <div style={{background:'#1a1714',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20,textAlign:'center'}}>
      {title ? <div style={{color:'#fff',fontWeight:700}}>{title}</div> : null}
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
              {segments.map((entry,idx)=>(<Cell key={idx} fill={colors[idx % colors.length]} />))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{color:'#fff',fontSize:20,fontWeight:700,marginTop:8}}>{total}</div>
      <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:8}}>
        {segments.map((s,idx)=>(<div key={idx} style={{display:'flex',gap:8,alignItems:'center',color:'rgba(255,255,255,0.6)'}}><div style={{width:10,height:10,background:colors[idx % colors.length],borderRadius:6}} />{s.label}</div>))}
      </div>
    </div>
  );
}

export { DonutChart };
