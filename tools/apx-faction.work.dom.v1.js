
/** tools/apx-faction.work.dom.v1.js  (v1.0)
 * 目的: Singularity なしで Faction REP を上げ続ける。
 * 方法: DOM 操作で Factions タブ→対象Faction→"Work for Faction"→"Hacking Contracts"→"Start/Focus"
 * 特徴: UIロック（--lock）で他DOM系と衝突しない。割り込み後も自動で再開。
 *
 * 使い方:
 *   run tools/apx-faction.work.dom.v1.js --target auto --job hack --lock /Temp/apx.ui.lock.txt --watch 7000
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F = ns.flags([['target','auto'],['job','hack'],['watch',7000],['lock','/Temp/apx.ui.lock.txt'],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[faction.dom]',...a); };
  const have=()=>ns.fileExists(F.lock,'home');
  const acquire=()=>{ try{ if(!have()){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; };
  const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  const lower=(s)=>String(s||'').toLowerCase();
  const pickJobText=()=>{
    const j=lower(F.job);
    if (j.startsWith('hack')) return 'Hacking Contracts';
    if (j.startsWith('field')) return 'Field Work';
    if (j.startsWith('sec')) return 'Security Work';
    return 'Hacking Contracts';
  };
  const chosenJob = pickJobText();

  function targetFaction(){
    const t=String(F.target||'auto').trim();
    if (t.toLowerCase()!=='auto') return t;
    // 所属ファクションのうち rep が低い順に優先（=伸び代が大きい）
    try{
      const facs = ns.getPlayer().factions||[];
      let best=null, bestRep=Infinity;
      for(const f of facs){
        const rep = ns.singularity?.getFactionRep?.(f) || 0; // SF4が無ければ0扱い
        if (rep<bestRep){ best=f; bestRep=rep; }
      }
      return best||facs[0]||'';
    }catch{ return ''; }
  }

  async function clickByText(txts){
    try{
      const doc=eval('document');
      for(const t of txts){
        const el=[...doc.querySelectorAll('button,div,span,a')].find(e=>lower(e.textContent).trim()==lower(t).trim());
        if(el){ el.click(); await ns.sleep(80); }
      }
      return true;
    }catch{ return false; }
  }
  async function clickContains(txts){
    try{
      const doc=eval('document');
      for(const t of txts){
        const el=[...doc.querySelectorAll('button,div,span,a')].find(e=>(lower(e.textContent)||'').includes(lower(t)));
        if(el){ el.click(); await ns.sleep(80); }
      }
      return true;
    }catch{ return false; }
  }
  async function toTerminal(){ try{ const doc=eval('document'); const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>lower(e.textContent).includes('terminal')); if(tab) tab.click(); }catch{} }

  while(true){
    const tgt = targetFaction();
    if(!tgt){ await ns.sleep(2000); continue; }
    if(!acquire()){ await ns.sleep(500); continue; }
    try{
      await clickContains(['Factions']); await ns.sleep(120);
      await clickContains([tgt]);       await ns.sleep(120);
      await clickContains(['Work for Faction']); await ns.sleep(120);
      await clickContains([chosenJob]); await ns.sleep(120);
      await clickContains(['Focus','focus','Start','start','Yes']); await ns.sleep(120);
    }catch{}
    await toTerminal(); release();
    await ns.sleep(Math.max(1500, Number(F.watch)||7000));
  }
}
