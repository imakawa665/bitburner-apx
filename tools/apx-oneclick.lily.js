/** tools/apx-oneclick.lily.js
 * ワンクリ起動ランチャー（Aug後チューニング版）
 * - HUD / rooter / micro / pserv.auto / hacknet.nano / share / (任意) spread / (任意) backdoor.guide / (任意) batcher / (任意) prog.advice
 * - 既に起動中なら重複起動しません
 * LOG: 各フェーズの実行結果を ns.print / ns.tprint で表示
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([
    // 起動トグル
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    ['spread', false], ['backdoor', true], ['advice', true],
    // pserv 設定（Aug直後は低めに）
    ['pservBudget', 0.3], ['pservMin', 8], ['pservMax', 8192],
    // share 設定
    ['sharePct', 0.25],
    // 簡易バッチャ（任意）
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200],
    // 表示
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[oneclick]',...a); };

  const exists = (f)=>ns.fileExists(f,'home');
  const is = (f)=>ns.isRunning(f,'home');
  const runOnce = (f, th=1, ...args)=>{
    if (!exists(f)) { ns.tprint(`[oneclick] missing: ${f}`); return 0; }
    if (is(f)) { print('already',f); return 1; }
    const pid = ns.run(f, th, ...args);
    if (pid===0) ns.tprint(`[oneclick] failed to run: ${f}`); else print('start',f,'pid',pid,'args',JSON.stringify(args));
    return pid?1:0;
  };

  // 1) 補助（アドバイス）
  if (F.advice) runOnce('tools/apx-prog.advice.v1.js');

  // 2) rooter
  if (F.rooter) runOnce('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');

  // 3) HUD
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');

  // 4) micro（高RAM向け）
  if (F.micro) runOnce('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true', '--log', 'true');

  // 5) pserv 自動メンテ（Aug直後は低RAMから段階的に）
  if (F.pserv) runOnce('tools/apx-pserv.auto.v1.js', 1, '--budget', F.pservBudget, '--minRam', F.pservMin, '--maxRam', F.pservMax, '--log', 'true');

  // 6) Hacknet
  if (F.hacknet) runOnce('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2, '--maxROI', 3600, '--log', 'true');

  // 7) 簡易バッチャ（任意）
  if (F.withBatcher) {
    const args = []; if (F.target) args.push('--target', String(F.target)); args.push('--hackPct', Number(F.hackPct)); args.push('--gap', Number(F.gap), '--log', 'true');
    runOnce('tools/apx-hgw-batcher.v1.js', 1, ...args);
  }

  // 8) spread（任意）
  if (F.spread) { const args = []; if (F.target) args.push('--target', String(F.target)); runOnce('tools/apx-spread.remote.v1.js', 1, ...args); }

  // 9) share（空きRAMの一定割合で起動）
  if (F.share) {
    await ns.sleep(250); // 直前に起動したプロセスのRAM反映を待つ
    const file='tools/apx-share.nano.v1.js';
    if (exists(file)) {
      let cost = ns.getScriptRam(file, 'home'); if (!isFinite(cost) || cost<=0) cost = 1.6;
      const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0, max-used);
      let th = Math.floor((free * Math.min(Math.max(0, Number(F.sharePct)), 0.9)) / cost); th = Math.max(0, th);
      if (th >= 1) runOnce(file, th); else print('share: 空きRAM不足',free.toFixed(1),'GB');
    } else print('missing share nano');
  }

  // 10) backdoor ガイド（常時ウォッチ）
  if (F.backdoor) runOnce('tools/apx-backdoor.guide.v1.js', 1, '--watch', 2000);

  ns.tprint(`[oneclick] 起動完了: HUD=${F.hud} rooter=${F.rooter} micro=${F.micro} pserv=${F.pserv} hacknet=${F.hacknet} share=${F.share} spread=${F.spread} batcher=${F.withBatcher}`);
}
