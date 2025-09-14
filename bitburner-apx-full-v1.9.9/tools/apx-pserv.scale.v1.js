
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable');
  const F=ns.flags([['budget',0.3],['minRam',8],['maxRam',16384],['reserveFile','reserve.txt'],['interval',2500],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[pserv.scale]',...a); };
  const prefix='px-'; const maxServers=25;
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read(String(F.reserveFile)||'reserve.txt')||0)); }catch{return 0;} };
  const cash=()=> Math.max(0, ns.getServerMoneyAvailable('home') - reserve());
  const price=(gb)=> ns.getPurchasedServerCost(gb);
  const list=()=> Array.from({length: maxServers}, (_,i)=> `${prefix}${String(i+1).padStart(6,'0')}`).filter(h=>ns.serverExists(h));
  while(true){
    try{
      const hosts=list().map(h=>({h,ram:ns.getServerMaxRam(h)})).sort((a,b)=>a.ram-b.ram);
      let budget=cash()*Math.max(0,Number(F.budget)||0.3);
      if (hosts.length<maxServers){
        let gb=Math.max(Number(F.minRam)||8, 2);
        while(price(gb*2)<=budget && gb*2<=Number(F.maxRam||16384)) gb*=2;
        if (price(gb)<=budget){ const name=prefix+String(Date.now()).slice(-6); const host=ns.purchaseServer(name, gb); if(host) log('buy',host,gb+'GB'); }
      } else {
        const smallest=hosts[0];
        let targetRam=Math.max(smallest.ram*2, Number(F.minRam)||8);
        while(price(targetRam*2)<=budget && targetRam*2<=Number(F.maxRam||16384)) targetRam*=2;
        if (targetRam>smallest.ram && price(targetRam)<=budget){
          ns.killall(smallest.h); await ns.sleep(50);
          if(ns.deleteServer(smallest.h)){ const newHost=ns.purchaseServer(prefix+String(Date.now()).slice(-6), targetRam); if(newHost) log('replace',smallest.h,'->',newHost, targetRam+'GB'); }
        }
      }
    }catch{}
    await ns.sleep(Math.max(800, Number(F.interval)||2500));
  }
}