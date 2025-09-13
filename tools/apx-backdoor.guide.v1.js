/** tools/apx-backdoor.guide.v1.js - show key servers */
export async function main(ns){
  const list=[['CSEC',60],['avmnite-02h',212],['I.I.I.I',361],['run4theh111z',508],['The-Cave',940]];
  ns.tail(); ns.print('=== Backdoor Guide ===');
  for(const [name,req] of list){
    const root=ns.hasRootAccess(name)?'Y':'-'; ns.print(`${name} | req:${req} | root:${root}`);
  }
  await ns.sleep(60000);
}
