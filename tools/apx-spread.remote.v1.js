/** tools/apx-spread.remote.v1.js (v1.2) */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('scp'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([['target',''],['secPad',0.5],['moneyThr',0.95],['sleep',800],['minFree',1.6],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[spread]',...a); };
  const files=['workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js','workers/apx-loop-hgw.nano.js'].filter(f=>ns.fileExists(f,'home'));
  const scanAll=()=>{ const seen=new Set(['home']); const q=['home']; const order=[]; while(q.length){ const c=q.shift(); order.push(c); for(const n of ns.scan(c)) if(!seen.has(n)){ seen.add(n); q.push(n);} } return order; };
  const me=ns.getPlayer().skills.hacking;
  const pickTarget=()=>{ const roots=scanAll().filter(h=>h!=='home' && ns.serverExists(h) && ns.hasRootAccess(h) && ns.getServerRequiredHackingLevel(h)<=me && (ns.getServerMaxMoney(h)||0)>0); if (F.target && ns.serverExists(F.target) && ns.hasRootAccess(F.target)) return F.target; if (roots.length===0) return ''; roots.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return roots[0]; };
  const target=pickTarget(); if (!target) { ns.tprint('[spread] ルート済みターゲットが無いため保留'); return; }
  const hosts=scanAll().filter(h=>h!=='home' && h!=='darkweb' && ns.hasRootAccess(h));
  log('hosts',hosts.length,'target',target);
  for(const h of hosts){
    const max=ns.getServerMaxRam(h), used=ns.getServerUsedRam(h); const free=Math.max(0,max-used);
    if(free < Math.max(1, Number(F.minFree))) { log('skip low free',h,free.toFixed(1)); continue; }
    if(files.length) { try{ await ns.scp(files,h); log('scp',h); }catch{ log('scp-fail',h); } }
    const cost=ns.getScriptRam('workers/apx-loop-hgw.nano.js','home')||1.6; const th=Math.max(1,Math.floor(free/cost));
    if(th>=1 && !ns.isRunning('workers/apx-loop-hgw.nano.js',h)){ ns.exec('workers/apx-loop-hgw.nano.js',h,th,'--target',target,'--secPad',F.secPad,'--moneyThr',F.moneyThr,'--sleep',F.sleep); log('start',h,'t',th); }
  }
  ns.tprint(`[spread] deployed to ${hosts.length} hosts, target=${target}`);
}
