/** apx-loop-hgw.nano.js
 * ターゲット固定の超軽量 HGW ループ（購入サーバ向け）
 * @param {NS} ns
 */
export async function main(ns) {
  const F = ns.flags([['target','n00dles'],['secPad',0.5],['moneyThr',0.95],['sleep',500]]);
  const t = String(F.target);
  while (true) {
    const min = ns.getServerMinSecurityLevel(t);
    const sec = ns.getServerSecurityLevel(t);
    const max = ns.getServerMaxMoney(t);
    const cur = ns.getServerMoneyAvailable(t);
    if (sec > min + F.secPad) await ns.weaken(t);
    else if (max > 0 && cur < max*F.moneyThr) await ns.grow(t);
    else await ns.hack(t);
    await ns.sleep(F.sleep);
  }
}
