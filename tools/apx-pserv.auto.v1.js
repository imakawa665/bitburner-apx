
/** tools/apx-pserv.auto.v1.js - loop buyer wrapper */
export async function main(ns){
  const F=ns.flags([['minRam',8],['maxRam',16384],['budget',0.3],['interval',5000]]);
  while(true){ try{ ns.run('tools/apx-pserv.nano.v1.js',1,'--minRam',F.minRam,'--maxRam',F.maxRam,'--budget',F.budget); }catch{} await ns.sleep(Math.max(1000,Number(F.interval)||5000)); }
}
