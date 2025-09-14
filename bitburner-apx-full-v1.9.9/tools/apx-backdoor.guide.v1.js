
export async function main(ns){
  ns.disableLog('sleep');
  const seen=new Set(); const q=['home']; const list=[];
  while(q.length){ const s=q.pop(); if(seen.add(s)) for(const n of ns.scan(s)) q.push(n); }
  for(const h of seen){ if(h==='home') continue; try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.backdoorInstalled) continue; list.push({h,req:sv.requiredHackingSkill}); }catch{} }
  list.sort((a,b)=>a.req-b.req);
  ns.tprint('=== Backdoor Guide ==='); for(const it of list) ns.tprint(`${it.h.padEnd(20)} | req:${it.req}`);
}