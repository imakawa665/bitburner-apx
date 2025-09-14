
export async function main(ns){
  ns.disableLog('sleep');
  const me=ns.getPlayer().skills.hacking;
  const seen=new Set(); const q=['home']; const cand=[];
  while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
  for(const h of seen){ if(h==='home') continue; try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.requiredHackingSkill>me) continue; if(!sv.backdoorInstalled) cand.push({h,req:sv.requiredHackingSkill}); }catch{} }
  cand.sort((a,b)=>a.req-b.req);
  ns.tprint('=== Backdoor Guide ==='); for(const c of cand.slice(0,30)) ns.tprint(`${c.h.padEnd(18)} | req:${String(c.req).padStart(4)}`);
}
