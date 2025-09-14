
export async function main(ns){
  ns.disableLog('sleep'); const F=ns.flags([['budget',0.2],['maxROI',3600],['log','false']]);
  const log=(...a)=>{ if(F.log) ns.print('[hacknet]',...a); };
  function reserve(){ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} }
  function free(){ return Math.max(0, ns.getServerMoneyAvailable('home') - reserve()); }
  while(true){
    try{
      let changed=false;
      const costNew=ns.hacknet.getPurchaseNodeCost();
      if(costNew>0 && costNew <= free()*Number(F.budget||0.2)){ ns.hacknet.purchaseNode(); changed=true; }
      for(let i=0;i<ns.hacknet.numNodes();i++){
        const up=[ ['Level',ns.hacknet.getLevelUpgradeCost(i,1)],
                   ['Ram',ns.hacknet.getRamUpgradeCost(i,1)],
                   ['Core',ns.hacknet.getCoreUpgradeCost(i,1)] ];
        for(const [k,c] of up){
          if(c>0 && c <= free()*Number(F.budget||0.2)){ const f={'Level':ns.hacknet.upgradeLevel,'Ram':ns.hacknet.upgradeRam,'Core':ns.hacknet.upgradeCore}[k]; f(i,1); changed=true; }
        }
      }
      if(changed) log('updated');
    }catch{}
    await ns.sleep(1500);
  }
}
