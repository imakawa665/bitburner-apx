
/** tools/apx-faction.join.assist.v1.js - auto-accept faction invitations */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  while(true){
    try{ const inv=ns.singularity?.checkFactionInvitations?.()||[]; for(const f of inv){ try{ ns.singularity.joinFaction?.(f); ns.tprint('[faction] joined '+f); }catch{} } }catch{}
    await ns.sleep(5000);
  }
}
