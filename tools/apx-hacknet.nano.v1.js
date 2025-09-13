/** tools/apx-hacknet.nano.v1.js - tiny budgeted investor */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['budget',0.2],['maxROI',3600],['log',true]]);
  const print=(...a)=>{ if(F.log) ns.print('[hacknet]',...a); };
  function reserve(){ try{ return Number(ns.read('reserve.txt')||0); }catch{return 0;} }
  function money(){ return Math.max(0, ns.getServerMoneyAvailable('home') - reserve()); }
  function valueDeltaAfter(cost, gainPerSec){ return gainPerSec>0 ? cost/gainPerSec : 1e99; } // ROI(s)
  while(true){
    try{
      let budget = money()*Math.max(0,Number(F.budget)||0.2);
      let did=false;
      // try purchase new node
      const buyCost=ns.hacknet.getPurchaseNodeCost?.()||Infinity;
      const gainNew = 0.001; // rough baseline
      if (buyCost<=budget && valueDeltaAfter(buyCost, gainNew) <= Number(F.maxROI||3600)){ ns.hacknet.purchaseNode?.(); print('buy node'); did=true; }
      // upgrades (rough greedy)
      const n=ns.hacknet.numNodes?.()||0;
      for(let i=0;i<n;i++){
        const l=ns.hacknet.getLevelUpgradeCost?.(i,1)||Infinity;
        if(!did && l<=budget){ ns.hacknet.upgradeLevel?.(i,1); budget-=l; did=true; }
        const r=ns.hacknet.getRamUpgradeCost?.(i,1)||Infinity;
        if(!did && r<=budget){ ns.hacknet.upgradeRam?.(i,1); budget-=r; did=true; }
        const c=ns.hacknet.getCoreUpgradeCost?.(i,1)||Infinity;
        if(!did && c<=budget){ ns.hacknet.upgradeCore?.(i,1); budget-=c; did=true; }
      }
      if(!did) await ns.sleep(2000);
    }catch{ await ns.sleep(2000); }
  }
}
