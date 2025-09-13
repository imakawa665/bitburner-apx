
/** tools/apx-spread.remote.v1.js - spread worker files to rooted hosts and ensure loop launch */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const target = String(ns.args[0] || '');
  const files=['workers/apx-h1.js','workers/apx-g1.js','workers/apx-w1.js','workers/apx-loop-hgw.nano.js'];
  const rooted=()=>{ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; out.push(h);}catch{} } return out; };
  for(const h of rooted()){ if(h!=='home'){ try{ await ns.scp(files,h); }catch{} } await ns.sleep(10); }
  if(target){ for(const h of rooted()){ if(h==='home') continue; if(!ns.ps(h).some(p=>p.filename==='workers/apx-loop-hgw.nano.js')) ns.exec('workers/apx-loop-hgw.nano.js',h,1,target); } }
}
