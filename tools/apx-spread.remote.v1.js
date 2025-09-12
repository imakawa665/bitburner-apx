/** apx-spread.remote.v1.js (v1.1) */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('scp'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([['target',''],['secPad',0.5],['moneyThr',0.95],['sleep',800],['minFree',1.6],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[spread]',...a); };
  const files=['workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js','workers/apx-loop-hgw.nano.js'].filter(f=>ns.fileExists(f,'home'));
  const purchased=new Set((ns.getPurchasedServers?.()??[]));
  const isHacknet=(h)=>h.startsWith('hacknet-server-')||h.startsWith('hacknet-node-');
  const scanAll=()=>{ const seen=new Set(['home']); const q=['home']; const order=[]; while(q.length){ const c=q.shift(); order.push(c); for(const n of ns.scan(c)) if(!seen.has(n)){ seen.add(n); q.push(n);} } return order; };
  const target=F.target||(()=>{ const me=ns.getPlayer().skills.hacking; const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me); if(c.length===0)return'n00dles'; c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0]; })();
  const hosts=scanAll().filter(h=>h!=='home' && h!=='darkweb' && !purchased.has(h) && !isHacknet(h) && ns.hasRootAccess(h));
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
