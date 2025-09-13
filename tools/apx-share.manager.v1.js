
/** tools/apx-share.manager.v1.js (v1.0)
 * すべてのルート済みサーバに Share を1本ずつ展開し、余剰RAMを全投入。
 * --reserveHomeGB <n> (default 8)  Homeに残す
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['reserveHomeGB',8],['includeHacknet',false],['interval',5000]]);
  const SHARE='tools/apx-share.nano.v1.js';
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); } for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; out.push(h);}catch{} } return out; }
  function free(host){ const m=ns.getServerMaxRam(host), u=ns.getServerUsedRam(host); let f=m-u; if(host==='home') f=Math.max(0,f-(Number(F.reserveHomeGB)||8)); return Math.floor(f); }
  function running(host){ return ns.ps(host).some(p=>p.filename===SHARE); }
  while(true){
    for(const h of rooted()){
      const th = Math.floor(free(h) / (ns.getScriptRam(SHARE,'home')||1.6));
      if(th<=0 || running(h)) continue;
      try{ if(h!=='home' && !ns.fileExists(SHARE,h)) await ns.scp(SHARE,h); ns.exec(SHARE,h,th); }catch{}
      await ns.sleep(10);
    }
    await ns.sleep(Math.max(1000,Number(F.interval)||5000));
  }
}
