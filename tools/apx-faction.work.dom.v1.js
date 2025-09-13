/** tools/apx-faction.work.dom.v1.js (v1.0) */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F = ns.flags([['target','auto'],['job','hack'],['watch',7000],['lock','/Temp/apx.ui.lock.txt'],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[faction.dom]',...a); };
  const have=()=>ns.fileExists(F.lock,'home'); const acquire=()=>{ try{ if(!have()){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; }; const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  const lower=(s)=>String(s||'').toLowerCase();
  const job=(()=>{ const j=lower(F.job); if(j.startsWith('hack')) return 'Hacking Contracts'; if(j.startsWith('field')) return 'Field Work'; if(j.startsWith('sec')) return 'Security Work'; return 'Hacking Contracts'; })();

  function targetFaction(){ const t=String(F.target||'auto').trim(); if (t.toLowerCase()!=='auto') return t; try{ const facs=ns.getPlayer().factions||[]; let best=null, rep=1e99; for(const f of facs){ const r=ns.singularity?.getFactionRep?.(f)||0; if(r<rep){rep=r; best=f;} } return best||facs[0]||''; }catch{ return ''; } }
  async function clickContains(txt){ try{ const doc=eval('document'); const el=[...doc.querySelectorAll('button,div,span,a')].find(e=>(String(e.textContent||'').toLowerCase()).includes(String(txt).toLowerCase())); if(el){ el.click(); await ns.sleep(80); return true;} }catch{} return false; }
  async function toTerminal(){ try{ const doc=eval('document'); const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>(String(e.textContent||'').toLowerCase()).includes('terminal')); if(tab) tab.click(); }catch{} }

  while(true){
    const tgt=targetFaction(); if(!tgt){ await ns.sleep(2000); continue; }
    if(!acquire()){ await ns.sleep(500); continue; }
    try{
      await clickContains('Factions'); await ns.sleep(120);
      await clickContains(tgt); await ns.sleep(120);
      await clickContains('Work for Faction'); await ns.sleep(120);
      await clickContains(job); await ns.sleep(120);
      await clickContains('Focus'); await ns.sleep(120);
      await clickContains('Start'); await ns.sleep(120);
      await clickContains('Yes'); await ns.sleep(120);
    }catch{}
    await toTerminal(); release();
    await ns.sleep(Math.max(1500, Number(F.watch)||7000));
  }
}
