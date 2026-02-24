import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid, Area } from 'recharts';

export default function LineChartComp({ title, subtitle, points = [] }:{ title?:string; subtitle?:string; points?:Array<{x:string;y:number}> }){
  if(!points || !points.length) return null;
  return (
    <div style={{background:'#1a1714',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20}}>
      {title ? <div style={{color:'#fff',fontWeight:700}}>{title}</div> : null}
      {subtitle ? <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginBottom:8}}>{subtitle}</div> : null}
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points.map(p=>({x:p.x,y:p.y}))}>
            <XAxis dataKey="x" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} />
            <Tooltip wrapperStyle={{background:'#1a1714',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8}} contentStyle={{color:'#fff'}} />
            <Line type="monotone" dataKey="y" stroke="#F5A623" strokeWidth={2} dot={{r:4,fill:'#F5A623'}} />
            <CartesianGrid vertical={false} horizontal={true} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { LineChartComp };
