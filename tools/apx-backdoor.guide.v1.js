
export async function main(ns){
  ns.disableLog('sleep');
  const me=ns.getPlayer().skills.hacking;
  function rooted(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; out.push(h);}catch{} } return out; }
  const cand=rooted().map(h=>({h,req:ns.getServer(h).requiredHackingSkill,bd:ns.getServer(h).backdoorInstalled})).filter(x=>!x.bd).sort((a,b)=>a.req-b.req);
  ns.tprint('=== Backdoor Guide ==='); for(const c of cand){ ns.tprint(`${c.h.padEnd(18)} | req:${String(c.req).padStart(4)} | root:${ns.hasRootAccess(c.h)?'Y':'-'} | backdoor:${c.bd?'Y':'-'}`); }
}
