/** core/apx-core.micro.v2.09.js - simple micro deployer */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([['allRooted',true],['reserveRamPct',0.1],['target',''],['log',true]]);
  const print=(...a)=>{ if(F.log) ns.print('[core.micro]',...a); };
  const scripts=['workers/apx-loop-hgw.nano.js','workers/apx-h1.js','workers/apx-g1.js','workers/apx-w1.js'];
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); try{ const sv=ns.getServer(s); if(sv.hasAdminRights && s!=='home') out.push(s);}catch{} } return out; }
  function free(host){ const max=ns.getServerMaxRam(host), used=ns.getServerUsedRam(host); return Math.max(0,Math.floor(max-used)); }
  const target=String(F.target||'').trim();
  while(true){
    for(const h of rooted()){
      try{
        for(const f of scripts){ if(!ns.fileExists(f,h)) await ns.scp(f,h); }
        const max=ns.getServerMaxRam(h); if(max<=1.6) continue;
        const res=Math.max(0, free(h)); const cost=ns.getScriptRam(scripts[0],'home')||1.7; let th=Math.floor(res/cost);
        if(th<=0) continue;
        if(ns.ps(h).some(p=>p.filename===scripts[0])) continue;
        ns.exec(scripts[0],h,th, target||'n00dles');
        print('start',h,'th',th);
      }catch{}
      await ns.sleep(10);
    }
    await ns.sleep(5000);
  }
}
