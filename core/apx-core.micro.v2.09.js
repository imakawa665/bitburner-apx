/** core/apx-core.micro.v2.09.js (lightweight)
 * Deploy loop-hgw to rooted hosts, respecting reserve RAM on home.
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('scp'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([['allRooted',true],['reserveRamPct',0.1],['sleep',8000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[micro]',...a); };
  const files=['workers/apx-loop-hgw.nano.js'].filter(f=>ns.fileExists(f,'home'));
  const scanAll=()=>{ const seen=new Set(['home']); const q=['home']; const order=[]; while(q.length){ const c=q.shift(); order.push(c); for(const n of ns.scan(c)) if(!seen.has(n)){ seen.add(n); q.push(n);} } return order; };
  const pickTarget=()=>{
    const me=ns.getPlayer().skills.hacking;
    const roots=scanAll().filter(h=>h!=='home' && ns.serverExists(h) && ns.hasRootAccess(h) && ns.getServerRequiredHackingLevel(h)<=me && (ns.getServerMaxMoney(h)||0)>0);
    if (roots.length===0) return 'n00dles'; roots.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return roots[0];
  };
  while(true){
    const target=pickTarget();
    const hosts=scanAll().filter(h=>h!=='home' && ns.hasRootAccess(h));
    for(const h of hosts){
      const max=ns.getServerMaxRam(h), used=ns.getServerUsedRam(h); const free=Math.max(0,max-used);
      if(h==='home'){ const reserve=(ns.getServerMaxRam('home')||0)*(Math.max(0,Math.min(1,Number(F.reserveRamPct)||0))); if((max-used)<=reserve) continue; }
      if(files.length) { try{ await ns.scp(files,h); }catch{} }
      const cost=ns.getScriptRam('workers/apx-loop-hgw.nano.js','home')||1.6; const th=Math.max(1,Math.floor(free/cost));
      if(th>=1 && !ns.isRunning('workers/apx-loop-hgw.nano.js',h)){ ns.exec('workers/apx-loop-hgw.nano.js',h,th,'--target',target); log('start',h,'t',th,'→',target); }
    }
    await ns.sleep(Number(F.sleep)||8000);
  }
}
