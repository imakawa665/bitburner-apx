/** apx-hacknet.nano.v1.js
 * Hacknet の超軽量オート強化（ROIベース簡易版）
 * - 予算の一定割合(--budget)の範囲で、"費用/収益" が最短のアップグレードを1つずつ実行
 * - ROIが --maxROI 秒より長い投資はスキップ（既定 3600秒 = 1h）
 * 例:
 *   run apx-hacknet.nano.v1.js --budget 0.2 --maxROI 3600 --interval 5000
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable');
  const F = ns.flags([['budget',0.2],['maxROI',3600],['interval',5000]]);
  const cost = {
    node: ()=>ns.hacknet.getPurchaseNodeCost(),
    level:(i)=>ns.hacknet.getLevelUpgradeCost(i,1),
    ram:(i)=>ns.hacknet.getRamUpgradeCost(i,1),
    core:(i)=>ns.hacknet.getCoreUpgradeCost(i,1),
  };
  const gainInc = (i, type)=>{
    const s=ns.hacknet.getNodeStats(i);
    const base=s.production;
    // 1単位アップグレード後の増加量を簡易推定（公式式に近似）
    if(type==='level') return (s.level+1)/(s.level) * base - base;
    if(type==='ram')   return base * 0.07; // ラム/コアは近似（軽量化のため）
    if(type==='core')  return base * 0.04;
    return 0;
  };
  while(true){
    const n=ns.hacknet.numNodes(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
    let best = null;
    // 新規ノードも候補
    if (cost.node() <= budget) best = {type:'node', idx:n, c:cost.node(), dGain:ns.hacknet.getNodeStats(0)?.production || 1};
    for(let i=0;i<n;i++){
      for(const type of ['level','ram','core']){
        const c = cost[type](i);
        if(c>budget) continue;
        const d = gainInc(i,type);
        if(d<=0) continue;
        const roi = c / d; // 秒あたり増分を仮に$とみなす（相対比較用）
        if(!best || roi < best.roi){ best = {type, idx:i, c, d, roi}; }
      }
    }
    if (best && (!best.roi || best.roi <= F.maxROI)) {
      if (best.type==='node') ns.hacknet.purchaseNode();
      else if (best.type==='level') ns.hacknet.upgradeLevel(best.idx,1);
      else if (best.type==='ram')   ns.hacknet.upgradeRam(best.idx,1);
      else if (best.type==='core')  ns.hacknet.upgradeCore(best.idx,1);
      ns.print(`[hacknet.nano] upgraded: ${best.type} @${best.idx} cost=$${Math.round(best.c)} roi≈${Math.round(best.roi||0)}s`);
    }
    await ns.sleep(F.interval);
  }
}