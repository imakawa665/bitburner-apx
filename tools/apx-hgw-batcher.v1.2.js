/** tools/apx-hgw-batcher.v1.2.js  (v1.2.3 HOTFIX) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('exec'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([['target',''],['hackPct',0.03],['gap',200],['lanes',1],['log',true]]);
  const print=(...a)=>{ if(F.log) ns.print('[batcher]',...a); };
  const pick=()=>{
    const me=ns.getPlayer().skills.hacking, L=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
    const can=(h)=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me&&(ns.getServerMaxMoney(h)||0)>0;
    if (F.target && can(F.target)) return F.target; const roots=L.filter(can); if(roots.length===0) return 'n00dles'; roots.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return roots[0];
  };
  const lanes=Math.max(1,Math.floor(Number(F.lanes)||1)), gap=Math.max(0,Number(F.gap)||0), hpct=Math.max(0.001,Math.min(0.99,Number(F.hackPct)||0.03));
  while(true){
    const t=pick(), wt=ns.getWeakenTime(t), gt=ns.getGrowTime(t), ht=ns.getHackTime(t);
    const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'), free=Math.max(0,max-used);
    const cH=ns.getScriptRam('workers/apx-h1.js','home')||1.7, cG=ns.getScriptRam('workers/apx-g1.js','home')||1.75, cW=ns.getScriptRam('workers/apx-w1.js','home')||1.75;
    const budget=free*0.9; let thH=Math.max(1,Math.floor((budget*0.2)/cH)), thG=Math.max(1,Math.floor((budget*0.5)/cG)), thW=Math.max(1,Math.floor((budget*0.3)/cW));
    for(let i=0;i<lanes;i++){
      const t0=Date.now(), end=t0+Math.max(wt,gt,ht)+20;
      const dH=Math.max(0,end-ht-t0), dG=Math.max(0,end-gt-t0), dW1=Math.max(0,end-wt-t0)+(gap*2), dW2=Math.max(0,end-wt-t0);
      await ns.sleep(dH); ns.run('workers/apx-h1.js',thH,'--target',t,'--pct',hpct);
      await ns.sleep(Math.max(0,dG-(Date.now()-t0))); ns.run('workers/apx-g1.js',thG,'--target',t);
      await ns.sleep(Math.max(0,dW1-(Date.now()-t0))); ns.run('workers/apx-w1.js',thW,'--target',t);
      await ns.sleep(Math.max(0,dW2-(Date.now()-t0))); ns.run('workers/apx-w1.js',thW,'--target',t);
      if(gap>0) await ns.sleep(gap);
    }
    await ns.sleep(50);
  }
}
