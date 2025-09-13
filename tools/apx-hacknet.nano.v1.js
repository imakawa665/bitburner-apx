/** apx-hacknet.nano.v1.js (v1.1) */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable');
  const F=ns.flags([['budget',0.2],['maxROI',3600],['interval',5000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[hacknet]',...a); };
  const c={ node:()=>ns.hacknet.getPurchaseNodeCost(), level:(i)=>ns.hacknet.getLevelUpgradeCost(i,1), ram:(i)=>ns.hacknet.getRamUpgradeCost(i,1), core:(i)=>ns.hacknet.getCoreUpgradeCost(i,1) };
  const dGain=(i,type)=>{ const s=ns.hacknet.getNodeStats(i), base=s.production; if(type==='level') return (s.level+1)/s.level*base-base; if(type==='ram') return base*0.07; if(type==='core') return base*0.04; return 0; };
  while(true){
    const n=ns.hacknet.numNodes(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
    let best=null;
    try{
      const nodeCost=c.node();
      if(n===0 && Number.isFinite(nodeCost) && nodeCost<=budget){ best={type:'node',idx:0,cost:nodeCost,roi:0}; }
      else if(n>0){ const first=ns.hacknet.getNodeStats(0); if(!isNaN(nodeCost)&&nodeCost<=budget&&first){ const roi=nodeCost/Math.max(1,(first.production||1)); best={type:'node',idx:n,cost:nodeCost,roi}; } }
    }catch{}
    for(let i=0;i<n;i++){
      for(const type of ['level','ram','core']){ const cost=c[type](i); if(cost>budget) continue; const gain=dGain(i,type); if(gain<=0) continue; const roi=cost/gain; if(!best||roi<best.roi) best={type,idx:i,cost,roi}; }
    }
    if(best && best.roi<=F.maxROI){ log('upgrade',best.type,'@',best.idx,'cost',Math.round(best.cost),'roi',Math.round(best.roi),'s'); if(best.type==='node') ns.hacknet.purchaseNode(); else if(best.type==='level') ns.hacknet.upgradeLevel(best.idx,1); else if(best.type==='ram') ns.hacknet.upgradeRam(best.idx,1); else if(best.type==='core') ns.hacknet.upgradeCore(best.idx,1); } else { log('skip', best?('minROI='+Math.round(best.roi)+'s'):'no candidate'); }
    await ns.sleep(F.interval);
  }
}
