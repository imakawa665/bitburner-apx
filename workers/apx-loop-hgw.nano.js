
/** workers/apx-loop-hgw.nano.js (ultra-low RAM) 
 *   A self-balancing HGW loop for a single host → single target.
 *   It never calls hack/grow/weaken unless we have root access and 
 *   only uses 1 thread, so it's safe to spray across many hosts.
 *
 *   usage: run workers/apx-loop-hgw.nano.js <target>
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.clearLog();
  const target = String(ns.args[0] || 'n00dles');
  while (true) {
    try {
      if (!ns.serverExists(target) || !ns.hasRootAccess(target)) { await ns.sleep(2000); continue; }
      const sv = ns.getServer(target);
      // Prefer weaken until sec is near min
      if (sv.hackDifficulty - sv.minDifficulty > 0.5) {
        await ns.weaken(target);
      } else if (sv.moneyAvailable < sv.moneyMax * 0.95) {
        await ns.grow(target);
      } else {
        await ns.hack(target);
      }
    } catch { await ns.sleep(200); }
  }
}
