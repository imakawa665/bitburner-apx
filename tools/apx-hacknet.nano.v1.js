
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable');
  const F=ns.flags([['budget',0.2],['maxROI',3600],['log','false']]); const log=(...a)=>{ if(F.log) ns.print('[hacknet]',...a); };
  function reserve(){ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} }
  function freeCash(){ return Math.max(0, ns.getServerMoneyAvailable('home') - reserve()); }
  while(true){
    try{
      let changed=false; const budget=freeCash()*Math.max(0,Number(F.budget)||0.2);
      // Try purchase new node if affordable
      const costNew=ns.hacknet.getPurchaseNodeCost();
      if(costNew>0 && costNew<=budget){ ns.hacknet.purchaseNode(); log('buy node'); changed=true; }
      // Consider upgrades with best ROI
      const n=ns.hacknet.numNodes(); let best=null;
      for(let i=0;i<n;i++){
        const l=ns.hacknet.getNodeStats(i);
        const opts=[
          ['level', ns.hacknet.getLevelUpgradeCost(i,1), 1],
          ['ram', ns.hacknet.getRamUpgradeCost(i,1), 1],
          ['cores', ns.hacknet.getCoreUpgradeCost(i,1), 1]
        ];
        for(const [type,cost,amt] of opts){
          if(!isFinite(cost) || cost<=0 || cost>budget) continue;
          // crude ROI metric using production increase assumptions
          const delta = type==='level'? 1 : (type==='ram'? l.production : 0.5);
          const roi = cost/Math.max(1e-6, delta);
          if(!best || roi<best.roi) best={i,type,cost,roi};
        }
      }
      if(best){ ns.hacknet['upgrade'+best.type.charAt(0).toUpperCase()+best.type.slice(1)](best.i,1); log('upgrade',best.type,best.i); changed=true; }
      if(!changed) await ns.sleep(4000);
    }catch{ await ns.sleep(4000); }
  }
}
