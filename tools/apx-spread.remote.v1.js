/** tools/apx-spread.remote.v1.js - copy workers + start micro loop on rooted servers */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['target',''],['log',true]]);
  const scripts=['workers/apx-loop-hgw.nano.js','workers/apx-h1.js','workers/apx-g1.js','workers/apx-w1.js'];
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); try{ const sv=ns.getServer(s); if(sv.hasAdminRights && s!=='home') out.push(s);}catch{} } return out; }
  for(const h of rooted()){ try{ for(const f of scripts){ if(!ns.fileExists(f,h)) await ns.scp(f,h); } if(!ns.ps(h).some(p=>p.filename===scripts[0])) ns.exec(scripts[0],h,1,String(F.target||'')); }catch{} await ns.sleep(5); }
  ns.tprint('[spread] deployed to', rooted().length, 'hosts');
}
