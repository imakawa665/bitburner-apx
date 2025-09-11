/** apx-hacknet.nano.v1.js
 * Hacknet自動投資（超軽量）
 * - 予算割合(--budget)の範囲で、費用対効果の高いアクションを1ステップずつ実行
 * - ループし続ける常駐型（--onceで1ステップだけ）
 * 例:
 *   run apx-hacknet.nano.v1.js --budget 0.3 --interval 5000
 *
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('hacknet.getPurchaseNodeCost');
  const F = ns.flags([
    ['budget', 0.5],       // 所持金の何割まで使うか
    ['interval', 5000],    // 試行間隔(ms)
    ['once', false],       // trueなら1回だけ最良手を実行
  ]);

  const canSpend = () => ns.getServerMoneyAvailable('home') * Math.max(0, Math.min(1, F.budget));

  // コスパ指標: $/rate（安いほど良い）
  const score = (cost, deltaRate) => (deltaRate > 0 ? cost / deltaRate : Infinity);

  const step = () => {
    const budget = canSpend();
    const H = ns.hacknet;
    const n = H.numNodes();
    let best = {kind:'none', idx:-1, cost:Infinity, s:Infinity};

    // 1) 新規購入
    const pc = H.getPurchaseNodeCost();
    if (pc <= budget) best = {kind:'buy', idx:n, cost:pc, s:pc/1}; // deltaRateは概算1/hacknet tick

    // 2) 既存ノードの強化
    for (let i=0; i<n; i++) {
      const st = H.getNodeStats(i);
      // レベル
      const lc = H.getLevelUpgradeCost(i, 1);
      if (lc <= budget) {
        // 収益増分の概算：0.1 * (production multiplier) 程度に簡略化
        const ds = 0.1; const s = score(lc, ds);
        if (s < best.s) best = {kind:'level', idx:i, cost:lc, s};
      }
      // RAM
      const rc = H.getRamUpgradeCost(i, 1);
      if (rc <= budget) {
        const ds = 0.15; const s = score(rc, ds);
        if (s < best.s) best = {kind:'ram', idx:i, cost:rc, s};
      }
      // コア
      const cc = H.getCoreUpgradeCost(i, 1);
      if (cc <= budget) {
        const ds = 0.25; const s = score(cc, ds);
        if (s < best.s) best = {kind:'core', idx:i, cost:cc, s};
      }
      // キャッシュ（お好みで低優先）
      const kc = H.getCacheUpgradeCost(i, 1);
      if (kc <= Math.min(budget, 1e6)) { // キャッシュは安いときだけ
        const ds = 0.02; const s = score(kc, ds);
        if (s < best.s) best = {kind:'cache', idx:i, cost:kc, s};
      }
    }

    // 実行
    let ok = false;
    switch (best.kind) {
      case 'buy': ok = ns.hacknet.purchaseNode() !== -1; break;
      case 'level': ok = ns.hacknet.upgradeLevel(best.idx, 1); break;
      case 'ram': ok = ns.hacknet.upgradeRam(best.idx, 1); break;
      case 'core': ok = ns.hacknet.upgradeCore(best.idx, 1); break;
      case 'cache': ok = ns.hacknet.upgradeCache(best.idx, 1); break;
    }
    if (ok) ns.print(`[hacknet] ${best.kind} @${best.idx} $${Math.round(best.cost).toLocaleString()}`);
    return ok;
  };

  do {
    step();
    if (F.once) break;
    await ns.sleep(Math.max(1000, F.interval));
  } while (true);
}