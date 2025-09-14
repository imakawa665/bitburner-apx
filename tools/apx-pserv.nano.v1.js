
export async function main(ns){
  const F=ns.flags([['minRam',8],['maxRam',16384],['budget',0.3]]);
  function reserve(){ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} }
  const free=()=> Math.max(0, ns.getServerMoneyAvailable('home') - reserve());
  let gb=Math.max(Number(F.minRam)||8, 2), maxGb=Number(F.maxRam)||16384;
  while(ns.getPurchasedServerCost(gb*2)<=free()*Number(F.budget||0.3) && gb*2<=maxGb) gb*=2;
  if(ns.getPurchasedServerCost(gb)<=free()*Number(F.budget||0.3)){
    const name='px-'+String(Date.now()).slice(-6);
    const host=ns.purchaseServer(name, gb);
    if(host) ns.tprint(`[pserv] buy ${host} ${gb}GB`);
  }
}
