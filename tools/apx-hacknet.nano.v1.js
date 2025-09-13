
/** tools/apx-hacknet.nano.v1.js - Budgeted Hacknet auto-manage */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['budget',0.2],['maxROI',3600],['log','false']]);
  const log=(...a)=>{ if(F.log) ns.print('[hacknet]',...a); };
  function money(){ return ns.getServerMoneyAvailable('home'); }
  function reserve(){ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} }
  function free(){ return Math.max(0, money()-reserve()); }
  while(true){
    try{
      let changed=false;
      const nodes=ns.hacknet.numNodes();
      // Purchase new node if affordable within budget
      const costNew=ns.hacknet.getPurchaseNodeCost();
      if(costNew>0 && costNew <= free()*Number(F.budget||0.2)){ ns.hacknet.purchaseNode(); changed=true; }
      for(let i=0;i<ns.hacknet.numNodes();i++){
        const can=(name,fn)=>{ const c=fn(i); return c>0 && c<= free()*Number(F.budget||0.2); };
        if(can('level',ns.hacknet.getLevelUpgradeCost)){ if(ns.hacknet.upgradeLevel(i,1)) changed=true; }
        if(can('ram',ns.hacknet.getRamUpgradeCost)){ if(ns.hacknet.upgradeRam(i,1)) changed=true; }
        if(can('core',ns.hacknet.getCoreUpgradeCost)){ if(ns.hacknet.upgradeCore(i,1)) changed=true; }
        if(ns.hacknet.hashCapacity?.()>0){} // noop
      }
      if(!changed) await ns.sleep(1500);
    }catch{ await ns.sleep(1500); }
  }
}
