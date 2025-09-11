/** apx-pserv.auto.v1.js
 * 買収サーバの常駐メンテ（自動購入・置換・HGW起動確認）
 * 例:
 *   run apx-pserv.auto.v1.js --budget 0.5 --minRam 64 --maxRam 8192 --target joesguns --interval 15000
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getPurchasedServerCost');
  const F = ns.flags([['budget',0.5],['minRam',64],['maxRam',8192],['target',''],['prefix','px'],['keep',false],['interval',15000]]);
  const pickTarget = () => {
    if (F.target && ns.serverExists(F.target)) return F.target;
    const me=ns.getPlayer().skills.hacking;
    const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me);
    if(c.length===0) return 'n00dles';
    c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0];
  };
  const ensureLoop = async (host, target) => {
    const need = !ns.isRunning('apx-loop-hgw.nano.js', host);
    if (need) {
      const files=['apx-loop-hgw.nano.js','apx-w1.js','apx-g1.js','apx-h1.js'].filter(f=>ns.fileExists(f,'home'));
      if(files.length>0) await ns.scp(files, host);
      const max=ns.getServerMaxRam(host), cost=ns.getScriptRam('apx-loop-hgw.nano.js'), t=Math.max(1,Math.floor(max/cost));
      ns.exec('apx-loop-hgw.nano.js', host, t, '--target', target);
    }
  };
  while (true) {
    const limit=ns.getPurchasedServerLimit(), have=ns.getPurchasedServers(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
    const target = pickTarget();
    let bestRam = Math.max(F.minRam,2);
    for(let r=F.minRam; r<=F.maxRam; r*=2){ const cost=ns.getPurchasedServerCost(r); if(cost<=budget) bestRam=r; }
    // 置換対象の選定
    const need=Math.max(0, limit - have.length); let replaced=false;
    if(need===0 && !F.keep){
      const infos=have.map(h=>({h, r:ns.getServerMaxRam(h)})).sort((a,b)=>a.r-b.r);
      for(const info of infos){ if(info.r>=bestRam) continue; if(ns.ps(info.h).length>0){ ns.killall(info.h); await ns.sleep(10); } if(ns.deleteServer(info.h)){ replaced=true; break; } }
    }
    const canBuy = (need>0) || replaced;
    if (canBuy && bestRam>=F.minRam) {
      const name=`${F.prefix}-${Date.now().toString().slice(-6)}`; const cost=ns.getPurchasedServerCost(bestRam);
      if(cost<=ns.getServerMoneyAvailable('home')){
        const host=ns.purchaseServer(name,bestRam);
        if(host){ ns.tprint(`[pserv.auto] 購入 ${host} (${bestRam}GB)`); await ensureLoop(host, target); }
      }
    }
    // 起動確認（全台）
    for (const h of ns.getPurchasedServers()) await ensureLoop(h, target);
    await ns.sleep(F.interval);
  }
}