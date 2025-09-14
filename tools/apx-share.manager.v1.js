
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['reserveHomeGB',8],['interval',5000]]);
  const SHARE='tools/apx-share.nano.v1.js';
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; out.push(h);}catch{} } return out; }
  function free(host){ const max=ns.getServerMaxRam(host), used=ns.getServerUsedRam(host); const keep=(host==='home')? (Number(F.reserveHomeGB)||8) : 0; return Math.max(0, Math.floor(max-used-keep)); }
  while(true){
    try{
      for(const h of rooted()){
        const have=ns.ps(h).some(p=>p.filename===SHARE);
        if(!have && free(h) >= (ns.getScriptRam(SHARE,'home')||2)) ns.exec(SHARE,h,1);
      }
    }catch{}
    await ns.sleep(Math.max(1000,Number(F.interval)||5000));
  }
}
