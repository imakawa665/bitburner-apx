/** tools/apx-share.manager.v1.js (v1.0) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([['reserveHomeGB',8],['includeHacknet',false],['interval',5000],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[share.mgr]',...a); };
  const SHARE='tools/apx-share.nano.v1.js'; if(!ns.fileExists(SHARE,'home')){ ns.tprint('[share.mgr] missing',SHARE); return; }

  const rooted=()=>{
    const seen=new Set(); const q=['home']; const out=[];
    while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(h!=='home' && sv.purchasedByPlayer===false && sv.hostname.startsWith('hacknet') && !F.includeHacknet) continue; out.push(h);}catch{} }
    return out;
  };
  function freeRam(host){ const max=ns.getServerMaxRam(host), used=ns.getServerUsedRam(host); let free=max-used; if(host==='home') free=Math.max(0,free-Math.max(0,Number(F.reserveHomeGB)||8)); return Math.max(0, Math.floor(free)); }
  function runningOn(host){ return ns.ps(host).find(p=>p.filename===SHARE); }

  while(true){
    for(const h of rooted()){
      const free=freeRam(h); const cost=ns.getScriptRam(SHARE,'home')||1.6; const th=Math.floor(free/cost); if(th<=0) continue;
      if(runningOn(h)) continue;
      try{ if(h!=='home' && !ns.fileExists(SHARE,h)) await ns.scp(SHARE,h); const ok=ns.exec(SHARE,h,th); if(ok) log('start',h,'th',th); }catch{}
      await ns.sleep(10);
    }
    await ns.sleep(Math.max(1000, Number(F.interval)||5000));
  }
}
