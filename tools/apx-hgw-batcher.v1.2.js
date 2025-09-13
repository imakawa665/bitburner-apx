
/** tools/apx-hgw-batcher.v1.2.js  (v1.2.3 HOTFIX)
 * Fix: Avoid Netscript concurrency errors ("sleep tried to run: sleep")
 * - Never call Netscript promise functions concurrently
 * - Use a single awaited sleep between scheduling steps
 * - Lightweight 1~3 lanes scheduler for home-only (works with workers/* or direct exec)
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('exec'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([
    ['target',''], ['hackPct',0.03], ['gap',200], ['lanes',1], ['log',true]
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[batcher]',...a); };
  const tgt = await pickTarget(ns, F.target);
  const lanes = Math.max(1, Math.floor(Number(F.lanes)||1));
  const gap = Math.max(0, Number(F.gap)||0);
  const hpct = Math.max(0.001, Math.min(0.99, Number(F.hackPct)||0.03));

  print('start', 'target=',tgt, 'lanes=',lanes, 'hackPct=',hpct, 'gap=',gap);

  while(true){
    // refresh target in case better one is rooted later
    const target = await pickTarget(ns, tgt);
    const wt = ns.getWeakenTime(target), gt = ns.getGrowTime(target), ht = ns.getHackTime(target);

    // compute simple threads based on home RAM
    const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0,max-used);
    const costH=ns.getScriptRam('workers/apx-h1.js','home')||1.7;
    const costG=ns.getScriptRam('workers/apx-g1.js','home')||1.75;
    const costW=ns.getScriptRam('workers/apx-w1.js','home')||1.75;
    const budget=free*0.9;
    let thHack=Math.max(1, Math.floor((budget*0.2)/costH));
    let thGrow=Math.max(1, Math.floor((budget*0.5)/costG));
    let thWeak=Math.max(1, Math.floor((budget*0.3)/costW));

    // schedule lanes sequentially; ensure each ns.sleep is awaited (no overlap)
    for(let i=0;i<lanes;i++){
      // finish times aligned: w2 >= g >= h >= w1
      const t0 = Date.now();
      const end = t0 + Math.max(wt, gt, ht) + 20;
      const dH = Math.max(0, end - ht - t0);
      const dG = Math.max(0, end - gt - t0);
      const dW1= Math.max(0, end - wt - t0) + (gap*2);
      const dW2= Math.max(0, end - wt - t0);

      await ns.sleep(dH);  ns.run('workers/apx-h1.js', thHack, '--target', target, '--pct', hpct);
      await ns.sleep(Math.max(0,dG - (Date.now()-t0))); ns.run('workers/apx-g1.js', thGrow, '--target', target);
      await ns.sleep(Math.max(0,dW1 - (Date.now()-t0))); ns.run('workers/apx-w1.js', thWeak, '--target', target);
      await ns.sleep(Math.max(0,dW2 - (Date.now()-t0))); ns.run('workers/apx-w1.js', thWeak, '--target', target);

      if (gap>0) await ns.sleep(gap);
    }
    // outer pacing (single awaited sleep; no nested sleeps outstanding)
    await ns.sleep(50);
  }
}

async function pickTarget(ns, prefer){
  const me=ns.getPlayer().skills.hacking;
  const L=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
  const can = (h)=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me&&(ns.getServerMaxMoney(h)||0)>0;
  if (prefer && can(prefer)) return prefer;
  const roots=L.filter(can); if(roots.length===0) return 'n00dles';
  roots.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0));
  return roots[0];
}
