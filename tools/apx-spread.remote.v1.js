
export async function main(ns){
  ns.disableLog('sleep');
  const files=['workers/apx-h1.js','workers/apx-g1.js','workers/apx-w1.js','workers/apx-loop-hgw.nano.js','workers/apx-hack.sched.v1.js','workers/apx-grow.sched.v1.js','workers/apx-weak.sched.v1.js','tools/apx-share.nano.v1.js'];
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ if(ns.getServer(h).hasAdminRights) out.push(h);}catch{} } return out; }
  for(const h of rooted()){ if(h==='home') continue; try{ await ns.scp(files,h); }catch{} await ns.sleep(10); }
  ns.tprint('[spread] deployed to '+rooted().length+' hosts');
}
