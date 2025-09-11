/** tools/apx-share.nano.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  while (true) { await ns.share(); await ns.sleep(1); }
}
