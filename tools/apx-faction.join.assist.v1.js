/** tools/apx-faction.join.assist.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  try{
    if (ns.singularity?.checkFactionInvitations){
      const inv=ns.singularity.checkFactionInvitations(); for(const f of inv){ ns.singularity.joinFaction(f); ns.tprint(`[faction] joined: ${f}`); }
    } else {
      ns.print('[faction] Singularity未所持: 招待は通知から手動承諾してください');
    }
  }catch{} await ns.sleep(1);
}
