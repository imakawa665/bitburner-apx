/** tools/apx-pserv.auto.v1.js */
export async function main(ns){
  ns.disableLog('sleep'); const F=ns.flags([['budget',0.3],['minRam',8],['maxRam',8192],['prefix','px-'],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[pserv]',...a); };
  const maxCount=ns.getPurchasedServerLimit();
  while(true){
    try{
      const money=ns.getServerMoneyAvailable('home'); const allocate=money*Math.max(0,Math.min(1,Number(F.budget)||0.3));
      let ram=Math.max(8, Math.min(Number(F.maxRam)||8192, Number(F.minRam)||8)); while(ram>8 && ns.getPurchasedServerCost(ram)>allocate) ram/=2; ram=Math.max(8,Math.floor(ram));
      if (ram>=8 && ns.getPurchasedServers().length<maxCount && ns.getPurchasedServerCost(ram)<=allocate){
        const name=`${String(F.prefix)}${Date.now()%1000000}`; const ok=ns.purchaseServer(name, ram); if(ok){ log('buy',name,ram+'GB'); }
      }
      // simple replace: if have money to afford double RAM, replace smallest
      const servers=ns.getPurchasedServers().sort((a,b)=>ns.getServerMaxRam(a)-ns.getServerMaxRam(b));
      if(servers.length>0){ const smallest=servers[0], cur=ns.getServerMaxRam(smallest), next=Math.min(Number(F.maxRam)||8192, cur*2); if(next>cur && ns.getPurchasedServerCost(next)<=allocate){ ns.killall(smallest); ns.deleteServer(smallest); const name=`${String(F.prefix)}${Date.now()%1000000}`; const ok=ns.purchaseServer(name,next); if(ok){ log('replace',smallest,'->',name,next+'GB'); } } }
    }catch(e){ log('err',String(e)); }
    await ns.sleep(5000);
  }
}
