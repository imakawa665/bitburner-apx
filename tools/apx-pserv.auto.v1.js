/** apx-pserv.auto.v1.js */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getPurchasedServerCost');
  const F = ns.flags([['budget',0.5],['minRam',64],['maxRam',8192],['target',''],['prefix','px'],['keep',false],['interval',15000],['log',true]]);
  const LOOP = 'workers/apx-loop-hgw.nano.js'; const WORKERS = ['workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js'];
  const log=(...a)=>{ if(F.log) ns.print('[pserv.auto]',...a); };
  const pickTarget = () => { if (F.target && ns.serverExists(F.target)) return F.target;
    const me=ns.getPlayer().skills.hacking; const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me);
    if(c.length===0) return 'n00dles'; c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0]; };
  const ensureLoop = async (host, target) => {
    if (!ns.isRunning(LOOP, host)) {
      const files=[LOOP, ...WORKERS].filter(f=>ns.fileExists(f,'home'));
      if (files.length) { await ns.scp(files, host); log('scp',host,files.join(',')); }
      const max = ns.getServerMaxRam(host); let cost = ns.getScriptRam(LOOP, 'home'); if (!isFinite(cost) || cost <= 0) cost = 1.6;
      let t = Math.max(1, Math.floor(max / cost)); if (!isFinite(t) || t < 1) t = 1; ns.exec(LOOP, host, t, '--target', target);
      log('start',host,'t',t,'target',target);
    }
  };
  log('start','budget',F.budget,'ram',F.minRam,'..',F.maxRam);
  while (true) {
    const limit=ns.getPurchasedServerLimit(), have=ns.getPurchasedServers(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
    const target = pickTarget(); let bestRam = Math.max(F.minRam,2);
    for(let r=F.minRam; r<=F.maxRam; r*=2){ const c=ns.getPurchasedServerCost(r); if(c<=budget) bestRam=r; }
    const need=Math.max(0, limit - have.length); let replaced=false; if(need===0 && !F.keep){ const infos=have.map(h=>({h, r:ns.getServerMaxRam(h)})).sort((a,b)=>a.r-b.r); for(const info of infos){ if(info.r>=bestRam) continue; if(ns.ps(info.h).length>0){ ns.killall(info.h); await ns.sleep(10);} if(ns.deleteServer(info.h)){ replaced=true; log('deleted',info.h,'->',bestRam); break; } } }
    const canBuy = (need>0) || replaced; if (canBuy && bestRam>=F.minRam) { const name=`${F.prefix}-${Date.now().toString().slice(-6)}`; const cost=ns.getPurchasedServerCost(bestRam);
      if(cost<=ns.getServerMoneyAvailable('home')){ const host=ns.purchaseServer(name,bestRam); if(host){ ns.tprint(`[pserv.auto] 購入 ${host} (${bestRam}GB)`); log('purchased',host,bestRam); await ensureLoop(host, target); } } else log('waiting money',cost); }
    for (const h of ns.getPurchasedServers()) await ensureLoop(h, target);
    await ns.sleep(F.interval);
  }
}
