
/** tools/apx-faction.work.dom.v1.js (v1.0)
 * 文脈: Singularityなしでも Faction Work を自動継続。
 * Args: --target auto|FactionName  --job hack|field|sec  --lock /Temp/apx.ui.lock.txt --watch 6000
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['target','auto'],['job','hack'],['watch',7000],['lock','/Temp/apx.ui.lock.txt']]);
  const lower=s=>String(s||'').toLowerCase();
  const pickJob=()=> lower(F.job).startsWith('field')?'Field Work':(lower(F.job).startsWith('sec')?'Security Work':'Hacking Contracts');
  function targetFac(){
    const t=String(F.target||'auto'); if(lower(t)!=='auto') return t;
    try{ const facs=ns.getPlayer().factions||[]; let best=null, rep=Infinity;
      for(const f of facs){ let r=0; try{ r = ns.singularity?.getFactionRep?.(f) || 0; }catch{} if(r<rep){rep=r; best=f;} }
      return best||facs[0]||'';
    }catch{ return ''; }
  }
  function lock(){ try{ if(!ns.fileExists(F.lock,'home')){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; }
  function unlock(){ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} }
  async function clickContains(txt){
    try{ const doc=eval('document'); const el=[...doc.querySelectorAll('button,div,span,a')].find(e=>lower(e.textContent||'').includes(lower(txt))); if(el){ el.click(); await ns.sleep(80); return true; } }catch{} return false;
  }
  async function toTerminal(){ try{ const doc=eval('document'); const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>lower(e.textContent).includes('terminal')); if(tab) tab.click(); }catch{} }
  while(true){
    const fac = targetFac(); if(!fac){ await ns.sleep(1500); continue; }
    if(!lock()){ await ns.sleep(400); continue; }
    try{
      await clickContains('Factions'); await ns.sleep(120);
      await clickContains(fac); await ns.sleep(120);
      await clickContains('Work for Faction'); await ns.sleep(120);
      await clickContains(pickJob()); await ns.sleep(120);
      await clickContains('Focus'); await clickContains('Start'); await clickContains('Yes');
    }catch{}
    await toTerminal(); unlock();
    await ns.sleep(Math.max(1500,Number(F.watch)||7000));
  }
}
