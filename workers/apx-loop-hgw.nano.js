/** workers/apx-loop-hgw.nano.js - safe HGW loop */
export async function main(ns){
  const target=String(ns.args[0]||'n00dles');
  while(true){
    try{
      if(!ns.hasRootAccess(target)){ await ns.sleep(2000); continue; }
      const sv=ns.getServer(target);
      if(sv.hackDifficulty > (sv.minDifficulty||1)+5) await ns.weaken(target);
      else if(sv.moneyAvailable < Math.max(1, (sv.moneyMax||1)*0.9)) await ns.grow(target);
      else await ns.hack(target);
    }catch{ await ns.sleep(500); }
  }
}
