/** tools/apx-reserve.set.v1.js (v1.0) */
export async function main(ns){
  const amt = Number(ns.args[0]||0);
  ns.write('reserve.txt', String(Math.max(0,amt)), 'w');
  ns.tprint(`[reserve] set to ${ns.nFormat(Math.max(0,amt),'$0.00a')}`);
}
