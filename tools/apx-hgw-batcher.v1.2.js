/** tools/apx-hgw-batcher.v1.2.js - simple batch orchestrator */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['target','n00dles'],['hackPct',0.05],['gap',200],['lanes',2]]);
  const t=String(F.target||'n00dles'); const gap=Math.max(50,Number(F.gap)||200);
  while(true){
    try{
      if(!ns.hasRootAccess(t)){ await ns.sleep(2000); continue; }
      const thH = Math.max(1, Math.floor(ns.hackAnalyzeThreads(t, (ns.getServerMaxMoney?.(t)||ns.getServer(t).moneyMax||1)*Number(F.hackPct||0.05)))||1);
      const thG = Math.max(1, Math.ceil(ns.growthAnalyze(t, 1.0/(1-Number(F.hackPct||0.05)))));
      const secGain = (ns.hackAnalyzeSecurity(thH, t) + ns.growthAnalyzeSecurity(thG, t));
      const thW = Math.max(1, Math.ceil(secGain / ns.weakenAnalyze(1)));
      const hTime=ns.getHackTime(t), gTime=ns.getGrowTime(t), wTime=ns.getWeakenTime(t);
      // schedule: W1 -> H -> G -> W2 (finish aligned)
      const now = Date.now();
      const end = now + wTime + 200;
      const tH = end - hTime - gap*2, tG = end - gTime - gap, tW1 = now, tW2 = end - wTime;
      // launch
      if (Date.now() <= tW1+20) ns.run('workers/apx-w1.js', thW, t);
      await ns.sleep(Math.max(0, tH-Date.now())); ns.run('workers/apx-h1.js', thH, t);
      await ns.sleep(Math.max(0, tG-Date.now())); ns.run('workers/apx-g1.js', thG, t);
      await ns.sleep(Math.max(0, tW2-Date.now())); ns.run('workers/apx-w1.js', thW, t);
      await ns.sleep(10);
    }catch{ await ns.sleep(500); }
  }
}
