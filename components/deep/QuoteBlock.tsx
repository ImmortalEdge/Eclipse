import React from 'react';

export default function QuoteBlock({ text, author, source, date }:{ text?:string; author?:string; source?:string; date?:string }){
  if(!text) return null;
  const initials = author ? author.split(' ').map(s=>s[0]).slice(0,2).join('') : 'A';
  return (
    <div style={{background:'#1a1714',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:20,borderLeft:'2px solid rgba(245,166,35,0.4)'}}>
      <div style={{fontSize:48,color:'rgba(245,166,35,0.3)',lineHeight:0}}>“</div>
      <div style={{fontStyle:'italic',fontFamily:'serif',color:'rgba(255,255,255,0.8)',fontSize:16}}>{text}</div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12}}>
        <div style={{width:32,height:32,borderRadius:16,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>{initials}</div>
        <div>
          <div style={{fontSize:13,color:'#fff'}}>{author}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{source} {date ? '· ' + date : ''}</div>
        </div>
      </div>
    </div>
  );
}

export { QuoteBlock };
