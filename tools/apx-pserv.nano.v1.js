/** tools/apx-pserv.auto.v1.js - simple auto buyer */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['budget',0.3],['minRam',8],['maxRam',16384],['interval',5000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[pserv]',...a); };
  const prefix='px-'; const max=25;
  function reserve(){ try{ return Number(ns.read('reserve.txt')||0); }catch{return 0;} }
  function money(){ return Math.max(0, ns.getServerMoneyAvailable('home')-reserve()); }
  while(true){
    try{
      let budget=money()*Math.max(0,Number(F.budget)||0.3);
      let gb=Math.max(Number(F.minRam)||8,2); while(ns.getPurchasedServerCost(gb*2)<=budget && gb*2<=Number(F.maxRam||16384)) gb*=2;
      const count=ns.getPurchasedServers().length;
      if(count<max && ns.getPurchasedServerCost(gb)<=budget){ const h=ns.purchaseServer(prefix+String(Date.now()).slice(-6), gb); if(h) log('buy',h,gb+'GB'); }
    }catch{}
    await ns.sleep(Math.max(1000,Number(F.interval)||5000));
  }
}
