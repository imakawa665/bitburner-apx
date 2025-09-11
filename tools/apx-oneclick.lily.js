/** tools/apx-oneclick.lily.js
 * ワンクリ起動ランチャー
 * - 既存の APX 構成を一括起動（HUD / rooter / micro / pserv.auto / hacknet.nano / share）
 * - 既に起動中なら重複起動しません
 * - オプションで簡易バッチャも起動可能（--withBatcher）
 * 使い方:
 *   run tools/apx-oneclick.lily.js
 *   run tools/apx-oneclick.lily.js --withBatcher --target joesguns --hackPct 0.03 --gap 200
 *   run tools/apx-oneclick.lily.js --noShare --pservBudget 0.4
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([
    // 起動トグル
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    // pserv 設定
    ['pservBudget', 0.5], ['pservMin', 64], ['pservMax', 8192],
    // share 設定
    ['sharePct', 0.25],   // 空きRAMの何割を share に使うか（0.0〜0.9程度で）
    // 簡易バッチャ（任意）
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200],
  ]);

  const exists = (f)=>ns.fileExists(f,'home');
  const is = (f)=>ns.isRunning(f,'home');
  const runOnce = (f, th=1, ...args)=>{
    if (!exists(f)) { ns.tprint(`[oneclick] missing: ${f}`); return 0; }
    if (is(f)) return 1;
    const pid = ns.run(f, th, ...args);
    if (pid===0) ns.tprint(`[oneclick] failed to run: ${f}`);
    return pid?1:0;
  };

  // 1) rooter
  if (F.rooter) runOnce('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');

  // 2) HUD
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');

  // 3) micro（高RAM向け）
  if (F.micro) runOnce('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true');

  // 4) pserv 自動メンテ
  if (F.pserv) runOnce('tools/apx-pserv.auto.v1.js', 1, '--budget', F.pservBudget, '--minRam', F.pservMin, '--maxRam', F.pservMax);

  // 5) Hacknet
  if (F.hacknet) runOnce('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2, '--maxROI', 3600);

  // 6) 簡易バッチャ（任意）
  if (F.withBatcher) {
    const args = [];
    if (F.target) args.push('--target', String(F.target));
    args.push('--hackPct', Number(F.hackPct));
    args.push('--gap', Number(F.gap));
    runOnce('tools/apx-hgw-batcher.v1.js', 1, ...args);
  }

  // 7) share（空きRAMの一定割合で起動）
  if (F.share) {
    await ns.sleep(250); // 直前に起動したプロセスのRAM反映を待つ
    const file='tools/apx-share.nano.v1.js';
    if (exists(file)) {
      let cost = ns.getScriptRam(file, 'home'); if (!isFinite(cost) || cost<=0) cost = 1.6;
      const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home');
      const free=Math.max(0, max-used);
      let th = Math.floor((free * Math.min(Math.max(0, Number(F.sharePct)), 0.9)) / cost);
      th = Math.max(0, th);
      if (th >= 1) runOnce(file, th);
      else ns.print(`[oneclick] share: 空きRAM不足のためスキップ (free=${free.toFixed(1)}GB)`);
    } else ns.print(`[oneclick] missing: ${file}`);
  }

  ns.tprint(`[oneclick] 起動完了: HUD=${F.hud} rooter=${F.rooter} micro=${F.micro} pserv=${F.pserv} hacknet=${F.hacknet} share=${F.share} batcher=${F.withBatcher}`);
  // ランチャー自体は終了
}