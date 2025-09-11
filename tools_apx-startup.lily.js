/** apx-startup.lily.js
 * APX 一式の起動テンプレ（HUD / rooter / micro / pserv.auto / hacknet.nano）
 * @param {NS} ns
 */
export async function main(ns) {
  const is = (f)=>ns.isRunning(f,'home');
  if (!is('tools/apx-hud.lily.v1.js')) ns.run('tools/apx-hud.lily.v1.js');
  if (!is('rooter/apx-rooter.auto.v1.js')) ns.run('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');
  if (!is('core/apx-core.micro.v2.09.js')) ns.run('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true');
  if (!is('tools/apx-pserv.auto.v1.js')) ns.run('tools/apx-pserv.auto.v1.js', 1, '--budget', 0.5, '--minRam', 64, '--maxRam', 8192);
  if (!is('tools/apx-hacknet.nano.v1.js')) ns.run('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2);
}