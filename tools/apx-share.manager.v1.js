
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['reserveHomeGB',8],['interval',5000]]);
  const SHARE='tools/apx-share.nano.v1.js';
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ if(ns.getServer(h).hasAdminRights) out.push(h);}catch{} } return out; }
  function free(host){ const max=ns.getServerMaxRam(host), used=ns.getServerUsedRam(host); const keep=(host==='home')?Number(F.reserveHomeGB||8):0; return Math.max(0, Math.floor(max-used-keep)); }
  while(true){
    for(const h of rooted()){
      try{
        if(!ns.fileExists(SHARE,h) && h!=='home') ns.scp(SHARE,h);
        if(!ns.ps(h).some(p=>p.filename===SHARE)){
          const cost=ns.getScriptRam(SHARE,'home')||4; const th=Math.floor(free(h)/cost);
          if(th>0) ns.exec(SHARE,h,th);
        }
      }catch{}
    }
    await ns.sleep(Math.max(1000, Number(F.interval)||5000));
  }
}
