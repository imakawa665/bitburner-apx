/** apx-remote-send.js
 *  Port 20 にいくつかのコマンドを投げる（デモ）
 *  @param {NS} ns
 */
export async function main(ns) {
  ns.writePort(20, JSON.stringify({cmd:'status'}));
  await ns.sleep(300);
  ns.tprint("Send: GYM strength->100");
  ns.writePort(20, JSON.stringify({cmd:'gym', stat:'strength', target:100}));
  await ns.sleep(300);
  ns.tprint("Send: CRIME Mug>=0.75 until 3e6");
  ns.writePort(20, JSON.stringify({cmd:'crime', prefer:'Mug', minChance:0.75, untilMoney:3e6}));
  ns.tprint("Send: UNI Algorithms until hacking 50");
  ns.writePort(20, JSON.stringify({cmd:'uni', course:'Algorithms', until:{hacking:50}}));
}
