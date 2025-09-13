
/** tools/apx-crime.repeat.dom.v1.js (v1.0)
 * No-Singularity crime loop via DOM clicks (uses UI lock to avoid conflicts).
 * Tries: City -> Slums -> <crime> -> 'Commit Crime'
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F = ns.flags([['crime','shoplift'],['lock','/Temp/apx.ui.lock.txt'],['watch',6000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[crime.dom]',...a); };
  const haveLock=()=>ns.fileExists(F.lock,'home');
  const acquire=()=>{ try{ if(!haveLock()){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; };
  const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  async function clickByText(txts){
    try{
      const doc=eval('document');
      for(const t of txts){
        const el=Array.from(doc.querySelectorAll('button,div,span,a')).find(e=>(e.textContent||'').trim().toLowerCase()==t.toLowerCase());
        if(el){ el.click(); await ns.sleep(50); }
      }
      return true;
    }catch{ return false; }
  }
  async function toTerminal(){ try{ const doc=eval('document'); const tab=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').toLowerCase().includes('terminal')); if(tab) tab.click(); }catch{} }
  const candidates = [String(F.crime||'shoplift'), 'shoplift', 'mug someone', 'larceny', 'homicide', 'heist'];
  while(true){
    if(!acquire()){ log('UI locked; retry'); await ns.sleep(1000); continue; }
    try{
      // City -> Slums
      await clickByText(['City']); await ns.sleep(150);
      // Some UIs show "Slums", some show "Crimes"
      await clickByText(['Slums','Crimes']); await ns.sleep(150);
      // Choose a crime
      let picked = false;
      for(const c of candidates){ if(await clickByText([c])){ picked=true; break; } }
      // Commit
      await clickByText(['Commit Crime','Commit crime','Start']); await ns.sleep(100);
    }catch{}
    await toTerminal(); release();
    // Generic wait; game handles the timer. We'll poll again a little later.
    await ns.sleep(Math.max(4000, Number(F.watch)||6000));
  }
}
