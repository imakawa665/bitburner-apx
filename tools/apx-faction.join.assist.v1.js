
export async function main(ns){
  ns.disableLog('sleep');
  while(true){
    try{
      const list = ns.singularity?.checkFactionInvitations?.()||[];
      for(const f of list){ try{ ns.singularity?.joinFaction?.(f); ns.tprint('[faction] joined '+f); }catch{} }
    }catch{}
    await ns.sleep(5000);
  }
}
