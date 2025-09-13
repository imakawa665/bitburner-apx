/** tools/apx-backdoor.auto.dom.v1.js (v1.0) */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['watch',6000],['lock','/Temp/apx.ui.lock.txt'],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[auto-backdoor]',...a); };
  const specials=['CSEC','avmnite-02h','I.I.I.I','run4theh111z','w0r1d_d43m0n'].filter(h=>ns.serverExists(h));
  const haveLock=()=>ns.fileExists(F.lock,'home');
  const acquire=()=>{ try{ if(!haveLock()){ ns.write(F.lock, String(ns.pid),'w'); return true;} }catch{} return false; };
  const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  function find(t){ const q=['home'],p={home:null},seen=new Set(['home']); while(q.length){ const c=q.shift(); for(const n of ns.scan(c)){ if(seen.has(n))continue; seen.add(n); p[n]=c; q.push(n); if(n===t){ q.length=0; break; } } } if(!p.hasOwnProperty(t)) return null; const path=[]; let x=t; while(x){ path.push(x); x=p[x]; } path.reverse(); return path; }
  function gen(path){ if(!path||path[0]!=='home')return null; const hops=path.slice(1); return ['home',...hops.map(h=>`connect ${h}`),'backdoor'].join('; '); }
  async function term(cmd){ try{ const doc=eval('document'); const tab=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').toLowerCase().includes('terminal')); if(tab) tab.click(); await ns.sleep(10); const input=doc.getElementById('terminal-input')||doc.querySelector('input.MuiInputBase-input'); if(!input) return false; input.value=cmd; input.dispatchEvent(new Event('input',{bubbles:true})); const ke=new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true}); input.dispatchEvent(ke); return true; }catch{ return false; } }
  while(true){
    for(const h of specials){
      const s=ns.getServer(h); if(!s) continue; if(s.backdoorInstalled===true) continue;
      if(!ns.hasRootAccess(h)) { log('skip no-root',h); continue; }
      const req=ns.getServerRequiredHackingLevel(h); if(ns.getPlayer().skills.hacking < req) { log('skip need hack',req,h); continue; }
      const path=find(h); const cmd=gen(path); if(!cmd) continue;
      if(!acquire()){ log('UI locked; wait'); continue; }
      ns.tprint(`[auto-backdoor] ${h} に backdoor 実行: ${cmd}`);
      await term(cmd); await ns.sleep(8000); release();
    }
    await ns.sleep(Math.max(1000, Number(F.watch)||6000));
  }
}
