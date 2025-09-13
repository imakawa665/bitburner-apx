/** tools/apx-study.train.dom.v1.js - simple auto study/train via DOM (best-effort) */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['mode','study'],['watch',7000],['lock','/Temp/apx.ui.lock.txt']]);
  const have=()=>ns.fileExists(F.lock,'home'); const acquire=()=>{ try{ if(!have()){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; }; const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  async function clickContains(txt){ try{ const doc=eval('document'); const el=[...doc.querySelectorAll('button,div,span,a')].find(e=>(String(e.textContent||'').toLowerCase()).includes(String(txt).toLowerCase())); if(el){ el.click(); await ns.sleep(80); return true;} }catch{} return false; }
  while(true){
    if(!acquire()){ await ns.sleep(500); continue; }
    try{
      await clickContains('City'); await ns.sleep(100);
      await clickContains('Rothman'); await ns.sleep(100);
      await clickContains('Study Computer Science'); await ns.sleep(100);
      await clickContains('Focus'); await ns.sleep(100);
      await clickContains('Start'); await ns.sleep(100);
      await clickContains('Yes'); await ns.sleep(100);
    }catch{}
    release(); await ns.sleep(Math.max(1500,Number(F.watch)||7000));
  }
}
