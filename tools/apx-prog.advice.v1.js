/** apx-prog.advice.v1.js
 * プログラム / ルート化状況をチェックし、次アクションの指針を表示（Singularity不要）
 * LOG: 欠品や到達可能サーバを ns.tprint で一覧
 * @param {NS} ns
 */
export async function main(ns) {
  const have = (f)=>ns.fileExists(f,'home');
  const list = ['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'];
  const owned = list.filter(have);
  const missing = list.filter(p=>!have(p));
  const me=ns.getPlayer().skills.hacking;
  const zero=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
  const canReach = zero.filter(h=>ns.serverExists(h)&&ns.getServerRequiredHackingLevel(h)<=me);
  ns.tprint(`[prog.advice] Owned: ${owned.join(', ')||'-'}`);
  ns.tprint(`[prog.advice] Missing: ${missing.join(', ')||'-'}`);
  if(!have('NUKE.exe')) ns.tprint(`[prog.advice] 提案: まず NUKE.exe を作成/購入（Tor→darkweb→NUKE、または Create Program で生成）`);
  const needPorts = canReach.filter(h=>ns.getServerNumPortsRequired(h)===0).map(h=>h); // 0ポート対象
  ns.tprint(`[prog.advice] 0ポート候補: ${needPorts.join(', ')||'-'} （NUKE.exe があれば即root可能）`);
  ns.tprint(`[prog.advice] 手順ヒント: Terminal → 'buy -l' で価格一覧, 'connect darkweb' → 'buy NUKE.exe' → rooter を実行`);
}
