import React from 'react';

export default function ProCon({ title, pros = [], cons = [] }:{ title?:string; pros?:string[]; cons?:string[] }){
  if((!pros || !pros.length) && (!cons || !cons.length)) return null;
  return (
    <div style={{background:'#1a1714',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20}}>
      {title ? <div style={{color:'#fff',fontWeight:700,marginBottom:8}}>{title}</div> : null}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'start'}}>
        <div>
          <div style={{color:'rgba(74,222,128,0.8)',fontWeight:700,marginBottom:6}}>ADVANTAGES</div>
          {pros.map((p,i)=>(<div key={i} style={{display:'flex',gap:8,alignItems:'center',color:'rgba(255,255,255,0.7)',fontSize:13,marginBottom:6}}><div style={{width:14,height:14,borderRadius:7,background:'rgba(74,222,128,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(74,222,128,0.9)'}}>✓</div>{p}</div>))}
        </div>
        <div>
          <div style={{color:'rgba(248,113,113,0.8)',fontWeight:700,marginBottom:6}}>CONSIDERATIONS</div>
          {cons.map((c,i)=>(<div key={i} style={{display:'flex',gap:8,alignItems:'center',color:'rgba(255,255,255,0.7)',fontSize:13,marginBottom:6}}><div style={{width:14,height:14,borderRadius:7,background:'rgba(248,113,113,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(248,113,113,0.9)'}}>✕</div>{c}</div>))}
        </div>
      </div>
    </div>
  );
}

export { ProCon };
