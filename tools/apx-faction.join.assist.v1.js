/** tools/apx-faction.join.assist.v1.js - accept faction invites (Singularity if available, else DOM heuristics) */
export async function main(ns){
  ns.disableLog('sleep');
  while(true){
    try{
      const invites=ns.singularity?.checkFactionInvitations?.()||[];
      for(const f of invites){ try{ if(ns.singularity?.joinFaction?.(f)) ns.tprint(`[faction] join ${f}`); }catch{} }
      // DOM fallback (best-effort)
      const doc=eval('document'); const facBtn=[...doc.querySelectorAll('button,div,span,a')].find(e=>(String(e.textContent||'').toLowerCase()).includes('factions')); if(facBtn){ facBtn.click(); await ns.sleep(80); const acc=[...doc.querySelectorAll('button')].find(e=>(String(e.textContent||'').toLowerCase()).includes('accept')); if(acc){ acc.click(); await ns.sleep(80); } }
    }catch{}
    await ns.sleep(5000);
  }
}
