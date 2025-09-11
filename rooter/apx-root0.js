/** apx-root0.js
 * 0ポート鯖を一括NUKE（Singularity不要）
 * @param {NS} ns
 */
export async function main(ns) {
  const zero=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
  const me=ns.getPlayer().skills.hacking;
  for(const h of zero){
    if(!ns.serverExists(h)) continue;
    const req=ns.getServerRequiredHackingLevel(h), ports=ns.getServerNumPortsRequired(h);
    if(ports===0 && req<=me){
      if(!ns.hasRootAccess(h) && ns.fileExists('NUKE.exe','home')){ try{ ns.nuke(h); ns.tprint('Rooted: '+h); }catch{} }
    }
  }
}
