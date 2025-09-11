/** tools/apx-share.nano.v1.js
 * 余りRAMで share() を回して派閥Rep獲得速度を底上げ（1.6GB/スレ）
 * @param {NS} ns */
export async function main(ns){
  ns.disableLog('sleep');
  while (true) { await ns.share(); await ns.sleep(1); }
}
