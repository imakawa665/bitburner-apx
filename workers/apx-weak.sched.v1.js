
/** workers/apx-weak.sched.v1.js */
export async function main(ns){
  const target=String(ns.args[0]||'n00dles');
  const delay=Number(ns.args[1]||0);
  if(delay>0) await ns.sleep(delay);
  try{ await ns.weaken(target); }catch{}
}
