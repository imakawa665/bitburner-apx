
/** workers/apx-hack.sched.v1.js
 * usage: run workers/apx-hack.sched.v1.js <target> <delayMs>
 */
export async function main(ns){
  const target=String(ns.args[0]||'n00dles');
  const delay=Number(ns.args[1]||0);
  if(delay>0) await ns.sleep(delay);
  try{ await ns.hack(target); }catch{}
}
