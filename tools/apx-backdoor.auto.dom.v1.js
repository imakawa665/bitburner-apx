/** tools/apx-backdoor.auto.dom.v1.js - simple DOM terminal pathing to backdoor key servers */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['lock','/Temp/apx.ui.lock.txt'],['watch',6000]]);
  const have=()=>ns.fileExists(F.lock,'home'); const acquire=()=>{ try{ if(!have()){ ns.write(F.lock,String(ns.pid),'w'); return true; } }catch{} return false; }; const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  const targets=['CSEC','avmnite-02h','I.I.I.I','run4theh111z','The-Cave'];
  function pathTo(host){ const visited=new Set(); const q=[['home']]; while(q.length){ const p=q.shift(); const node=p[p.length-1]; if(node===host) return p; if(visited.has(node)) continue; visited.add(node); for(const n of ns.scan(node)) if(!p.includes(n)) q.push(p.concat(n)); } return null; }
  async function term(cmd){ try{ const doc=eval('document'); const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>(e.textContent||'').toLowerCase().includes('terminal')); if(tab) tab.click(); await ns.sleep(10); const input=doc.getElementById('terminal-input')||doc.querySelector('input.MuiInputBase-input'); if(!input) return false; input.value=cmd; input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13})); return true; }catch{ return false; } }
  while(true){
    if(!acquire()){ await ns.sleep(500); continue; }
    try{
      for(const h of targets){
        if(!ns.serverExists(h) || !ns.hasRootAccess(h)) continue;
        const p=pathTo(h); if(!p) continue;
        const cmd='home; ' + p.slice(1).map(x=>'connect '+x+';').join(' ') + 'backdoor';
        await term(cmd); await ns.sleep(300);
      }
    }catch{}
    release(); await ns.sleep(Math.max(1500, Number(F.watch)||6000));
  }
}
